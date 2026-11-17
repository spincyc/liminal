/* Colophon native TeX: typeset a TeX project into a PDF with WebAssembly TeX.
 *
 * Every engine, format, package and font byte is fetched from the same origin
 * and checked against the size and SHA-256 committed by a runtime manifest
 * before the engine sees it. The engine runs in a disposable worker that can
 * read only those verified files and the caller's project; it never fetches
 * a package from the network. Compilation repeats until the auxiliary files
 * settle, and a log that reports an error, a missing character or a
 * substituted font yields no PDF at all.
 *
 * Loadable as a browser script (global `Colophon`) or a CommonJS module. The
 * browser is the default environment; `options.environment` supplies another
 * (the Node harness in node/harness.js uses it to run the same code in CI).
 *
 * Ported from triptych's src/web/browser/shared/native-tex.js (MIT); the
 * source-bundle, source-pack, deferred-font and edition-receipt features stay
 * with that project.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Colophon = api;
})(typeof self === 'object' ? self : globalThis, function (global) {
  'use strict';

  const RUNTIME_SCHEMA = 'colophon-native-tex-runtime/v1';
  // Bump when the bridge, convergence or output checks change without a
  // change to the runtime pins, so cached PDFs from older code are not reused.
  const IMPLEMENTATION = 'colophon-native-tex-v1';
  const ENGINES = Object.freeze(['pdflatex', 'xelatex']);
  const MAX_RESOURCE = 256 * 1024 * 1024;
  const MAX_PROJECT = 64 * 1024 * 1024;
  const MAX_PASSES = 8;
  const HASH = /^[a-f0-9]{64}$/;
  const PDF_CACHE = 'colophon-native-pdf-v1';
  /* Verified runtime files, keyed by URL and SHA-256, so a browser downloads
     the typesetter once rather than for every PDF. */
  const RUNTIME_CACHE = 'colophon-native-runtime-v1';
  const CACHE_BYTES = 64 * 1024 * 1024;
  const CACHE_ENTRIES = 3;
  const encoder = new TextEncoder();
  let cacheWrites = Promise.resolve();
  let cacheUnavailable = false;
  const RESOURCE_CACHE_WAIT = 15000;

  function cancelled() { return new DOMException('PDF generation cancelled.', 'AbortError'); }
  function stop(signal) { if (signal && signal.aborted) throw cancelled(); }

  function relativePath(value) {
    if (typeof value !== 'string' || !value || value.length > 1024 || value.startsWith('/') ||
        /[\\\x00-\x1f\x7f]/.test(value) || value.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new Error('Invalid TeX project path: ' + String(value).slice(0, 80));
    }
    return value;
  }

  function resourcePin(value) {
    return !!value && HASH.test(value.sha256 || '') && Number.isSafeInteger(value.bytes) &&
      value.bytes > 0 && value.bytes <= MAX_RESOURCE;
  }

  function taskBudget(signal) {
    let resumed = Date.now();
    return async () => {
      stop(signal);
      if (Date.now() - resumed < 8) return;
      // Ready stream reads and digests can otherwise hold the page in one
      // microtask chain; a task boundary lets input and painting proceed.
      await new Promise(resolve => {
        const resume = () => { clearTimeout(timer); signal.removeEventListener('abort', resume); resolve(); };
        const timer = setTimeout(resume, 0);
        signal.addEventListener('abort', resume, { once: true });
        if (signal.aborted) resume();
      });
      stop(signal);
      resumed = Date.now();
    };
  }

  function gzipStream(bytes, signal) {
    const cooperate = taskBudget(signal);
    let offset = 0;
    return new ReadableStream({
      async pull(controller) {
        await cooperate();
        if (offset === bytes.byteLength) { controller.close(); return; }
        const end = Math.min(offset + 128 * 1024, bytes.byteLength);
        controller.enqueue(bytes.subarray(offset, end));
        offset = end;
      }
    }).pipeThrough(new DecompressionStream('gzip'));
  }

  async function readExact(stream, size, signal, onBytes) {
    const reader = stream.getReader();
    const bytes = new Uint8Array(size);
    const cooperate = taskBudget(signal);
    let offset = 0;
    const abort = () => { reader.cancel().catch(() => {}); };
    signal.addEventListener('abort', abort, { once: true });
    try {
      stop(signal);
      while (true) {
        const { value, done } = await reader.read();
        stop(signal);
        if (done) break;
        if (offset + value.byteLength > size) throw new Error('A typesetter resource changed or exceeds its declared size.');
        bytes.set(value, offset);
        offset += value.byteLength;
        if (onBytes) onBytes(value.byteLength);
        await cooperate();
      }
      if (offset !== size) throw new Error('A typesetter resource changed: its body is incomplete.');
      return bytes;
    } finally {
      signal.removeEventListener('abort', abort);
      reader.cancel().catch(() => {});
    }
  }

  function downloadProgress(progress, stage, totalBytes) {
    let loadedBytes = 0;
    let last = -Infinity;
    const publish = () => {
      const now = Date.now();
      if (loadedBytes !== totalBytes && now - last < 500) return;
      last = now;
      const amount = value => (value / (1024 * 1024)).toFixed(1);
      progress(stage + ' (' + amount(loadedBytes) + ' of ' + amount(totalBytes) + ' MiB)…', { stage, loadedBytes, totalBytes });
    };
    publish();
    return amount => { loadedBytes += amount; publish(); };
  }

  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
    }
    return JSON.stringify(value);
  }

  /* The worker bridge keeps the project's cwd and TEXINPUTS, mounts verified
     package bytes under the engine's own lookup names and reports the files
     a compilation opened when tracing (used to derive a runtime subset). */
  const WORKER_BRIDGE = String.raw`
;(function(){
  const originalMessage=self.onmessage;
  const originalCnf=typeof writeTexmfCnf==='function'?writeTexmfCnf:null;
  const originalRun=typeof runMain==='function'?runMain:null;
  let configured=false;
  const packageData=new Map();
  const lookupPaths=new Map();
  const openedPaths=new Set();
  const requestedKeys=new Set();
  let tracing=false;
  const originalPost=self.postMessage;
  function traceKeys(){
    const keys=new Set();
    for(const [key,path] of lookupPaths){if(openedPaths.has(path)||requestedKeys.has(key))keys.add(key);}
    return Array.from(keys).sort();
  }
  self.postMessage=function(message,...rest){
    if(message&&message.cmd==='compile'&&tracing)message={...message,colophonTrace:traceKeys()};
    return originalPost.call(self,message,...rest);
  };
  function startTrace(){
    if(typeof FS.open!=='function'||typeof FS.getPath!=='function'||typeof PATH_FS==='undefined'||
       typeof kpse_find_file_impl!=='function'||typeof UTF8ToString!=='function')return false;
    const open=FS.open;
    FS.open=function(path,...args){
      const stream=open.call(FS,path,...args);
      try{openedPaths.add(FS.getPath(stream.node));}catch(_){}
      try{if(typeof path==='string')openedPaths.add(PATH_FS.resolve(path));}catch(_){}
      return stream;
    };
    const resolve=kpse_find_file_impl;
    kpse_find_file_impl=function(pointer,format,mustexist){
      try{requestedKeys.add(format+'/'+UTF8ToString(pointer).replace(/^[*&]/,''));}catch(_){}
      return resolve(pointer,format,mustexist);
    };
    self.kpse_find_file_impl=kpse_find_file_impl;
    tracing=true;
    return true;
  }
  if(originalRun)runMain=function(program,args){return originalRun(program,['-no-shell-escape','-halt-on-error'].concat(args));};
  self.onmessage=function(event){
    const data=event.data;
    if(data.cmd==='colophon-mkdir'){
      try{FS.mkdirTree('/work/'+data.path);self.postMessage({cmd:data.cmd,result:'ok'});}
      catch(error){self.postMessage({cmd:data.cmd,result:'failed',error:String(error.message)});}
      return;
    }
    if(data.cmd==='colophon-preload'){
      const post=self.postMessage;
      try{
        for(const item of data.payloads){
          if(packageData.has(item.id))throw Error('A package payload was sent twice.');
          packageData.set(item.id,item.data);
        }
        self.postMessage=function(message,...rest){
          if(message.cmd==='preloadtexlive'&&message.result==='ok')return;
          return post.call(self,message,...rest);
        };
        for(const file of data.files){
          const bytes=packageData.get(file.fileId);
          if(!bytes)throw Error('A package payload is missing.');
          let path;
          if(typeof texlive200_cache!=='undefined'){
            if(typeof cacheFileName==='function')path=TEXCACHEROOT+'/'+cacheFileName(file.format,file.filename);
            originalMessage.call(self,{data:{cmd:'preloadtexlive',format:file.format,filename:file.filename,data:bytes}});
          }else{
            let name=file.filename;
            if(file.format===3&&!name.endsWith('.tfm'))name+='.tfm';
            if(file.format===33&&!name.endsWith('.vf'))name+='.vf';
            path='/tex/'+name;
            FS.writeFile(path,new Uint8Array(bytes));
            texlive200[file.format+'/'+file.filename]=path;
          }
          if(path)lookupPaths.set(file.format+'/'+file.filename,path);
        }
        if(data.final&&!data.retain)packageData.clear();
        post.call(self,{cmd:data.cmd,result:'ok'});
      }catch(error){post.call(self,{cmd:data.cmd,result:'failed',error:String(error.message)});}
      finally{self.postMessage=post;}
      return;
    }
    if(data.cmd==='colophon-take-packages'){
      const payloads=Array.from(packageData,([id,data])=>({id,data}));
      packageData.clear();
      self.postMessage({cmd:data.cmd,result:'ok',payloads},payloads.map(item=>item.data));
      return;
    }
    if(data.cmd==='colophon-configure'){
      try{
        WORKROOT='/work/'+data.cwd;
        FS.chdir(WORKROOT);
        const inputs='.;'+data.texinputs.split(':').filter(Boolean).join(';')+';/tex//';
        if(originalCnf)writeTexmfCnf=function(building){
          originalCnf(building);
          const path=WORKROOT+'/texmf.cnf';
          const value=FS.readFile(path,{encoding:'utf8'}).replace(/^TEXINPUTS\s*=.*$/m,'TEXINPUTS = '+inputs)
            +'\nshell_escape = f\nshell_escape_commands = ,\nfont_max = 9000\n';
          FS.writeFile(path,value);
          if(typeof texlive200_cache==='undefined')FS.writeFile('/work/texmf.cnf',value);
        };
        if(typeof texlive200_cache==='undefined'){
          FS.writeFile('/work/xetex','');
          FS.writeFile('/work/xdvipdfmx','');
          const config=texlive200['26/dvipdfmx.cfg'];
          if(config){
            const bytes=FS.readFile(config,{encoding:'binary'});
            FS.writeFile(WORKROOT+'/dvipdfmx.cfg',bytes);
            FS.writeFile('/work/dvipdfmx.cfg',bytes);
          }
        }
        configured=true;
        if(data.icu)self.icuData=new Uint8Array(data.icu);
        const traced=data.trace?startTrace():false;
        self.postMessage({cmd:data.cmd,result:data.trace&&!traced?'failed':'ok',error:'This engine cannot report the files it opens.'});
      }catch(error){self.postMessage({cmd:data.cmd,result:'failed',error:String(error.message)});}
      return;
    }
    if(data.cmd==='colophon-state'){
      const files=[];let size=0;
      function visit(dir){for(const name of FS.readdir(dir)){
        if(name==='.'||name==='..')continue;
        const path=dir+'/'+name;const stat=FS.stat(path);
        if(FS.isDir(stat.mode)){visit(path);continue;}
        if(/\.(aux|toc|out|lof|lot|lol|ent|idx|ind|bbl|bcf|nav|snm)$/.test(name)){
          const bytes=FS.readFile(path,{encoding:'binary'});size+=bytes.byteLength;
          if(size>67108864)throw Error('Auxiliary files exceed the print limit.');
          files.push({path:path.slice(WORKROOT.length+1),bytes:bytes});
        }
      }}
      try{visit(WORKROOT);self.postMessage({cmd:data.cmd,result:'ok',files:files});}
      catch(error){self.postMessage({cmd:data.cmd,result:'failed',error:String(error.message)});}
      return;
    }
    if(data.cmd==='compilelatex'&&!configured){self.postMessage({cmd:'compile',result:'failed',error:'The working directory was not configured.'});return;}
    return originalMessage.call(self,event);
  };
})();`;

  /* A browser worker: verified bytes become blob URLs, and the worker may
     load only those, never another script, binary or network package. */
  const BROWSER_PRELUDE = String.raw`
const __nativeImport=self.importScripts.bind(self);
const __nativeFetch=self.fetch.bind(self);
self.fetch=function(url,options){
  if(!Object.values(__nativeAssets).includes(String(url)))return Promise.reject(Error('Unverified typesetter resource.'));
  return __nativeFetch(url,options);
};
/* A missing optional package is a normal kpathsea miss: answer locally,
   never make a network request. */
self.XMLHttpRequest=class{
  constructor(){this.status=404;this.response=new ArrayBuffer(0);}
  open(){}
  send(){}
  getResponseHeader(){return null;}
};
self.importScripts=function(...urls){
  for(const url of urls){
    const name=String(url).split('/').pop();
    if(!Object.hasOwn(__nativeAssets,name))throw Error('Unverified typesetter script.');
    if(self.Module)self.Module.locateFile=function(file){
      const target=__nativeAssets[file.split('/').pop()];
      if(!target)throw Error('Unverified typesetter binary.');
      return target;
    };
    __nativeImport(__nativeAssets[name]);
  }
};
`;

  function browserWorker({ controller, assets }) {
    if (typeof global.Worker !== 'function' || typeof global.WebAssembly !== 'object') {
      throw new Error('This browser cannot run the typesetter. Use a browser with WebAssembly and worker support.');
    }
    const urls = [];
    const named = {};
    for (const [name, asset] of Object.entries(assets)) {
      const url = URL.createObjectURL(new Blob([asset.bytes], { type: asset.type }));
      urls.push(url);
      named[name] = url;
    }
    const source = 'const __nativeAssets=' + JSON.stringify(named) + ';\n' + BROWSER_PRELUDE + '\n' + controller;
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    urls.push(url);
    let worker;
    try { worker = new global.Worker(url); }
    catch (error) { urls.forEach(item => URL.revokeObjectURL(item)); throw error; }
    return {
      set onmessage(handler) { worker.onmessage = handler; },
      set onerror(handler) { worker.onerror = handler; },
      postMessage(payload, transfer) { worker.postMessage(payload, transfer); },
      terminate() { worker.terminate(); urls.splice(0).forEach(item => URL.revokeObjectURL(item)); }
    };
  }

  function environment(options) {
    const supplied = options.environment || {};
    const base = supplied.baseURL || (global.document && global.document.baseURI) || (global.location && global.location.href);
    if (!base) throw new Error('The typesetter needs a base URL.');
    return {
      baseURL: base,
      fetch: supplied.fetch || ((url, init) => global.fetch(url, init)),
      subtle: (supplied.crypto || global.crypto).subtle,
      caches: Object.prototype.hasOwnProperty.call(supplied, 'caches') ? supplied.caches : () => global.caches,
      createWorker: supplied.createWorker || browserWorker,
    };
  }

  function generate(options) {
    if (!options || typeof options !== 'object') return Promise.reject(new TypeError('generate() needs options.'));
    let env;
    try { env = environment(options); } catch (error) { return Promise.reject(error); }
    return run(options, env);
  }

  async function run(options, env) {
    const outer = new AbortController();
    const signal = outer.signal;
    const upstream = options.signal;
    const relay = () => outer.abort();
    if (upstream) upstream.addEventListener('abort', relay, { once: true });
    if (upstream && upstream.aborted) outer.abort();
    const timer = setTimeout(() => outer.abort(), 20 * 60 * 1000);
    const progress = (message, detail = {}) => {
      if (!signal.aborted && typeof options.onProgress === 'function') options.onProgress({ ...detail, message });
    };

    const origin = new URL(env.baseURL).origin;
    function sameOrigin(value, base) {
      const url = new URL(value, base);
      if (url.origin !== origin || !/^https?:$/.test(url.protocol) || url.username || url.password || url.hash) {
        throw new Error('The typesetter runtime must be served by this website.');
      }
      return url.href;
    }
    async function sha256(bytes) {
      const hash = await env.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
    }
    const keepResources = options.cache !== false;
    async function verified(url, pin, localSignal, onBytes) {
      if (!resourcePin(pin)) throw new Error('A typesetter resource has no valid size and SHA-256 commitment.');
      stop(localSignal);
      const key = keepResources ? resourceKey(url, pin) : null;
      if (key) {
        // A kept copy is verified again; a changed or unreadable one is dropped.
        const kept = await cacheAccess(env, async (cache, cacheSignal) => {
          const response = await cache.match(key);
          if (!response) return null;
          try {
            const bytes = await readExact(response.body, pin.bytes, cacheSignal);
            if (await sha256(bytes) !== pin.sha256) throw new Error('Changed runtime file.');
            return bytes;
          } catch (_) { await cache.delete(key); return null; }
        }, localSignal, RUNTIME_CACHE, RESOURCE_CACHE_WAIT);
        stop(localSignal);
        if (kept) { if (onBytes) onBytes(kept.byteLength); return kept; }
      }
      const response = await env.fetch(url, { signal: localSignal, credentials: 'omit', redirect: 'error' });
      if (!response.ok) throw new Error('A typesetter resource could not be loaded (' + response.status + ').');
      const length = response.headers.get('content-length');
      if (length && Number(length) > MAX_RESOURCE) throw new Error('A typesetter resource exceeds its permitted size.');
      const bytes = await readExact(response.body, pin.bytes, localSignal, onBytes);
      stop(localSignal);
      if (await sha256(bytes) !== pin.sha256) throw new Error('A typesetter resource changed. Reload the page and try again.');
      if (key) {
        await cacheAccess(env, cache => cache.put(key, new Response(bytes.slice(), { headers: {
          'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes.byteLength) } })), localSignal, RUNTIME_CACHE, RESOURCE_CACHE_WAIT);
      }
      return bytes;
    }
    async function pool(items, action, count = 6) {
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal.addEventListener('abort', abort, { once: true });
      let cursor = 0;
      let failure;
      const result = new Array(items.length);
      try {
        await Promise.allSettled(Array.from({ length: Math.min(count, items.length) }, async () => {
          try {
            while (cursor < items.length) {
              stop(controller.signal);
              const i = cursor++;
              result[i] = await action(items[i], controller.signal);
            }
          } catch (error) { if (!failure) failure = error; abort(); }
        }));
        if (failure) throw failure;
        stop(signal);
        return result;
      } finally { signal.removeEventListener('abort', abort); }
    }
    function transportPin(pin, base) {
      if (!resourcePin(pin) || typeof pin.url !== 'string') throw new Error('Invalid typesetter resource.');
      sameOrigin(pin.url, base);
      if (pin.transport !== undefined) {
        if (!resourcePin(pin.transport) || pin.transport.compression !== 'gzip' || typeof pin.transport.url !== 'string') {
          throw new Error('Invalid compressed typesetter resource.');
        }
        sameOrigin(pin.transport.url, base);
      }
      return pin.transport && typeof DecompressionStream === 'function' ? pin.transport : pin;
    }
    async function engineResource(pin, base, localSignal, onBytes) {
      const delivered = transportPin(pin, base);
      const bytes = await verified(sameOrigin(delivered.url, base), delivered, localSignal, onBytes);
      if (delivered === pin) return bytes;
      const expanded = await readExact(gzipStream(bytes, localSignal), pin.bytes, localSignal);
      if (await sha256(expanded) !== pin.sha256) throw new Error('A decompressed typesetter resource failed verification.');
      stop(localSignal);
      return expanded;
    }

    let worker = null;
    let converter = null;
    try {
      stop(signal);
      const engine = options.engine || 'pdflatex';
      if (!ENGINES.includes(engine)) throw new Error('Unsupported TeX engine: ' + engine);
      const project = await projectFiles(options, sha256);
      const runtimeURL = sameOrigin(options.runtimeURL, env.baseURL);
      const pinned = options.runtimeSHA256 !== undefined || options.runtimeBytes !== undefined;
      progress('Checking the typesetter…', { stage: 'runtime' });
      let runtimeBody;
      if (pinned) {
        const request = new URL(runtimeURL);
        // The content pin makes the manifest URL an immutable HTTP cache key.
        request.searchParams.set('sha256', options.runtimeSHA256);
        runtimeBody = await verified(request.href, { sha256: options.runtimeSHA256, bytes: options.runtimeBytes }, signal);
      } else {
        const response = await env.fetch(runtimeURL, { signal, credentials: 'omit', redirect: 'error', cache: 'no-cache' });
        if (!response.ok) throw new Error('The typesetter runtime is unavailable (' + response.status + ').');
        runtimeBody = new Uint8Array(await response.arrayBuffer());
        if (runtimeBody.byteLength > MAX_RESOURCE) throw new Error('The typesetter runtime manifest is too large.');
      }
      let runtime;
      try { runtime = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(runtimeBody)); }
      catch (_) { throw new Error('The typesetter runtime manifest is not valid UTF-8 JSON.'); }
      if (!runtime || runtime.schema !== RUNTIME_SCHEMA || typeof runtime.id !== 'string' || !runtime.engines ||
          !Array.isArray(runtime.texFiles) || runtime.texFiles.length > 50000) {
        throw new Error('Unsupported typesetter runtime manifest.');
      }
      const runtimeSHA256 = await sha256(runtimeBody);
      const descriptor = runtime.engines[engine];
      if (!descriptor || !descriptor.format) throw new Error('The ' + engine + ' typesetter is not in this runtime.');
      const engines = engine === 'xelatex' ? [descriptor, runtime.engines.dvipdfmx] : [descriptor];
      if (engine === 'xelatex' && !descriptor.icu) throw new Error('The Unicode font data is not in this runtime.');
      for (const item of engines) {
        if (!item) throw new Error('The ' + engine + ' typesetter is not in this runtime.');
        for (const pin of [item.worker, item.core, item.wasm, ...(item.support || []),
          ...(item.format ? [item.format] : []), ...(item.icu ? [item.icu] : [])]) transportPin(pin, runtimeURL);
      }
      if (descriptor.format.url.endsWith('.gz') && typeof DecompressionStream !== 'function') {
        throw new Error('This browser cannot unpack the TeX format. Use a browser with gzip decompression support.');
      }

      const key = options.cache === false || options.trace ? null : await cacheKey(project, engine, runtime.id, runtimeSHA256, runtimeURL, sha256);
      if (key) {
        const cached = await cachedPDF(env, key, signal, sha256);
        stop(signal);
        if (cached) {
          progress('The PDF is ready.', { stage: 'ready' });
          return { ...cached, runtime: runtime.id, engine };
        }
      }

      const texFiles = await packageFiles(runtime, runtimeURL, engine);
      worker = await engineWorker(descriptor, runtimeURL);
      let icu = null;
      if (engine === 'xelatex') {
        const downloaded = downloadProgress(progress, 'Downloading Unicode font support', transportPin(descriptor.icu, runtimeURL).bytes);
        icu = await engineResource(descriptor.icu, runtimeURL, signal, downloaded);
      } else {
        await worker.ask({ cmd: 'setpreamblesnapshot', enabled: false });
      }
      progress('Loading fonts and sources into the typesetter…', { stage: 'mount' });
      await mountProject(worker, project, texFiles, icu, engine === 'xelatex', !!options.trace);
      icu = null;
      const format = await formatBytes(descriptor.format, runtimeURL);
      if (engine === 'xelatex') await worker.ask({ cmd: 'writefile', url: 'wasmtex-xetex.fmt', src: format }, 'writefile', [format.buffer]);
      else await worker.ask({ cmd: 'loadformat', data: format.buffer }, 'loadformat', [format.buffer]);
      worker.tell({ cmd: 'setmainfile', url: project.entrypoint });

      const traced = new Set();
      const maxPasses = Number.isSafeInteger(options.maxPasses) && options.maxPasses >= 1 && options.maxPasses <= MAX_PASSES ? options.maxPasses : MAX_PASSES;
      let previous = await auxiliaryState(worker, sha256);
      let result = null;
      let passes;
      let settled = false;
      for (passes = 1; passes <= maxPasses; passes++) {
        progress('Typesetting (pass ' + passes + ')…', { stage: 'typeset', pass: passes });
        result = await worker.ask({ cmd: 'compilelatex' }, 'compile');
        if (Array.isArray(result.colophonTrace)) result.colophonTrace.forEach(item => traced.add(item));
        checkLog(result.log);
        if (result.status !== 0 || !result.pdf) throw logged(new Error('The TeX document did not compile.'), result.log);
        // A pass has converged when the auxiliary files it read are the ones
        // it wrote and the log asks for no further run.
        const current = await auxiliaryState(worker, sha256);
        if (current === previous && !rerunRequested(result.log)) { settled = true; break; }
        previous = current;
      }
      if (!settled) throw logged(new Error('The TeX references did not settle. No incomplete PDF was offered.'), result.log);

      if (engine === 'xelatex') {
        progress('Embedding fonts in the PDF…', { stage: 'convert' });
        await recoverPackages(worker, texFiles, sha256);
        worker.close();
        worker = null;
        converter = await engineWorker(runtime.engines.dvipdfmx, runtimeURL);
        await mountProject(converter, project, texFiles, null, false, !!options.trace);
        const stem = project.entrypoint.split('/').pop().replace(/\.[^.]+$/, '');
        await converter.ask({ cmd: 'writefile', url: stem + '.xdv', src: new Uint8Array(result.pdf) }, 'writefile', [result.pdf]);
        converter.tell({ cmd: 'setmainfile', url: stem + '.xdv' });
        const converted = await converter.ask({ cmd: 'compilepdf' }, 'compile');
        if (Array.isArray(converted.colophonTrace)) converted.colophonTrace.forEach(item => traced.add(item));
        if (converted.status !== 0 || !converted.pdf) throw logged(new Error('The typeset document could not be converted to PDF.'), converted.log);
        checkLog(converted.log);
        converted.log = result.log + '\n' + converted.log;
        result = converted;
      }

      const bytes = new Uint8Array(result.pdf);
      if (bytes.length < 5 || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-' || bytes.length > MAX_RESOURCE) {
        throw logged(new Error('The typesetter did not produce a valid PDF.'), result.log);
      }
      stop(signal);
      const output = { bytes, sha256: await sha256(bytes), byteLength: bytes.byteLength, passes, log: result.log,
        runtime: runtime.id, engine, cached: false };
      if (options.trace) output.trace = Array.from(traced).sort();
      if (key) await rememberPDF(env, key, output, signal);
      if (keepResources) await pruneRuntimes(env, runtimeURL, signal);
      stop(signal);
      progress('The PDF is ready.', { stage: 'ready' });
      return output;
    } finally {
      if (worker) worker.close();
      if (converter) converter.close();
      outer.abort();
      clearTimeout(timer);
      if (upstream) upstream.removeEventListener('abort', relay);
    }

    // A file tagged with engines is mounted only for those engines; an
    // untagged file serves every engine.
    async function packageFiles(runtime, base, engine) {
      const keys = new Set();
      const unique = new Map();
      const selected = runtime.texFiles.filter(file => !file || file.engines === undefined ||
        Array.isArray(file.engines) && file.engines.includes(engine));
      for (const file of selected) {
        if (!file || !Number.isSafeInteger(file.format) || file.format < 0 || file.format > 100 ||
            typeof file.name !== 'string' || !file.name || /[/\\\x00-\x1f]/.test(file.name) ||
            !resourcePin(file) || typeof file.url !== 'string') {
          throw new Error('Invalid TeX package entry in the runtime.');
        }
        const key = file.format + '/' + file.name;
        if (keys.has(key)) throw new Error('Duplicate TeX package entry in the runtime.');
        keys.add(key);
        const id = file.sha256 + ':' + file.bytes;
        const url = sameOrigin(file.url, base);
        if (unique.has(id) && unique.get(id).url !== url) throw new Error('One TeX package has two addresses in the runtime.');
        const pin = { url, sha256: file.sha256, bytes: file.bytes };
        if (file.transport !== undefined) pin.transport = file.transport;
        transportPin(pin, base);
        unique.set(id, pin);
      }
      const payloads = new Map();
      const downloaded = downloadProgress(progress, 'Downloading fonts and packages',
        Array.from(unique.values()).reduce((total, file) => total + transportPin(file, base).bytes, 0));
      await pool(Array.from(unique), async ([id, file], localSignal) => {
        const bytes = await engineResource(file, base, localSignal, downloaded);
        payloads.set(id, bytes.buffer);
      });
      return selected.map(file => ({ format: file.format, filename: file.name,
        fileId: file.sha256 + ':' + file.bytes, data: payloads.get(file.sha256 + ':' + file.bytes) }));
    }

    async function engineWorker(item, base) {
      if (!item || !item.worker || !item.core || !item.wasm) throw new Error('The selected typesetter is not available.');
      const listed = [['worker', item.worker], ['core', item.core], ['wasm', item.wasm]];
      for (const support of item.support || []) listed.push(['support', support]);
      const downloaded = downloadProgress(progress, 'Downloading the typesetter',
        listed.reduce((total, [, pin]) => total + transportPin(pin, base).bytes, 0));
      const values = await pool(listed, async ([role, pin], localSignal) =>
        [role, new URL(pin.url, base).pathname.split('/').pop(), await engineResource(pin, base, localSignal, downloaded)]);
      const assets = {};
      let controller = null;
      for (const [role, name, bytes] of values) {
        if (role === 'worker') controller = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        else assets[name] = { bytes, type: role === 'wasm' ? 'application/wasm' : 'text/javascript' };
      }
      /* The Unicode controllers declare a fixed cwd constant; make only that
         binding configurable so the project need not be rewritten. */
      controller = controller.replace("const WORKROOT = '/work'", "var WORKROOT = '/work'") + '\n' + WORKER_BRIDGE;
      stop(signal);
      progress('Starting the typesetter…', { stage: 'start' });
      const handle = env.createWorker({ controller, assets });
      let active = null;
      let closed = false;
      let readyResolve;
      let readyReject;
      const ready = new Promise((resolve, reject) => { readyResolve = resolve; readyReject = reject; });
      function fail(error) {
        readyReject(error);
        if (active) { const pending = active; active = null; clearTimeout(pending.timer); pending.reject(error); }
      }
      function terminate() { if (!closed) { closed = true; handle.terminate(); } }
      function abort() { fail(cancelled()); terminate(); }
      signal.addEventListener('abort', abort, { once: true });
      handle.onerror = event => { fail(new Error('The typesetter stopped: ' + (event && event.message || 'worker failure'))); terminate(); };
      handle.onmessage = event => {
        const data = event.data;
        if (data && data.result === 'ok' && !data.cmd) { readyResolve(); return; }
        if (active && data && data.cmd === active.expected) {
          const pending = active; active = null; clearTimeout(pending.timer);
          if (data.result === 'failed' && data.cmd !== 'compile') pending.reject(logged(new Error(data.error || 'The typesetter failed.'), data.log));
          else pending.resolve(data);
        }
      };
      const startTimer = setTimeout(() => { fail(new Error('The typesetter did not start in time.')); terminate(); }, 60000);
      try { await ready; stop(signal); }
      catch (error) { terminate(); signal.removeEventListener('abort', abort); throw error; }
      finally { clearTimeout(startTimer); }
      return {
        ask(payload, expected = payload.cmd, transfer = [], timeout = 900000) {
          stop(signal);
          if (closed || active) return Promise.reject(new Error('The typesetter worker is unavailable.'));
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => { fail(new Error('Typesetting exceeded its time limit.')); terminate(); }, timeout);
            active = { resolve, reject, expected, timer };
            try { handle.postMessage(payload, transfer); }
            catch (error) { clearTimeout(timer); active = null; reject(error); }
          });
        },
        tell(payload) { stop(signal); handle.postMessage(payload, []); },
        close() {
          fail(new DOMException('The typesetter worker was closed.', 'AbortError'));
          signal.removeEventListener('abort', abort);
          terminate();
        }
      };
    }

    async function formatBytes(pin, base) {
      const downloaded = downloadProgress(progress, 'Downloading the TeX format', transportPin(pin, base).bytes);
      const bytes = await engineResource(pin, base, signal, downloaded);
      if (!new URL(pin.url, base).pathname.endsWith('.gz')) return bytes;
      const expanded = new Uint8Array(await new Response(gzipStream(bytes, signal)).arrayBuffer());
      if (!expanded.length || expanded.length > 64 * 1024 * 1024) throw new Error('The TeX format exceeds its permitted size.');
      return expanded;
    }

    async function recoverPackages(engineWorker, texFiles) {
      const returned = await engineWorker.ask({ cmd: 'colophon-take-packages' });
      if (!Array.isArray(returned.payloads)) throw new Error('The typesetter did not return its font data.');
      const expected = new Set(texFiles.map(file => file.fileId));
      const payloads = new Map();
      const cooperate = taskBudget(signal);
      for (const item of returned.payloads) {
        stop(signal);
        if (!expected.has(item.id) || payloads.has(item.id) || !(item.data instanceof ArrayBuffer) ||
            item.data.byteLength !== Number(item.id.split(':')[1])) throw new Error('The typesetter returned incomplete font data.');
        if (await sha256(new Uint8Array(item.data)) !== item.id.split(':')[0]) throw new Error('The typesetter changed the font data.');
        payloads.set(item.id, item.data);
        await cooperate();
      }
      if (payloads.size !== expected.size) throw new Error('The typesetter returned incomplete font data.');
      for (const file of texFiles) file.data = payloads.get(file.fileId);
    }
  }

  async function projectFiles(options, sha256) {
    if (!Array.isArray(options.files) || !options.files.length || options.files.length > 10000) {
      throw new Error('generate() needs the project files.');
    }
    const entrypoint = relativePath(options.entrypoint);
    const seen = new Set();
    let total = 0;
    const files = [];
    for (const file of options.files) {
      const path = relativePath(file && file.path);
      if (seen.has(path.toLowerCase())) throw new Error('Duplicate TeX project path: ' + path);
      seen.add(path.toLowerCase());
      const bytes = typeof file.data === 'string' ? encoder.encode(file.data) : file.data instanceof Uint8Array ? file.data.slice() : null;
      if (!bytes) throw new Error('A TeX project file needs string or Uint8Array data.');
      total += bytes.byteLength;
      if (total > MAX_PROJECT) throw new Error('The TeX project exceeds its size limit.');
      files.push({ path: 'project/' + path, bytes, sha256: await sha256(bytes) });
    }
    if (!seen.has(entrypoint.toLowerCase())) throw new Error('The TeX entrypoint is not among the project files.');
    const texinputs = options.texinputs === undefined ? '' : options.texinputs;
    if (typeof texinputs !== 'string' || texinputs.length > 4096 || /[\x00-\x1f\x7f;\\$!{}]/.test(texinputs) ||
        texinputs.split(':').some(part => part && part !== '.' && part !== '..' && !/^[A-Za-z0-9_./-]+$/.test(part))) {
      throw new Error('Unsupported TeX input search path.');
    }
    return { files, cwd: 'project', entrypoint, texinputs };
  }

  async function preloadPackages(worker, texFiles, retain) {
    const sent = new Set();
    let files = [];
    let payloads = [];
    let size = 0;
    async function flush(final) {
      await worker.ask({ cmd: 'colophon-preload', files, payloads, final, retain }, 'colophon-preload',
        Array.from(new Set(payloads.map(item => item.data))));
      files = []; payloads = []; size = 0;
    }
    // Keep every lookup in order: several names can share one payload.
    for (const file of texFiles) {
      const bytes = sent.has(file.fileId) ? 0 : file.data.byteLength;
      if (files.length && (files.length >= 128 || size + bytes > 8 * 1024 * 1024)) await flush(false);
      if (!sent.has(file.fileId)) {
        payloads.push({ id: file.fileId, data: file.data });
        sent.add(file.fileId);
        size += bytes;
      }
      files.push({ format: file.format, filename: file.filename, fileId: file.fileId });
    }
    await flush(true);
  }

  async function mountProject(worker, project, texFiles, icu, retainPackages, trace) {
    await preloadPackages(worker, texFiles, retainPackages);
    const directories = new Set();
    for (const file of project.files) {
      const directory = file.path.split('/').slice(0, -1).join('/');
      if (directory && !directories.has(directory)) {
        await worker.ask({ cmd: 'colophon-mkdir', path: directory });
        directories.add(directory);
      }
      // Each mount gets its own buffer, so a transfer never detaches the caller's.
      const bytes = file.bytes.slice();
      await worker.ask({ cmd: 'writefile', url: file.path, src: bytes }, 'writefile', [bytes.buffer]);
    }
    return worker.ask({ cmd: 'colophon-configure', cwd: project.cwd, texinputs: project.texinputs, trace,
      icu: icu && icu.buffer }, 'colophon-configure', icu ? [icu.buffer] : []);
  }

  async function auxiliaryState(worker, sha256) {
    const state = await worker.ask({ cmd: 'colophon-state' });
    if (!Array.isArray(state.files)) throw new Error('The TeX auxiliary state could not be read.');
    const identities = [];
    for (const file of state.files) identities.push([file.path, await sha256(new Uint8Array(file.bytes))]);
    identities.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    return sha256(encoder.encode(JSON.stringify(identities)));
  }

  function logged(error, log) { if (typeof log === 'string') error.log = log; return error; }

  /* Any error, missing character or substituted font refuses the PDF: a
     document is typeset completely in its own fonts or not at all. */
  const FATAL = /(?:^|\n)!|Fatal error|Emergency stop|no output PDF file|Missing character:|Font .*not loadable|font .*not found|Font shape[\s\S]{0,300}?undefined|Some font shapes were not available,\s*defaults substituted/i;
  function checkLog(log) {
    if (typeof log !== 'string' || FATAL.test(log)) {
      throw logged(new Error('The document could not be typeset completely. No substitute PDF was created.'), log);
    }
  }
  function rerunRequested(log) {
    return /undefined references|undefined citations|There were undefined|Rerun to get|Label\(s\) may have changed|Please (?:re)?run|Rerun .*get .*right/i.test(log);
  }

  async function cacheKey(project, engine, runtimeId, runtimeSHA256, runtimeURL, sha256) {
    const files = project.files.map(file => [file.path, file.bytes.byteLength, file.sha256])
      .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    const identity = { implementation: IMPLEMENTATION, runtime: { id: runtimeId, sha256: runtimeSHA256 }, engine,
      entrypoint: project.entrypoint, texinputs: project.texinputs, files };
    const key = await sha256(encoder.encode(canonical(identity)));
    return new URL('colophon-pdf-cache/' + key + '.pdf', runtimeURL).href;
  }

  /* Storage is optional: blocked or slow storage never holds up a PDF. */
  async function cacheAccess(env, action, signal, name = PDF_CACHE, wait = 1000) {
    if (cacheUnavailable || signal.aborted) return null;
    let store;
    try { store = typeof env.caches === 'function' ? env.caches() : env.caches; } catch (_) { return null; }
    if (!store) return null;
    const controller = new AbortController();
    let finish;
    const expiry = new Promise(resolve => { finish = () => resolve(null); });
    const abort = () => { controller.abort(); finish(); };
    signal.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => { cacheUnavailable = true; abort(); }, wait);
    const task = Promise.resolve().then(async () => {
      const cache = await store.open(name);
      stop(controller.signal);
      return action(cache, controller.signal);
    }).catch(() => null);
    try { return await Promise.race([task, expiry]); }
    finally { clearTimeout(timer); signal.removeEventListener('abort', abort); controller.abort(); }
  }

  function resourceKey(url, pin) {
    const key = new URL(url);
    key.searchParams.set('colophon-sha256', pin.sha256);
    return key.href;
  }
  /* A site serves one runtime at a time: files kept for any other runtime
     directory are removed once this one has produced a PDF. */
  async function pruneRuntimes(env, runtimeURL, signal) {
    const directory = new URL('.', runtimeURL).href;
    await cacheAccess(env, async cache => {
      for (const request of await cache.keys()) {
        const url = String(request && request.url || request);
        if (!url.startsWith(directory)) await cache.delete(request);
      }
    }, signal, RUNTIME_CACHE, RESOURCE_CACHE_WAIT);
  }

  async function cachedPDF(env, key, signal, sha256) {
    return cacheAccess(env, async (cache, localSignal) => {
      const response = await cache.match(key);
      stop(localSignal);
      if (!response) return null;
      try {
        if (response.headers.get('X-Colophon-PDF-Key') !== key) throw new Error('Cached PDF belongs to another document.');
        const size = Number(response.headers.get('Content-Length'));
        const sha = response.headers.get('X-Colophon-PDF-SHA256');
        const passes = Number(response.headers.get('X-Colophon-PDF-Passes'));
        if (!Number.isSafeInteger(size) || size < 5 || size > CACHE_BYTES || !HASH.test(sha || '') ||
            !Number.isSafeInteger(passes) || passes < 1 || passes > MAX_PASSES) throw new Error('Invalid cached PDF.');
        const bytes = await readExact(response.body, size, localSignal);
        if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-' || await sha256(bytes) !== sha) throw new Error('Changed cached PDF.');
        stop(localSignal);
        return { bytes, byteLength: size, sha256: sha, passes, cached: true, log: 'Reused a verified PDF from this browser.' };
      } catch (_) {
        stop(localSignal);
        await cache.delete(key);
        return null;
      }
    }, signal);
  }

  async function prunePDFs(cache) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1000);
    try {
      // Prune after insertion so concurrent tabs' writes are also bounded.
      const keys = await cache.keys();
      stop(controller.signal);
      const held = [];
      let total = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        stop(controller.signal);
        const size = Number(response && response.headers.get('Content-Length'));
        if (!Number.isSafeInteger(size) || size < 5 || size > CACHE_BYTES) await cache.delete(request);
        else { held.push({ request, size }); total += size; }
      }
      while (held.length > CACHE_ENTRIES || total > CACHE_BYTES) {
        const oldest = held.shift();
        await cache.delete(oldest.request);
        total -= oldest.size;
        stop(controller.signal);
      }
    } finally { clearTimeout(timer); }
  }

  async function rememberPDF(env, key, result, signal) {
    if (result.byteLength > CACHE_BYTES) return;
    const write = cacheWrites.then(() => cacheAccess(env, async (cache, localSignal) => {
      stop(localSignal);
      await cache.put(key, new Response(result.bytes, { headers: {
        'Content-Type': 'application/pdf', 'Content-Length': String(result.byteLength),
        'X-Colophon-PDF-Key': key, 'X-Colophon-PDF-SHA256': result.sha256, 'X-Colophon-PDF-Passes': String(result.passes)
      } }));
      await prunePDFs(cache);
    }, signal));
    cacheWrites = write.catch(() => {});
    await write;
  }

  return Object.freeze({ generate, RUNTIME_SCHEMA, IMPLEMENTATION, WORKER_BRIDGE, checkLog, canonical });
});

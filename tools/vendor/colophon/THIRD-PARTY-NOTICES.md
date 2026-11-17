# Third-party notices

Colophon's own code is licensed under the MIT License in `LICENSE`. This file
covers what Colophon carries or delivers from others.

## Triptych

`src/native-tex.js`, `tools/import-triptych-runtime.js` and the runtime
inventory in `runtime/` are adapted from [triptych](https://github.com/spincyc/triptych)
(`src/web/browser/shared/native-tex.js`, `scripts/_native_tex_assets.py`,
`src/common/native-tex-runtime.json`), which are licensed as follows:

```
MIT License

Copyright (c) 2026 Triptych contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## The TeX runtime

The runtime archive and every subset staged from it are not covered by
Colophon's MIT licence. They contain, unmodified:

| Component | Licence | Source |
| --- | --- | --- |
| pdfTeX, XeTeX and dvipdfmx WebAssembly builds and their workers ([WasmTex](https://github.com/corca-ai/wasmtex), TeX Live 2026 sources) | GPL-2.0 (pdfTeX, XeTeX), GPL-2.0-or-later (dvipdfmx); linked libraries under their own terms (LGPL, FreeType, HarfBuzz, ICU, zlib, libpng, Graphite2, TECKit, Xpdf and others) | Complete corresponding source: `correspondingSource` in the manifest (`wasmtex-2026-47ff73bab1a2e548-source.tar.xz`, 156,842,160 bytes, SHA-256 `feb99c1a339643f5711487f75e86505df904df0686b2e71e10750c2766afa225`) |
| WasmTex controllers and SDK | MIT | as above |
| ICU data (`icudt68l.dat`) | Unicode licence | as above |
| LaTeX formats and packages (LaTeX, babel, hyperref, geometry, microtype, fontspec, …) | LPPL 1.3c and package licences | Package source offers in the notices |
| Latin Modern | GUST Font License | `native-tex-font-source-latin-modern.zip` |
| Libertinus (Type 1) | SIL OFL 1.1 | `native-tex-font-source-libertinus-type1.zip` |
| Junicode 2.218 | SIL OFL 1.1 | `native-tex-fonts-junicode-2.218.zip` |
| GNU FreeFont (FreeSerif) | GPL-3.0-or-later with font exception | `native-tex-font-source-freefont-20120503.tar.gz` |
| EC, Computer Modern, AMS fonts, TIPA | their distribution notices, OFL, LPPL | the matching source archives |

The full licence texts, build receipts, the licence manifest and the font and
package source offers are in the runtime's `notices/` and listed in every
manifest's `notices`. `tools/runtime.js stage` publishes them with an
`index.html` that links each notice and the corresponding source. The
release that delivers the archive also carries every source archive named
above. Keep that page reachable wherever a runtime is served.

/* Keep saved links to the former practice home working. The landing page
   itself needs no JavaScript or test-preparation bundles. */
(function () {
  "use strict";

  function redirectPracticeLink() {
    if (/^#(?:practice|progress|review|tips)(?:\/|$)/.test(window.location.hash)) {
      window.location.replace("practice.html" + window.location.search + window.location.hash);
    }
  }

  redirectPracticeLink();
  window.addEventListener("hashchange", redirectPracticeLink);
})();

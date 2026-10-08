/* Keep old course and lesson bookmarks attached to their parent grade. */
(function () {
  "use strict";
  const navigation = window.LiminalNavigation;
  if (!navigation) return;
  const href = navigation.legacyLessonHref(window.LIMINAL_LESSON_MODULES, window.location);
  document.getElementById("legacyLessonLink").href = href;
  window.location.replace(href);
})();

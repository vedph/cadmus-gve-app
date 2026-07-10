// https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/
(function (window) {
  window.__env = window.__env || {};

  // environment-dependent settings
  window.__env.apiUrl = "http://localhost:5092/api/";
  window.__env.version = "7.1.6";
  // enable thesaurus import in thesaurus list for admins
  window.__env.thesImportEnabled = true;
  // renderer settings
  window.__env.multiValuedFeatureIds = "r_hints";

  window.__env.gvePeeperWidth = 20;

  // Zotero
  window.__env.zoteroApiKey = "TODO:YOUR_ZOTERO_KEY";
  window.__env.zoteroUserId = "TODO:YOUR_ZOTERO_USER_ID";
  window.__env.zoteroLibraryId = "TODO:YOUR_ZOTERO_LIBRARY_ID";

   // UI branding: staging, dev, production (default)
  window.__env.branding = "production";
})(this);

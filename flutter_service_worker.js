'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "1b34e25d12dda78b015c5e21da7cc1b0",
"assets/assets/animations/swipe_animations/swipe_white.json": "b2c119a5da6d558b13ca4f628b1918be",
"assets/assets/fonts/AkayaTelivigala-Regular.ttf": "31533526895b179fa322a2856bbd4185",
"assets/assets/icons/app_icons/building_blasting.png": "07d59f8a6b991bd0d4ad486a7d32f003",
"assets/assets/icons/app_icons/finger_balls.png": "d3d6ab436c12220308d3c87b0742276e",
"assets/assets/icons/app_icons/reminder_app.png": "418fb658c611353df5c54b5a2f6039ad",
"assets/assets/icons/app_icons/shape_puzzle.png": "e6f5d8152625409db8ca841a9a195cf7",
"assets/assets/icons/app_icons/shape_to_shape.png": "6670d006c6adb36d05e987f3987dee60",
"assets/assets/icons/app_icons/uni_yemek.png": "19e6727b43fcee0c1fd1e3f6d6668612",
"assets/assets/icons/app_icons/way_to_exit.png": "c8f594a29b9c8616cd07975f2c4a3645",
"assets/assets/icons/pl_icons/android.png": "d44d4bc0c287c93cb1ebf0d6d435bccf",
"assets/assets/icons/pl_icons/c_sharp.png": "0acf381ba81d4f355d60c46e25c0027e",
"assets/assets/icons/pl_icons/dart.png": "51be7d87c5cbb1b201263994a9b2ce9e",
"assets/assets/icons/pl_icons/firebase.png": "a6c26916c900bfa596ff3c52dfa11db0",
"assets/assets/icons/pl_icons/flutter.png": "253ed87163cb803d38d8911557913ee5",
"assets/assets/icons/pl_icons/python.png": "8416f299c2454b56af502f5def141781",
"assets/assets/icons/pl_icons/unity.png": "c11699b0f51396bb18442e1d5b104616",
"assets/assets/icons/social_icons/github.png": "c8f12c8c6380b3243ce210493be9fc5a",
"assets/assets/icons/social_icons/instagram.png": "a8014de8aaa83832110008ce508f6ffd",
"assets/assets/icons/social_icons/linkedin.png": "0f5d6ae131e9a081ee419c6866e783dc",
"assets/assets/images/ciyabox.png": "3fb9a74eb684d2dcd637111f5ab00323",
"assets/assets/images/home_bg.jpg": "a7b8c5faf422ecf375dff2972430a885",
"assets/FontManifest.json": "ceef1876ce8015e4ef8b6ad1d7d0cd18",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "50a43c79977aff694ba714a7e4ba2a5b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "6f90cd403aa586949031e868bb429324",
"icons/Icon-192.png": "336ab7df2a62f1c304463e90745c021b",
"icons/Icon-512.png": "4e90097306e5aa20d1ea4d84b914106c",
"index.html": "febb99fa134cdf993b981f8cd68b500c",
"/": "febb99fa134cdf993b981f8cd68b500c",
"main.dart.js": "b73c2c57a48add269190cf282a756a7c",
"manifest.json": "3e68d2a18ba57b5f5e1e7170d009ed90",
"version.json": "531820dede997f5d9eeb9113b07b497a"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

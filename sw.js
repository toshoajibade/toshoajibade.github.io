self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        '/index.html',
        '/style.css',
        '/index.js',
        'https://free.currencyconverterapi.com/api/v5/countries',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css'
      ]);
    }),
    createDb()
  );
});


self.addEventListener('fetch', function (event) {
  if (event.request.url.includes('/api/v5/convert')) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        // Check cache but fall back to network
        return response || fetch(event.request);
      })
    );
  } else {
    event.respondWith(caches.match(event.request).then(function (response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request).then(function (response) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let responseClone = response.clone();

          caches.open('v1').then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(function () {
          console.log('error')
        });
      }
    }));
  }
});






function createDb() {
  if (!this.indexedDB) {
    console.log("Your");
  }
  var request = this.indexedDB.open("converter", 4);
  request.onerror = function (event) {
    console.log('unsuccessful')
  };
  request.onupgradeneeded = function (event) {
    // Save the IDBDatabase interface 
    let db = event.target.result;
    let objectStore = db.createObjectStore("currencyConverter", { keyPath: "currencyPair" });

    // Create an objectStore for this database
  }

  var request = this.indexedDB.open("converter", 4);
  request.onsuccess = function (event) {
    let db = event.target.result;
    var tx = db.transaction("currencyConverter", "readwrite");
    var store = tx.objectStore("currencyConverter");
  }
};
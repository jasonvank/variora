const PWAVersion = "0.0.2"
const DesktopVersion = "0.0.3"
const cacheName = `VA-${PWAVersion}-${DesktopVersion}`
const cacheAssets = [
]


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: installed and cache data')
      return cache.addAll(cacheAssets).then(() => self.skipWaiting())  // cache display content by default
    })
  )
})


self.addEventListener('activate', event => {
  console.log('SW: active and control this domain')
  event.waitUntil(
    self.clients.claim().then(() => {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== cacheName) {
              console.log('SW: clearing old cache')
              return caches.delete(cache)
            }
          })
        )
      })
    })
  )
})


self.addEventListener('fetch', event => {
  if (event.request.url.includes('/static/') && event.request.method === 'GET')
    event.respondWith(
      caches
        .open(cacheName).then(cache => cache.match(event.request.url))
        .then(response => {

          if (response) {
            // console.log('SW offline: hit  -  ' + event.request.url)
            return response
          } else {
            return fetch(event.request)
              .then(response => {
                const responseClone = response.clone()

                if (event.request.url.includes('/static/'))
                  caches
                    .open(cacheName)
                    .then(cache => {
                      cache.put(event.request.url, responseClone)  // online, so update cache on every call
                    })

                return response
              })
          }

        })
    )
})














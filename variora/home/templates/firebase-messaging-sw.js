importScripts("https://www.gstatic.com/firebasejs/5.5.8/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.5.8/firebase-messaging.js");
let config = {
   messagingSenderId: "241959101179"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();

// this service worker handles notification when app on background.
messaging.setBackgroundMessageHandler(payload => {
   const title = payload.notification.title;
   const options = {
      body: payload.notification.body,
      icon: payload.notification.icon
   }
   return self.registration.showNotification(title, options);
})

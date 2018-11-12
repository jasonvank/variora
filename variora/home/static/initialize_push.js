import firebase from "firebase"
import { getCookie } from 'util.js'


export function initializeWebPush() {
  function isTokenSentToServer() {
    if (window.localStorage.getItem('sentToServer') == 1) {
          return true;
    }
    return false;
  }

  function setTokenSentToServer(sent) {
    if (sent) {
      window.localStorage.setItem('sentToServer', 1);
    } else {
      window.localStorage.setItem('sentToServer', 0);
    }
  }

  const registerServiceWorker = async() => {
    try {
      const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js')
      messaging.useServiceWorker(registration)
      console.log("registerServiceWorker done")
    } catch (error) {
      console.error(error)
      return
    }
  }

  const requestPermission = async() => {
    try {
      await messaging.requestPermission()
      console.log('requestPermission: notification permission granted.')
    } catch (error) {
      console.error(error)
      return
    }
  }

  const sendTokenToServer = async() => {
    try {
      const token = await messaging.getToken()
      if (isTokenSentToServer()) {
        // token already sent
        console.log("sendTokenToServer: already sent to server, won't send again until it changes")
        return
      }
      console.log("sendTokenToServer: ", token)
      const response = await fetch('http://localhost:8000/devices', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
          'registration_id': token,
          'type': 'web',
        }),
        credentials: "include",
      })
      console.log("sendTokenToServer done. response: ", response)
      const json = await response.json()
      console.log("sendTokenToServer done. response json: ", json)
      setTokenSentToServer(true)
    } catch (error) {
      if (error.code === "messaging/permission-blocked") {
        console.log("Please Unblock Notification Request Manually")
      } else {
        console.error(error)
      }
      return
    }
  }

  const initToken = async() => {
    await registerServiceWorker()
    await requestPermission()
    await sendTokenToServer()
  }

  const refreshToken = async() => {
    setTokenSentToServer(false)
    await sendTokenToServer()
  }

  // ============= setup logic ====================
  console.log("registering service worker")
  const config = {
    messagingSenderId: "241959101179"
  }
  firebase.initializeApp(config);
  if (!('serviceWorker' in navigator)) {
    console.log("serviceWorker not in navigator")
  }
  const messaging = firebase.messaging()
  // check if user is authenticated. if not, exit
  initToken()

  //  ============ handler functions ===================
  // called when app has focus
  messaging.onMessage(function(payload) {
    console.log("onMessage called with payload: ", payload);
    // Can update UI to reflect message
        
  });

  // called when instance id token updated
  messaging.onTokenRefresh(function() {
    console.log("onTokenRefresh called")
    refreshToken()
  })
}


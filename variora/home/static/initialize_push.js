import firebase from "firebase"
import { getCookie } from 'util.js'
import { notification } from 'antd'

/* ========= Basic workflow of the web push code ===============
- When user visits page while signed in for the first time:
  - register firebase messaging service worker
  - request for permission to send web push notifications
  - get token from firebase cloud messaging (fcm)
  - sends token to server endpoint which saves it as user-token entry
  - saves to localStorage that token is sent to server
- When user visits page for the 2nd to nth time:
  - skip sending token to server due to cached localStorage
- When user signs out
  * fcm is device-oriented, we make it user-oriented since we will target users with notifications
  * hence need to clean up backend database and ensure that if another user sign in, they won't be mistaken for the prior user
  - invalidate token in fcm
  - delete cache in localStorage - next time a token is gotten from fcm, it will be saved to server
  - call server endpoint to delete corresponding user-token entry in database
- On token refresh: messaging.onTokenRefresh handler
- On web push while app has focus: messaging.onMessage handler
- On web push while app does not have focus: firebase-messaging-sw.js's messaging.setBackgroundMessageHandler
=================================================================
*/

function isTokenSentToServer() {
  if (window.localStorage.getItem('fcmTokenSentToServer') == 1) {
        return true;
  }
  return false;
}

function setTokenSentToServer(sent) {
  if (sent) {
    window.localStorage.setItem('fcmTokenSentToServer', 1);
  } else {
    window.localStorage.setItem('fcmTokenSentToServer', 0);
  }
}

// called when user signs out
export function invalidateToken() {
  setTokenSentToServer(false)
  const deleteToken = async() => {
    try {
      console.debug("deleteToken: invalidating token from fcm") 
      const messaging = firebase.messaging() 
      const token = await messaging.getToken()
      await messaging.deleteToken(token)
      console.debug("deleteToken: deleting record from server")  
      // call server endpoint to cleanup the corresponding row in table
      const response = await fetch(window.location.href + 'devices/delete', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
          'token_id': token
        }),
        credentials: "include",
      })
      console.debug(response)
      console.debug("deleteToken: token deleted")  
    } catch (error) {
      console.error(error)
      return
    }
  }
  return deleteToken()
}

export function initializeWebPush() {
  try {
    const messaging = firebase.messaging()
    const registerServiceWorker = async() => {
      const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js')
      messaging.useServiceWorker(registration)
      console.debug("registerServiceWorker done")
    }
  
    const requestPermission = async() => {
      await messaging.requestPermission()
      console.debug('requestPermission: notification permission granted.')
    }
  
    const sendTokenToServer = async() => {
      const token = await messaging.getToken()
      if (isTokenSentToServer()) {
        console.debug("sendTokenToServer: already sent to server, won't send again until it changes")
        return
      }
      console.debug("sendTokenToServer: not yet sent, sending", token)
      const request = {
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
      }
      console.debug(request)
      const response = await fetch(window.location.href + 'devices', request)
      console.debug("sendTokenToServer done. response: ", response)  
      setTokenSentToServer(true)
    }
  
    const init = async() => {
      try {
        const messaging = firebase.messaging() 
        await registerServiceWorker()
        const token = await messaging.getToken()
        if (token) {
          console.debug("init: token already found")
          await sendTokenToServer()
          return
        }
        console.debug("init: no token available. generating one")
        await requestPermission()
        setTokenSentToServer(false)
        await sendTokenToServer()
      }
      catch (error) {
        console.error(error)
        return
      }
    }
  
    const refreshToken = async() => {
      setTokenSentToServer(false)
      await sendTokenToServer()
    }
  
    // ============= setup logic ====================
    init()
  
    // ============ handler functions ===================
    // called when app has focus
    messaging.onMessage(function(payload) {
      console.debug("onMessage called with payload: ", payload);
      if (payload.notification) {
        const body = payload.notification.body ? payload.notification.body : "This notification does not have a body."
        const title = payload.notification.title ? payload.notification.title : "This notification does not have a title."
        notification['info']({
          message: title,
          description: body,
        });      
      }
    });
  
    // called when instance id token updated
    messaging.onTokenRefresh(function() {
      console.debug("onTokenRefresh called")
      refreshToken()
    })
  

  } catch (error) {
    console.error(error)
    return
  }
}


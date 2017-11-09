function getUrlFormat(urlBase, paraDic) {
  var url = urlBase + '?'
  for (var key in paraDic)
    url = url + key + '=' + paraDic[key] + '&'
  return url
}

// this is the helper function for getting csrf_token
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

export { getCookie, getUrlFormat }



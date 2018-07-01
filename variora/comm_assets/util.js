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


/**
 * every 8ms, check whether the specified img finsih being loaded, if so, call the specified callback function
 * @param  {imgDomElement} img
 * @param  {function} callback
 * @return {undefined}
 */
function imgLoad(img, callback) {
  var timer = setInterval(function() {
    if (img.complete) {
      callback(img);
      clearInterval(timer);
    }
  }, 8);
}


function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}


function formatOpenCoterieDocumentUrl(document, coterieId) {
  return '/coteries/' + coterieId + '/documents/' + document.title.replace(/\s/g, '-') + '/' + document.pk
  // return getUrlFormat('/coterie/display_coteriefile_viewer_page', {
  //   'coterie_id': coterieId,
  //   'document_id': documentId,
  //   'csrfmiddlewaretoken': getCookie('csrftoken'),
  // })
}


function formatOpenDocumentUrl(document) {
  return '/documents/' + document.title.replace(/\s/g, '-') + '/' + document.pk
  // return getUrlFormat('/file_viewer/', {
  //   'document_id': documentId,
  //   'csrfmiddlewaretoken': getCookie('csrftokean'),
  // })
}



export { getCookie, getUrlFormat, imgLoad, hexToRgb, formatOpenCoterieDocumentUrl, formatOpenDocumentUrl }





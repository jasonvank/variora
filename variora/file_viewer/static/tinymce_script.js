import { getCookie } from 'util.js'
import axios from 'axios'


function generateSlug(length) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

function tinymceInit() {
  tinymce.init({
    menubar: false,
    selector: "textarea",
    forced_root_block: false,
    plugins: [
      'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
      'searchreplace visualblocks visualchars codesample fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template paste textcolor'
    ],
    toolbar: [
      'styleselect | bold italic codesample | link image | bullist numlist outdent indent | forecolor | formula'
    ],
    entity_encoding: 'raw',
    indent: false,
    paste_as_text: true,
    branding: false,
    width: 'calc(100% - 2px)',
    default_link_target: "_blank",
    images_upload_handler: function(blobInfo, success, failure) {
      const n = blobInfo.filename()
      const extension = '.' + n.split('.')[n.split('.').length - 1]
      const file = new File([blobInfo.blob()], generateSlug(16) + extension)
      // if (file && file.size > 0.5 * 1024 * 1024) {
      //   layer.alert('Image selected is too big, should be < 0.5 MB <br> <a target="_blank" href="https://compressnow.com/">Compress here</a>', {
      //     skin: 'layui-layer-molv',
      //     btn: 0,
      //     title: false
      //   })
      //   success('')
      //   return false
      // }
      axios.post('https://api.imgur.com/3/upload', {
        image: blobInfo.base64()
      }, {
        headers: {
          'Authorization': 'Client-ID a1f3b6d766ac1cc'
        }
      }).then(function(response) {
        success(response.data.data.link)
      })

      // var data = new FormData()
      // data.append('file_upload', file)
      // data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      // axios.post('/upload-image', data, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // }).then((response) => {
      //   success(response.data.url)
      // })
    },
    setup: function(editor) {
      editor.on('change', function() {
        editor.save()
      })
      editor.addButton('formula', {
        text: 'Formula',
        icon: false,
        onclick: function() {
          editor.insertContent('$$ write LATEX here $$')
        }
      })
    }
  })
  $(document).on('focusin', function(e) {
    // this is to solve the issue of being unable to edit link and image link in bootstrap model
    if ($(e.target).closest('.mce-window').length)
      e.stopImmediatePropagation()
  })
}

export { tinymceInit }

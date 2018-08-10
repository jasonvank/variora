import { getCookie } from 'util.js'

function prepareNavbarFunction() {
  // coterie file viewer pages do not have collect_button
  // only normal file viewer pages have
  $('#collect_button').on('click', function(){
    var span = $(this).find('.fa')
    if (span.hasClass('fa-star-o')) {
      layer.msg('Collected')
      span.removeClass('fa-star-o')
      span.addClass('fa-star')
      $.post({
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'collect',
          document_id: $("button[name='document_id']").val(),
        },
      })
    } else if (span.hasClass('fa-star')) {
      layer.msg('Uncollected')
      span.removeClass('fa-star')
      span.addClass('fa-star-o')
      $.post({
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'uncollect',
          document_id: $("button[name='document_id']").val(),
        },
      })
    }
  })

  $('#show_annotation_frame_button').on('click', function() {
    $('.Annotation').each(function() {
      $(this).slideDown(180)
    })
  })
  $('#hide_annotation_frame_button').on('click', function() {
    $('.Annotation').each(function() {
      $(this).slideUp(180)
    })
  })

  $('#instruction_button').on('click', function() {
    layer.photos({
      photos: {
        'data': [{
          'src': '/media/images/gif/how_to_create_annotation.gif',
          'alt': 'How to create an annotation',
        }]
      },
      shift: 5,
      tab: function(pic, layero){
        $('.layui-layer-imgsee').find('em').remove()
      }
    })
  })

  $('#readlist_button').on('click', function() {
    const popup = layer.open({
      title: false,
      type: 1,
      offset: '28%',
      shade: 0.18,
      shadeClose: true,
      content: $('#readlist'),
      area: '240px',
      closeBtn: false,
      skin: 'layui-layer-molv',
      btn: ['OK'],
      yes: function() {
        var addReadlists = []
        var removeReadlists = []
        for (var readlistCheckbox of $('#add_to_readlist_form').find('.readlist-checkbox').toArray()) {
          readlistCheckbox = $(readlistCheckbox)
          if (readlistCheckbox.attr('checked'))
            addReadlists.push(readlistCheckbox.val())
          else
            removeReadlists.push(readlistCheckbox.val())
        }
        $.post({
          url: '/file_viewer/api/documents/' + $('#document-id').val() + '/changereadlists',
          data: {
            csrfmiddlewaretoken: getCookie('csrftoken'),
            add_readlists: addReadlists,
            remove_readlists: removeReadlists,
          },
          success: function() { layer.close(popup) }
        })
      }
    })
    $('#close-readlist-icon').on('click', function() {
      layer.close(popup)
      $(this).off('click')
    })
  })

  fetch('/file_viewer/api/readlists').then(resp => resp.json()).then((response) => {
    const createdReadlists = response.created_readlists
    var form = $('#add_to_readlist_form')
    const checkboxTemplate = form.find('#checkbox_template')
    for (var readlist of createdReadlists) {
      var newCheckbox = checkboxTemplate.clone()
      newCheckbox.find('label').text(readlist.name)
      newCheckbox.find('input').val(readlist.uuid).addClass('readlist-checkbox')
      newCheckbox.css('display', 'block')
      if (readlist.documents_uuids.includes($('#document-uuid').val()))
        newCheckbox.find('input').attr('checked', 'true')
      form.append(newCheckbox)
    }
    $('#add_to_readlist_form').find('.readlist-checkbox').on('change', function(e) {
      var checkBox = $(e.target)
      checkBox.attr('checked', !checkBox.attr('checked'))
    })
  })
}

export { prepareNavbarFunction }





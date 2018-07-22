import { getCookie, renderMathJax } from 'util.js'
import { tinymceInit } from './tinymce_script'

function getAnnotationDivJQById(annotationID) {
  var selector = '.AnnotationDiv[annotation_id="{0}"]'.format(annotationID)
  return $(selector)
}

function copyToClipboard(content) {
  const temp = $('<input style="hidden: true">')[0]
  document.body.appendChild(temp)
  temp.value = content
  temp.select()
  document.execCommand('copy')
  document.body.removeChild(temp)
}

function getPageDividerJQ(pageNum) {
  const pageDividerHtml = ' \
    <div class="PageDivider" page="' + pageNum + '" style="height: 9px; border-bottom: 1px solid #eeeeee; margin: 18px 36px; text-align: center;"> \
      <span style="font-size: 14px; background-color: white; padding: 0 30px; font-weight: 400; color: grey;"> \
    '
        + 'Page ' + pageNum +
    ' \
      </spa> \
    </div> \
  '
  return $(pageDividerHtml)
}

function removeAnnotation(annotationID) {
  let thisPage = $('.AnnotationDiv[annotation_id="{0}"]'.format(annotationID)).attr('page')
  getAnnotationDivJQById(annotationID).remove()
  $('.Annotation[annotation_id="{0}"]'.format(annotationID)).remove()

  if ($('.AnnotationDiv[page="{0}"]'.format(thisPage)).toArray().length > 0) {
    let firstAnnotationDivInThisPage = $('.AnnotationDiv[page="{0}"]'.format(thisPage)).first()
    if (firstAnnotationDivInThisPage.find('hr')[0] != undefined)
      firstAnnotationDivInThisPage.children('hr').replaceWith(getPageDividerJQ(thisPage))
  }
}

function removeAnnotationReply(id) {
  var queue = $('.annotation-reply-block[annotation_reply_id="{0}"]'.format(id)).toArray()
  while (queue.length > 0) {
    var headAnnotationReplyJquery = $(queue.shift())
    var replyId = headAnnotationReplyJquery.attr('annotation_reply_id')
    queue = queue.concat($('.annotation-reply-block[reply_to_annotation_reply="{0}"]'.format(replyId)).toArray())
    headAnnotationReplyJquery.remove()
  }
}

function _checkCoverage(annotationDom, e, pageJQ) {
  var top_left_relative_x = e.pageX - pageJQ.offset().left
  var top_left_relative_y = e.pageY - pageJQ.offset().top
  return _getLeft(annotationDom) <= top_left_relative_x &&
        _getRight(annotationDom) >= top_left_relative_x &&
        _getTop(annotationDom) <= top_left_relative_y &&
        _getBottom(annotationDom) >= top_left_relative_y
}

function _getLeft(annotationDom) { return parseFloat($(annotationDom).css('left')) }

function _getRight(annotationDom) { return parseFloat($(annotationDom).css('left')) + $(annotationDom).width() }

function _getTop(annotationDom) { return parseFloat($(annotationDom).css('top')) }

function _getBottom(annotationDom) { return parseFloat($(annotationDom).css('top')) + $(annotationDom).height() }

function addAnnotationRelatedListener() { addAnnotationRelatedListenerWithin($(document)) }

function scrollAnnotationDivIntoView(annotationDiv) {
  var annotationsDiv = $('#annotation-update-div')
  var down = annotationDiv.offset().top - annotationsDiv.offset().top + annotationsDiv.scrollTop()
  annotationsDiv.animate({
    scrollTop: parseInt(down)
  }, 240)
}

function scrollAnnotationIntoView(annotation) {
  var fileViewer = $('#file_viewer')
  var down = annotation.offset().top - fileViewer.offset().top + fileViewer.scrollTop() - window.innerHeight * 0.38 + annotation.height() / 2
  fileViewer.animate({
    scrollTop: parseInt(down)
  }, 240)
}

function findTargetAnnotation(e, allAnnotationsInThisPage, pageJQ) {
  const coverAnnotations = allAnnotationsInThisPage.filter(annotation => _checkCoverage(annotation, e, pageJQ))

  const THREDSHOLD = 9
  var sortedCloseness = coverAnnotations.sort((a, b) => _getRight(a) > _getRight(b))
  if (_getRight(sortedCloseness[1]) - _getRight(sortedCloseness[0]) < THREDSHOLD) {  // right side too close
    sortedCloseness = coverAnnotations.sort((a, b) => _getLeft(a) < _getLeft(b))
    if (_getLeft(sortedCloseness[0]) - _getLeft(sortedCloseness[1]) < THREDSHOLD) {
      sortedCloseness = coverAnnotations.sort((a, b) => _getBottom(a) > _getBottom(b))
      if (_getBottom(sortedCloseness[1]) - _getBottom(sortedCloseness[0]) < THREDSHOLD)
        sortedCloseness = coverAnnotations.sort((a, b) => _getTop(a) < _getTop(b))
    }
  }
  const newTarget = $(sortedCloseness[0])
  return newTarget
}

function addAnnotationRelatedListenerWithin(jq) {
  const appName = window.location.pathname.split('/')[1]
  jq.find('code').addClass('prettyprint')
  PR.prettyPrint()

  jq.find('.AnnotationBlock').on({
    mouseover: function() {
      var annotationID = $(this).attr('annotation_id')
      var annotation = $('.Annotation[annotation_id="{0}"]'.format(annotationID))
      $(this).css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
      annotation.css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
    },
    mouseout: function() {
      var annotationID = $(this).attr('annotation_id')
      var annotation = $('.Annotation[annotation_id="{0}"]'.format(annotationID))
      $(this).css('box-shadow', 'none')
      annotation.css('box-shadow', 'none')
    }
  })

  // jq.find(".AnnotationBlock").on("click", function(e) { // scroll to the corresponding Anotation when clicking a certain AnnotationBlock
  //   if ($(e.target).parents().addBack().hasClass('btn'))
  //     return
  //   var annotation_id = $(this).attr("annotation_id")
  //   var Annotation = $('.Annotation[annotation_id="' + annotation_id + '"]')
  //   var fileViewer = $("#file_viewer")
  //   var down = Annotation.offset().top - fileViewer.offset().top + fileViewer.scrollTop() - window.innerHeight * 0.38 + Annotation.height() / 2
  //   fileViewer.animate({
  //     scrollTop: parseInt(down)
  //   }, 240)
  // })

  jq.find('.AnnotationDirectButton').on('click', function(e) {
    var annotation_id = $(this).parents('.AnnotationDiv').attr('annotation_id')
    var Annotation = $('.Annotation[annotation_id="{0}"]'.format(annotation_id))
    scrollAnnotationIntoView(Annotation)
  })

  jq.find('.PostReplyReplyButton').on('click', function() {
    if (is_authenticated) {
      var is_public = !this.classList.contains('AnonymouslyPostReplyReplyButton')
      var thisButton = $(this)
      var index = layer.load(1, { shade: 0.18 }) //0 represent the style, can be 0-2
      $.post({
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'reply_annotation',
          annotation_reply_content: thisButton.parents('form').find('textarea[name="reply_reply_content"]').val(),
          reply_to_annotation_id: thisButton.parents('.AnnotationBlock').find('.PostAnnotationReplyButton').val(),
          reply_to_annotation_reply_id: thisButton.val(),
          document_id: $('button[name="document_id"]').val(),
          is_public: is_public,
        },
        success: function(data) {
          var reply = $(data)
          $('.AnnotationBlock[annotation_id="{0}"]'.format(thisButton.parents('.AnnotationBlock').find('.PostAnnotationReplyButton').val())).append(reply)
          $('.ReplyAnnotationButton').parents('footer').children('form').css('display', 'none')
          tinyMCE.activeEditor.setContent('')
          addAnnotationRelatedListenerWithin(reply)
          tinymceInit()
          layer.close(index)
        }
      })
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  })

  jq.find('.DeleteAnnotationReplyButton').on('click', function() {
    var index = layer.load(1, {
      shade: 0.18
    })  // 0 represent the style, can be 0-2
    var replyId = this.value
    $.post({
      url: '',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        operation: 'delete_annotation_reply',
        reply_id: replyId,
        document_id: $('button[name="document_id"]').val(),
      },
      success: function(data) {
        removeAnnotationReply(replyId)
        layer.close(index)
      }
    })
  })

  jq.find('.PostAnnotationReplyButton').on('click', function() {
    if (is_authenticated) {
      var is_public = !this.classList.contains('AnonymouslyPostAnnotationReplyButton')
      var thisButton = $(this)
      var index = layer.load(1, {shade: 0.18}) //0 represent the style, can be 0-2
      $.post({
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'reply_annotation',
          annotation_reply_content: thisButton.parent('form').find('textarea[name="annotation_reply_content"]').val(),
          reply_to_annotation_id: thisButton.val(),
          document_id: $('button[name="document_id"]').val(),
          is_public: is_public,
        },
        success: function(data) {
          var reply = $(data)
          $('.AnnotationBlock[annotation_id="{0}"]'.format(thisButton.val())).append(reply)
          $('.ReplyAnnotationButton').parents('footer').children('form').css('display', 'none')
          tinyMCE.activeEditor.setContent('')
          addAnnotationRelatedListenerWithin(reply)
          tinymceInit()
          layer.close(index)
        }
      })
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  })

  jq.find('.delete-annotation-btn').on('click', function() {
    var index = layer.load(1, { shade: 0.18 })  // 0 represent the style, can be 0-2
    var annotationID = this.value
    $.post({
      url: '',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        operation: 'delete_annotation',
        annotation_id: this.value,
      },
      success: function() {
        removeAnnotation(annotationID)
        layer.close(index)
      }
    })
  })

  jq.find('.share-annotation-btn').on('click', function() {
    const uuid = $(this).parents('.AnnotationDiv').attr('annotation_uuid')
    const url = [location.protocol, '//', location.host, location.pathname].join('') + '?annotation=' + uuid
    layer.confirm('<span style="color: #37b">' + url + '<span>', {
      title: false, skin: 'layui-layer-molv', btn: ['copy URL'],
      closeBtn: 0, shade: 0.18, shadeClose: true
    }, function(){
      copyToClipboard(url)
      layer.msg('URL copied', { time: 1228 })
    })
  })

  jq.find('.like-annotation-btn').on('click', function() {
    if (is_authenticated) {
      const $this = $(this)
      var new_num = parseInt($this.find('.num_like').text()) + 1
      $this.find('.num_like').text(new_num.toString())
      $this.off('click')
      $this.css('color', '#6495ED')
      $this.on('click', function() {
        layer.msg('already liked', {
          icon: 6,
          time: 666,
        })
      })
      $.post({
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'like_annotation',
          annotation_id: $this.attr('annotation_id'),
        },
      })
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  })

  jq.find('.like-annotation-reply-btn').on('click', function() {
    if (is_authenticated) {
      const $this = $(this)
      var new_num = parseInt($this.find('.num_like').text()) + 1
      $this.find('.num_like').text(new_num.toString())
      $this.off('click')
      $this.css('color', '#6495ED')
      $this.on('click', function() {
        layer.msg('already liked', {
          icon: 6,
          time: 666,
        })
      })
      $.post({
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'like_annotation_reply',
          annotation_reply_id: $this.attr('annotation_reply_id'),
        },
      })
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  })

  jq.find('.ReplyAnnotationButton').on('click', function() {
    const currentVisible = !$(this).css('display') === 'none'
    $(this).parents('footer').children('form').slideToggle({duration: 180, start: function() {
      if (!currentVisible)
        $('.ReplyAnnotationButton').parents('footer').children('form').not($(this)).slideUp(180).css('display', 'none')
      tinyMCE.get($(this).find('textarea').attr('id')).focus()
    }})
  })

  jq.find('.EditFormToggleButton').on('click', function() {
    let $this = $(this)
    $this.parents('.AnnotationDiv').find('.AnnotationBlock').css('display', 'none')
    $this.parents('.AnnotationDiv').find('.AnnotationEditForm').fadeIn(666)
    let tinyMCEEditor = tinyMCE.get($(this).parents('.AnnotationDiv').find('.AnnotationEditForm').find('textarea').attr('id'))

    $.get({
      url: '/' + appName + '/api/annotations/' + $this.attr('annotation_id') + '/content',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
      },
      success: function(data) {
        tinyMCEEditor.setContent(data)
        tinyMCEEditor.focus()
      }
    })
  })

  jq.find('.annotation-reply-edit-form-toggle-btn').on('click', function() {
    let $this = $(this)
    $this.parents('.annotation-reply-div').find('.annotation-reply-block').css('display', 'none')
    $this.parents('.annotation-reply-div').find('.annotation-reply-edit-form').fadeIn(666)
    let tinyMCEEditor = tinyMCE.get($(this).parents('.annotation-reply-div').find('.annotation-reply-edit-form').find('textarea').attr('id'))

    $.get({
      url: '/' + appName + '/api/annotationreplies/' + $this.attr('annotation_reply_id') + '/content',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
      },
      success: function(data) {
        tinyMCEEditor.setContent(data)
        tinyMCEEditor.focus()
      }
    })
  })

  jq.find('.cancel-annotation-edit-btn').on('click', function() {
    let $this = $(this)
    let annotationDivJQ = $this.parents('.AnnotationDiv')
    annotationDivJQ.find('.AnnotationBlock').css('display', 'block')
    annotationDivJQ.find('.AnnotationEditForm').css('display', 'none')
    let tinyMCEEditor = tinyMCE.get(annotationDivJQ.find('.AnnotationEditForm').find('textarea').attr('id'))
    tinyMCEEditor.setContent('')
  })

  jq.find('.cancel-annotation-reply-edit-btn').on('click', function() {
    let $this = $(this)
    $this.parents('.annotation-reply-div').find('.annotation-reply-block').css('display', 'block')
    $this.parents('.annotation-reply-div').find('.annotation-reply-edit-form').css('display', 'none')
    let tinyMCEEditor = tinyMCE.get($(this).parents('.annotation-reply-div').find('.annotation-reply-edit-form').find('textarea').attr('id'))
    tinyMCEEditor.setContent('')
  })

  jq.find('.PostAnnotationEditButton').on('click', function() {
    let $this = $(this)
    let tinyMCEEditor = tinyMCE.get($(this).parents('.AnnotationDiv').find('.AnnotationEditForm').find('textarea').attr('id'))
    let new_content = $this.parents('.AnnotationEditForm').find('textarea[name="annotation_edit_content"]').val()
    $.post({
      url: '/' + appName + '/api/annotations/' + $this.attr('annotation_id') + '/edit',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        new_content: new_content
      },
      success: function() {
        let annotationDivJQ = $this.parents('.AnnotationDiv')
        annotationDivJQ.find('.annotation-content').html(new_content)
        annotationDivJQ.find('.annotation-time-span').text('edited')
        annotationDivJQ.find('.AnnotationEditForm').css('display', 'none')
        annotationDivJQ.find('.AnnotationBlock').fadeIn(666)
        annotationDivJQ.find('.AnnotationBlock').css('display', 'block')
        tinyMCEEditor.setContent('')
        renderMathJax()
        tinymceInit()
      }
    })
  })

  jq.find('.PostAnnotationReplyEditButton').on('click', function() {
    let $this = $(this)
    let tinyMCEEditor = tinyMCE.get($(this).parents('.annotation-reply-div').find('.annotation-reply-edit-form').find('textarea').attr('id'))
    let new_content = $this.parents('.annotation-reply-edit-form').find('textarea[name="annotation_reply_edit_content"]').val()
    $.post({
      url: '/' + appName + '/api/annotationreplies/' + $this.attr('annotation_reply_id') + '/edit',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        new_content: new_content
      },
      success: function() {
        let annotationReplyDiv = $this.parents('.annotation-reply-div')
        annotationReplyDiv.find('.annotation-reply-content').html(new_content)
        annotationReplyDiv.find('.annotation-reply-time-span').text('edited')
        annotationReplyDiv.find('.annotation-reply-edit-form').css('display', 'none')
        annotationReplyDiv.find('.annotation-reply-block').fadeIn(666)
        annotationReplyDiv.find('.annotation-reply-block').css('display', 'block')
        tinyMCEEditor.setContent('')
        renderMathJax()
        tinymceInit()
      }
    })
  })

  jq.find('.Annotation').addBack('.Annotation').on('mouseover', function() {
    const pageJQ = $(this).parent('.page_div').children('.PageCanvas')
    const allAnnotationsInThisPage = $(this).parent('.page_div').find('.Annotation').toArray()
    var target = undefined

    jq.find('.Annotation').addBack('.Annotation').on('mousemove', function(e) {
      if (e.which != 0) {
        for (var a of allAnnotationsInThisPage) {
          $(a).css('box-shadow', 'none')
          $('.AnnotationBlock[annotation_id="{0}"]'.format($(a).attr('annotation_id'))).css('box-shadow', 'none')
        }
        return
      }

      const newTarget = findTargetAnnotation(e, allAnnotationsInThisPage, pageJQ)

      if (newTarget != target) {
        if (target != undefined) {
          target.css('box-shadow', 'none')
          $('.AnnotationBlock[annotation_id="{0}"]'.format($(target).attr('annotation_id'))).css('box-shadow', 'none')
        }
        newTarget.css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
        $('.AnnotationBlock[annotation_id="{0}"]'.format($(newTarget).attr('annotation_id'))).css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
        target = newTarget
      }
    })
  })

  jq.find('.Annotation').addBack('.Annotation').on('mouseout', function(e) {
    if (e.which != 0)
      return

    const allAnnotationsInThisPage = $(this).parent('.page_div').find('.Annotation').toArray()
    for (var a of allAnnotationsInThisPage) {
      $(a).css('box-shadow', 'none')
      $('.AnnotationBlock[annotation_id="{0}"]'.format($(a).attr('annotation_id'))).css('box-shadow', 'none')
      $(a).off('mousemove')
    }
  })

  renderMathJax()
}


export {
  addAnnotationRelatedListener,
  addAnnotationRelatedListenerWithin,
  scrollAnnotationDivIntoView,
  scrollAnnotationIntoView,
  findTargetAnnotation,
  getPageDividerJQ
}

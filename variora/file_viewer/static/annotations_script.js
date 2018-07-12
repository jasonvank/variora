import { getCookie } from 'util.js'
import { tinymceInit } from './tinymce_script'

function getAnnotationDivJQById(annotationID) {
  var selector = '.AnnotationDiv[annotation_id="' + annotationID + '"]'
  return $(selector)
}

function removeAnnotation(annotationID) {
  getAnnotationDivJQById(annotationID).remove()
  $('.Annotation[annotation_id="' + annotationID + '"]').remove()
}

function removeAnnotationReply(id) {
  var queue = $(".AnnotationReplyBlock[annotation_reply_id='" + id + "']").toArray()
  while (queue.length > 0) {
    var headAnnotationReplyJquery = $(queue.shift())
    var replyId = headAnnotationReplyJquery.attr('annotation_reply_id')
    queue = queue.concat($(".AnnotationReplyBlock[reply_to_annotation_reply='" + replyId + "']").toArray())
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
  var annotationsDiv = $('#annotation_update_div')
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
  jq.find('code').addClass('prettyprint')
  PR.prettyPrint()

  jq.find('.AnnotationBlock').on('mouseover', function() {
    var annotation_id = $(this).attr('annotation_id')
    var Annotation = $('.Annotation[annotation_id="' + annotation_id + '"]')
    $(this).css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
    Annotation.css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
  })

  jq.find('.AnnotationBlock').on('mouseout', function() {
    var annotation_id = $(this).attr('annotation_id')
    var Annotation = $('.Annotation[annotation_id="' + annotation_id + '"]')
    $(this).css('box-shadow', 'none')
    Annotation.css('box-shadow', 'none')
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
    var annotation_id = $(this).parents('.AnnotationDiv').attr("annotation_id")
    var annotation = $('.Annotation[annotation_id="' + annotation_id + '"]')
    scrollAnnotationIntoView(annotation)
  })

  jq.find(".PostReplyReplyButton").on("click", function() {
    if (is_authenticated) {
      var is_public = !this.classList.contains('AnonymouslyPostReplyReplyButton')
      var thisButton = $(this)
      var index = layer.load(1, { shade: 0.18 }); //0 represent the style, can be 0-2
      $.ajax({
        type: 'POST',
        url: '',
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: 'reply_annotation',
          annotation_reply_content: thisButton.parents('form').find("textarea[name='reply_reply_content']").val(),
          reply_to_annotation_id: thisButton.parents(".AnnotationBlock").find(".PostAnnotationReplyButton").val(),
          reply_to_annotation_reply_id: thisButton.val(),
          document_id: $("button[name='document_id']").val(),
          is_public: is_public,
        },
        success: function(data) {
          var reply = $(data)
          $(".AnnotationBlock[annotation_id='" + thisButton.parents(".AnnotationBlock").find(".PostAnnotationReplyButton").val(), + "']").append(reply)
          $(".ReplyAnnotationButton").parents('footer').children('form').css('display', 'none')
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
    });  // 0 represent the style, can be 0-2
    var replyId = this.value
    $.ajax({
      type: 'POST',
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

  jq.find(".PostAnnotationReplyButton").on("click", function() {
    if (is_authenticated) {
      var is_public = !this.classList.contains('AnonymouslyPostAnnotationReplyButton')
      var thisButton = $(this)
      var index = layer.load(1, {shade: 0.18}) //0 represent the style, can be 0-2
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "reply_annotation",
          annotation_reply_content: thisButton.parent('form').find("textarea[name='annotation_reply_content']").val(),
          reply_to_annotation_id: thisButton.val(),
          document_id: $("button[name='document_id']").val(),
          is_public: is_public,
        },
        success: function(data) {
          var reply = $(data)
          $(".AnnotationBlock[annotation_id='" + thisButton.val() + "']").append(reply)
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

  jq.find('.DeleteAnnotationButton').on('click', function() {
    var index = layer.load(1, { shade: 0.18 })  // 0 represent the style, can be 0-2
    var annotationID = this.value
    $.ajax({
      type: 'POST',
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

  jq.find('.LikeAnnotationButton').on('click', function() {
    if (is_authenticated) {
      const $this = $(this)
      var new_num = parseInt($this.find('.num_like').text()) + 1
      $this.find('.num_like').text(new_num.toString())
      $this.off('click')
      $this.css('color', '#6495ED')
      $this.on('click', function() {
        layer.msg('already liked', {
          icon: 6,
          time: 800,
        })
      })
      $.ajax({
        type: 'POST',
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

  jq.find('.LikeAnnotationReplyButton').on('click', function() {
    if (is_authenticated) {
      const $this = $(this)
      var new_num = parseInt($this.find('.num_like').text()) + 1
      $this.find('.num_like').text(new_num.toString())
      $this.off('click')
      $this.css('color', '#6495ED')
      $this.on('click', function() {
        layer.msg('already liked', {
          icon: 6,
          time: 800,
        })
      })
      $.ajax({
        type: 'POST',
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

  jq.find(".ReplyAnnotationButton").on("click", function() {
    const currentVisible = !$(this).css('display') === 'none'
    $(this).parents("footer").children("form").slideToggle({duration: 180, start: function() {
      if (currentVisible) {
        // tinyMCE.activeEditor.setContent("")
      } else {
        $(".ReplyAnnotationButton").parents("footer").children("form").not($(this)).slideUp(180).css('display', 'none')
        // for (var editor in tinyMCE.editors)
        //   tinyMCE.editors[editor].setContent('<img src="https://i.ytimg.com/an_webp/_B8RaLCNUZw/mqdefault_6s.webp?du=3000&amp;sqp=CJjesdkF&amp;rs=AOn4CLBqPkLkYs5Q1IdMgqn99-OYSp5UuQ" alt="" width="320" height="180" />')
      }
      tinyMCE.get($(this).find('textarea').attr('id')).focus()
    }})
  })

  jq.find('.EditFormToggleButton').on('click', function() {
    let $this = $(this)
    $this.parents('.AnnotationDiv').find('.AnnotationBlock').css('display', 'none')
    $this.parents('.AnnotationDiv').find('.AnnotationEditForm').css('display', 'block')
    let tinyMCEEditor = tinyMCE.get($(this).parents('.AnnotationDiv').find('.AnnotationEditForm').find('textarea').attr('id'))

    $.ajax({
      type: 'GET',
      url: '/file_viewer/api/annotations/' + $this.attr('annotation_id') + '/content',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
      },
      success: function(data) {
        tinyMCEEditor.setContent(data)
        tinyMCEEditor.focus()
      }
    })
  })

  jq.find('.CancelAnnotationEditButton').on('click', function() {
    let $this = $(this)
    $this.parents('.AnnotationDiv').find('.AnnotationBlock').css('display', 'block')
    $this.parents('.AnnotationDiv').find('.AnnotationEditForm').css('display', 'none')
    let tinyMCEEditor = tinyMCE.get($(this).parents('.AnnotationDiv').find('.AnnotationEditForm').find('textarea').attr('id'))
    tinyMCEEditor.setContent('')
  })

  jq.find('.PostAnnotationEditButton').on('click', function() {
    let $this = $(this)
    let tinyMCEEditor = tinyMCE.get($(this).parents('.AnnotationDiv').find('.AnnotationEditForm').find('textarea').attr('id'))
    let new_content = $this.parents('.AnnotationEditForm').find('textarea[name="annotation_edit_content"]').val()
    $.ajax({
      type: 'POST',
      url: '/file_viewer/api/annotations/' + $this.attr('annotation_id') + '/edit',
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        new_content: new_content
      },
      success: function() {
        $this.parents('.AnnotationDiv').find('.annotation-content').html(new_content)
        $this.parents('.AnnotationDiv').find('.AnnotationBlock').css('display', 'block')
        $this.parents('.AnnotationDiv').find('.AnnotationEditForm').css('display', 'none')
        tinyMCEEditor.setContent('')
        addAnnotationRelatedListenerWithin($this.parents('.AnnotationDiv'))
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
          $(".AnnotationBlock[annotation_id='" + $(a).attr("annotation_id") + "']").css('box-shadow', 'none')
        }
        return
      }

      const newTarget = findTargetAnnotation(e, allAnnotationsInThisPage, pageJQ)

      if (newTarget != target) {
        if (target != undefined) {
          target.css('box-shadow', 'none')
          $(".AnnotationBlock[annotation_id='" + $(target).attr("annotation_id") + "']").css('box-shadow', 'none')
        }
        newTarget.css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
        $(".AnnotationBlock[annotation_id='" + $(newTarget).attr("annotation_id") + "']").css('box-shadow', '3px 3px 8px rgba(0, 0, 0, .38)')
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
      $(".AnnotationBlock[annotation_id='" + $(a).attr("annotation_id") + "']").css('box-shadow', 'none')
      $(a).off('mousemove')
    }
  })

  if (window.hasOwnProperty('MathJax'))
    MathJax.Hub.Queue(['Typeset', MathJax.Hub])
}


export { addAnnotationRelatedListener, addAnnotationRelatedListenerWithin, scrollAnnotationDivIntoView, scrollAnnotationIntoView, findTargetAnnotation }

import { getCookie } from 'util.js'
import { tinymceInit } from './tinymce_script'

function getAnnotationDivJQById(annotationID) {
  var selector = ".AnnotationDiv[annotation_id='" + annotationID + "']"
  return $(selector)
}

function removeAnnotation(annotationID) {
  getAnnotationDivJQById(annotationID).remove();
  $(".Annotation[annotation_id='" + annotationID + "']").remove();
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

function addAnnotationRelatedListener() { addAnnotationRelatedListenerWithin($(document)) }

function addAnnotationRelatedListenerWithin(jq) {
  jq.find('code').addClass('prettyprint');
  PR.prettyPrint();

  jq.find(".AnnotationBlock").on("mouseover", function() {
    var annotation_id = $(this).attr("annotation_id");
    var Annotation = $(".Annotation[annotation_id='" + annotation_id + "']");
    $(this).css("box-shadow", '2px 3px 8px rgba(0, 0, 0, .25)');
    Annotation.css("box-shadow", '2px 3px 8px rgba(0, 0, 0, .25)');
  });

  jq.find(".AnnotationBlock").on("mouseout", function() {
    var annotation_id = $(this).attr("annotation_id");
    var Annotation = $(".Annotation[annotation_id='" + annotation_id + "']");
    $(this).css("box-shadow", 'none');
    Annotation.css("box-shadow", 'none');
  });

  jq.find(".AnnotationBlock").on("click", function(e) { // scroll to the corresponding Anotation when clicking a certain AnnotationBlock
    if ($(e.target).parents().addBack().hasClass('btn'))
      return
    var annotation_id = $(this).attr("annotation_id");
    var Annotation = $(".Annotation[annotation_id='" + annotation_id + "']");
    var fileViewer = $("#file_viewer");
    var down = Annotation.offset().top - fileViewer.offset().top + fileViewer.scrollTop() - window.innerHeight * 0.38 + Annotation.height() / 2;
    fileViewer.animate({
      scrollTop: parseInt(down)
    }, 240)
  })

  jq.find(".PostReplyReplyButton").on("click", function() {
    if (is_authenticated) {
      var is_public = !this.classList.contains('AnonymouslyPostReplyReplyButton')
      var thisButton = $(this);
      var index = layer.load(1, { shade: 0.18 }); //0 represent the style, can be 0-2
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "reply_annotation",
          annotation_reply_content: thisButton.parents('form').find("textarea[name='reply_reply_content']").val(),
          reply_to_annotation_id: thisButton.parents(".AnnotationBlock").find(".PostAnnotationReplyButton").val(),
          reply_to_annotation_reply_id: thisButton.val(),
          document_id: $("button[name='document_id']").val(),
          is_public: is_public,
        },
        success: function(data) {
          var reply = $(data)
          $(".AnnotationBlock[annotation_id='" + thisButton.parents(".AnnotationBlock").find(".PostAnnotationReplyButton").val(), + "']").append(reply)
          $(".ReplyAnnotationButton").parents("footer").children("form").css('display', 'none')
          tinyMCE.activeEditor.setContent("")
          addAnnotationRelatedListenerWithin(reply)
          tinymceInit();
          layer.close(index);
        }
      })
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  })

  jq.find(".DeleteAnnotationReplyButton").on("click", function() {
    var index = layer.load(1, {
      shade: 0.18
    });  // 0 represent the style, can be 0-2
    var replyId = this.value
    $.ajax({
      type: "POST",
      url: "",
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        operation: "delete_annotation_reply",
        reply_id: replyId,
        document_id: $("button[name='document_id']").val(),
      },
      success: function(data) {
        removeAnnotationReply(replyId)
        layer.close(index)
      }
    });
  });

  jq.find(".PostAnnotationReplyButton").on("click", function() {
    if (is_authenticated) {
      var is_public = !this.classList.contains('AnonymouslyPostAnnotationReplyButton')
      var thisButton = $(this);
      var index = layer.load(1, {shade: 0.18}); //0 represent the style, can be 0-2
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
          $(".ReplyAnnotationButton").parents("footer").children("form").css('display', 'none')
          tinyMCE.activeEditor.setContent("")
          addAnnotationRelatedListenerWithin(reply)
          tinymceInit();
          layer.close(index);
        }
      });
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  })

  jq.find(".DeleteAnnotationButton").on("click", function() {
    var index = layer.load(1, { shade: 0.18 });  // 0 represent the style, can be 0-2
    var annotationID = this.value;
    $.ajax({
      type: "POST",
      url: "",
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        operation: "delete_annotation",
        annotation_id: this.value,
      },
      success: function() {
        removeAnnotation(annotationID);
        layer.close(index)
      }
    });
  });

  jq.find(".LikeAnnotationButton").on("click", function() {
    if (is_authenticated) {
      var $this = $(this);
      var new_num = parseInt($this.next().text()) + 1;
      $this.next().text(new_num.toString());
      $this.off("click");
      $this.css("color", "#6495ED");
      $this.on("click", function() {
        layer.msg('already liked', {
          icon: 6,
          time: 800,
        });
      });
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "like_annotation",
          annotation_id: $this.attr("annotation_id"),
        },
      });
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  });

  jq.find(".LikeAnnotationReplyButton").on("click", function() {
    if (is_authenticated) {
      var $this = $(this);
      var new_num = parseInt($this.next().text()) + 1;
      $this.next().text(new_num.toString());
      $this.off("click");
      $this.css("color", "#6495ED");
      $this.on("click", function() {
        layer.msg('already liked', {
          icon: 6,
          time: 800,
        });
      });
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "like_annotation_reply",
          annotation_reply_id: $this.attr("annotation_reply_id"),
        },
      });
    } else
      layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
  });

  jq.find(".ReplyAnnotationButton").on("click", function() {
    var currentVisible = !$(this).css('display') ==
    $(this).parents("footer").children("form").slideToggle({duration: 180, start: function() {
      if (currentVisible) {
        // tinyMCE.activeEditor.setContent("")
      } else {
        $(".ReplyAnnotationButton").parents("footer").children("form").not($(this)).slideUp(180).css('display', 'none')
        // for (editor in tinyMCE.editors)
        //   tinyMCE.editors[editor].setContent("")
      }
    }});
  });
}

export { addAnnotationRelatedListener }

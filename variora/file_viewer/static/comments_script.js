import { getCookie } from 'util.js'
import { tinymceInit } from './tinymce_script'

function addCommentRelatedListener() {
  tinymceInit();
  $('code').addClass('prettyprint');
  PR.prettyPrint();

  $(".likeCommentButton").on("click", function() {
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
          operation: "like_comment",
          comment_id: $this.attr("comment_id"),
        },
      });
    } else
      layer.msg('you need to log in to like');
  });
  $(".delete_comment_button").on("click", function() {
    if (is_authenticated) {
      var index = layer.load(0, {
        shade: 0.18
      }); //0 represent the style, can be 0-2
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "delete_comment",
          comment_id: this.value,
          document_id: $("button[name='document_id']").val(),
        },
        success: function(data) {
          $("#comment_update_div").html(data);
          addCommentRelatedListener();
          layer.close(index);
        }
      });
    }
  });
  $(".reply_comment_button").on("click", function() {
    $(this).parents("blockquote").find(".reply_comment_form").slideToggle({
      duration: 180,
      start: function() {
        if ($(this).is(":hidden")) {
          // tinyMCE.activeEditor.setContent("")
        } else {
          $(".reply_comment_form").not($(this)).slideUp(180)
          // for (editor in tinyMCE.editors)
          //     tinyMCE.editors[editor].setContent("")
        }
      }
    });
  });
  $(".post_comment_reply_button").on("click", function() {
    if (is_authenticated) {
      var $thisButton = $(this);
      var index = layer.load(0, {
        shade: 0.18
      }); //0代表加载的风格，支持0-2
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "comment",
          comment_content: $thisButton.prev("textarea[name='comment_content']").val(),
          document_id: $("button[name='document_id']").val(),
          reply_to_comment_id: $thisButton.val(),
        },
        success: function(data) {
          $("#comment_update_div").html(data);
          // 修改html内容后，有关的事件监听会被自动删除，因此需要重新添加事件监听
          addCommentRelatedListener();
          layer.close(index);
        }
      });
    } else layer.msg('you need to log in to reply');
  });
}

function enableRefreshCommentButton() {
  $("#refresh_comment_button").on('click', function() {
    $.ajax({
      type: "POST",
      url: "",
      data: {
        csrfmiddlewaretoken: getCookie('csrftoken'),
        operation: "refresh",
        document_id: $("button[name='document_id']").val(),
      },
      success: function(data) {
        $("#comment_update_div").html(data);
        addCommentRelatedListener();
      },
    });
  });
}

function enablePostCommentButton() {
  $(".post_comment_button").on('click', function() {
    if (is_authenticated) {
      var index = layer.load(0, {
        shade: 0.18
      }); //0代表加载的风格，支持0-2
      var activeEditor = tinyMCE.activeEditor
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "comment",
          comment_content: $("textarea[name='comment_content']").val(),
          document_id: $("button[name='document_id']").val(),
        },
        success: function(data) {
          $("#comment_update_div").html(data);
          addCommentRelatedListener(); // 修改html内容后，有关的事件监听会被自动删除，因此需要重新添加事件监听
          activeEditor.setContent("") // $("textarea[name='comment_content']").val("");
          layer.close(index);
        }
      });
    } else layer.msg('you need to log in to post comment');
  });
}

export { addCommentRelatedListener, enableRefreshCommentButton, enablePostCommentButton }

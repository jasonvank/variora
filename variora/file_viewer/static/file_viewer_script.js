import { addAnnotationRelatedListener, addAnnotationRelatedListenerWithin } from './annotations_script.js'
import { addCommentRelatedListener, enablePostCommentButton, enableRefreshCommentButton } from './comments_script.js'
import { getCookie, hexToRgb, imgLoad } from 'util.js'

import { prepareNavbarFunction } from './navbar_subpage_script.js'
import { tinymceInit } from './tinymce_script'

var numPages = 0
var new_annotation_id
var scaleFactor = 1.08
var pdfDoc
var currentScale = 1
var finishList = []
var taskList = []
var rendering = false
var sampleWidth
var sampleHeight
var clearnessLevel = 1.8;  // too small then not clear, not large then rendering consumes much resource
var colorPicker


function pdfScale(scaleFactor) {
  currentScale *= scaleFactor

  if (taskList.length > 0) {
    while (taskList.length > 1)
      taskList.pop()
    taskList.push([taskList[0][0], "PENDING", null])
  }

  for(var i = 0; i < finishList.length; i++) {
    var id = "page_canvas_" + finishList[i]
    var pre = document.getElementById(id)
    pre.width = 0
    pre.height = 0
    taskList.push([finishList[i], "PENDING", null])
  }

  finishList = []
  if(!rendering)
    renderTaskList(taskList, finishList, currentScale)

  var oldScrollHeight = $("#file_viewer")[0].scrollHeight

  sampleWidth *= scaleFactor
  sampleHeight *= scaleFactor
  $(".page_div").each(function() {
    var div = $(this)
    div.css("width", sampleWidth + "px")
    div.css("height", sampleHeight + "px")
  })
  resizeAnnotations(scaleFactor)

  var factor = $("#file_viewer")[0].scrollHeight / oldScrollHeight
  $("#file_viewer").scrollTop(parseFloat($("#file_viewer").scrollTop()) * factor)
}


function startListeningSelectionBoxCreation() {
  var annotationColor = "rgba(0,0,0,0.18)"

  colorPicker.on('change', function(color) {
    var rgb = hexToRgb(color)
    annotationColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.18)'
  })

  $("#annotation_color_buttons_div").find(".ColorSelectorButton").on("click", function() {
    annotationColor = $(this).css("background-color")
  })

  // 可以在已经完成的annotation selection frame上新建一个selection frame
  $(".PageDiv, .page_div").on("mousedown", function(e) {
    // 如果是新建尚未上传的annotation，则不能在其selection frame上新建一个selection frame，
    // 因为点击这个事件要用来给这个尚未上传的annotation的frame做drag或者resize
    if ($(e.target).hasClass('ui-draggable') || $(e.target).hasClass('ui-resizable-handle'))
      return

    // can create at most one annotation each time,
    // whenever atempt to create new one, close all existing annotations
    layer.closeAll()
    $(".ui-draggable.Annotation").remove(); // detach() 会保留所有绑定的事件、附加的数据，而remove()不会

    var page = $(this).find(".PageImg, .PageCanvas")
    var mouse_absolute_x = e.pageX
    var mouse_absolute_y = e.pageY
    var page_top_left_x = page.offset().left
    var page_top_left_y = page.offset().top
    var top_left_relative_x = mouse_absolute_x - page_top_left_x
    var top_left_relative_y = mouse_absolute_y - page_top_left_y

    var new_annotation = $("<div class='Annotation'></div>")
    page.parents(".page_div, .PageDiv").append(new_annotation)
    new_annotation.css({
      "background": annotationColor,
      "position": "absolute",
      "width": "1px",
      "height": "1px",
      "left": top_left_relative_x,
      "top": top_left_relative_y,
    })

    $(".PageImg, .PageCanvas, .Annotation").on("mousemove", function(e) {
      var mouse_absolute_x = e.pageX
      var mouse_absolute_y = e.pageY
      var page_top_left_x = page.offset().left
      var page_top_left_y = page.offset().top
      var bottom_right_relative_x = mouse_absolute_x - page_top_left_x
      var bottom_right_relative_y = mouse_absolute_y - page_top_left_y

      new_annotation.css({
        "width": Math.abs(bottom_right_relative_x - top_left_relative_x),
        "height": Math.abs(bottom_right_relative_y - top_left_relative_y),
        "left": Math.min(top_left_relative_x, bottom_right_relative_x),
        "top": Math.min(top_left_relative_y, bottom_right_relative_y),
      })
      e.stopPropagation()
    })

    $("body").on("mouseup", function(e) {
      if ($(e.target).hasClass("PageImg") || $(e.target).hasClass("PageCanvas") || $(e.target).hasClass("Annotation")) {
        var page_height = page.height()
        var page_width = page.width()
        var top_percent = parseFloat(new_annotation.css("top")) / page_height
        var left_percent = parseFloat(new_annotation.css("left")) / page_width
        var height_percent = parseFloat(new_annotation.css("height")) / page_height
        var width_percent = parseFloat(new_annotation.css("width")) / page_width

        new_annotation.draggable({
          containment: "parent"
        }).resizable({
          containment: "parent"
        })

        // show post-annotation window
        // "annotationWindow" is a number (start from 1), which is the index of this annotation window
        var annotationWindow = layer.open({
          type: 1,
          title: "Post Annotation",
          shadeClose: true,
          shade: false,
          maxmin: true, // enalbe maximize and minimize button
          zIndex: 800,
          fixed: false,
          content: '<form id="annotation_form">\
                        <textarea name="annotation_content" class="form-control" rows="8" style="resize: vertical"></textarea>\
                        <button type="button" class="post_annotation_button anonymously_post_annotation_button btn" name="document_id" value="{{ document.id }}" style="margin: 8px; float: right; border-radius: 0; color: white; background-color: #636e72">\
                          <i class="fa fa-user-secret"></i> &nbsp post anonymously\
                        </button>\
                        <button type="button" class="post_annotation_button btn " name="document_id" value="{{ document.id }}" style="margin: 8px; float: right; border-radius: 0; color: white; background-color: #1BA39C">post annotation</button>\
                    </form>',
          success: function() {
            tinymceInit()
          },
          cancel: function() { // 窗口被关闭的回调函数：当窗口被关闭，annotation选定框也一并删除
            new_annotation.remove()
          }
        })

        // annotationWindowJqueryObject will return the jquery object of the annotation window
        var annotationWindowJqueryObject = $(".layui-layer[times=" + annotationWindow + "]")
        annotationWindowJqueryObject.find(".post_annotation_button").on("click", function() {
          if (is_authenticated) {
            var is_public = !this.classList.contains('anonymously_post_annotation_button')
            $.ajax({
              type: "POST",
              url: "",
              data: {
                csrfmiddlewaretoken: getCookie('csrftoken'),
                operation: "annotate",
                annotation_content: annotationWindowJqueryObject.find("textarea[name='annotation_content']").val(),
                page_id: page.attr("id"),
                top_percent: top_percent,
                left_percent: left_percent,
                height_percent: height_percent,
                width_percent: width_percent,
                frame_color: annotationColor,
                document_id: $("button[name='document_id']").val(),
                is_public: is_public
              },
              success: function(data) {
                // after uploading the annotation, 选择框将不再可以调整大小和拖动
                new_annotation.draggable("destroy").resizable("destroy")
                var newAnnotationDiv = $(data.new_annotationdiv_html)
                var nextAnnotationDiv = $($('.AnnotationDiv').toArray().find(div => parseInt(div.getAttribute('page')) >= parseInt(newAnnotationDiv.attr('page'))))
                if (nextAnnotationDiv[0] == undefined)
                  $('#annotation_update_div').append(newAnnotationDiv)
                else
                  newAnnotationDiv.insertBefore(nextAnnotationDiv)

                addAnnotationRelatedListenerWithin(newAnnotationDiv)
                addAnnotationRelatedListenerWithin(new_annotation)
                tinymceInit()

                new_annotation.attr("annotation_id", data.new_annotation_id)

                // after uploading the annotation, close the window
                layer.close(annotationWindow)
              },
            })
            // 在ajax上传的过程中，禁用上传annotation的按钮
            // 以防止用户在ajax上传过程中（需要一小段时间）又重复点击了post_annotation_button
            annotationWindowJqueryObject.find(".post_annotation_button").attr("disabled", true)
          } else
            layer.msg('You need to <a href="/sign-in" style="color: #ECECEC; text-decoration: underline">log in</a> first')
        })

        $(".PageImg, .PageCanvas, .Annotation").off("mousemove")
        $("body").off("mouseup")
        // 重新启用上传annotation的按钮
        annotationWindowJqueryObject.find(".post_annotation_button").attr("disabled", false)
      }
      // if mouse is released outside of PageImg or PageCanvas, it is invalid
      else {
        new_annotation.remove()

        $(".PageImg, .PageCanvas, .Annotation").off("mousemove")
        $("body").off("mouseup")
      }
      e.stopPropagation()
    })
    e.stopPropagation()
  })
}

/**
 * scale the annotation boxes and adjust their position accordingly
 * @param scaleFactor
 */
function resizeAnnotations(scaleFactor) {
  $(".Annotation").each(function() {
    $(this).css("top", parseFloat($(this).css("top")) * scaleFactor + "px")
    $(this).css("left", parseFloat($(this).css("left")) * scaleFactor + "px")
    $(this).css("width", parseFloat($(this).css("width")) * scaleFactor + "px")
    $(this).css("height", parseFloat($(this).css("height")) * scaleFactor + "px")
  })
}

/**
 * scroll the specified page into fileViewer's visible window
 * @param {jQuery} pageDiv - the jQuery object representing the page to scroll to
 * @return {undefined}
 */
function scrollPageDivIntoView(pageDiv) {
  var fileViewer = $("#file_viewer")
  // "down" is the number of pixels to scroll the visible part down from the top of fileViewer
  var down = pageDiv.offset().top - fileViewer.offset().top + fileViewer.scrollTop()
  // animatedly scroll, 240 means the scrolling process take 240ms long
  fileViewer.animate({
    scrollTop: parseInt(down)
  }, 240)
}


function prepareScrollPageIntoView() {
  var input = $("#scroll_page_into_view_div").children("input")
  var button = $("#scroll_page_into_view_div").children("button")
  input.attr("min", "1")
  input.attr("max", numPages.toString())
  button.on("click", function() {
    var pageIndex = input.val()
    if (pageIndex < 1 || pageIndex > numPages) {
      layer.msg('Input page index out of bounds')
      return false
    }
    var pageDivId = "page_div_" + pageIndex
    var pageDiv = $("#" + pageDivId)
    scrollPageDivIntoView(pageDiv)
  })
}



function setupFileViewerSize() {
  var wrapper = $("#wrapper")
  var fileViewer = $("#file_viewer")
  // 设置wrapper的高度
  wrapper.css("height", document.body.clientHeight - 28 + "px"); //jquery的css方法既可以设置css内容又可以获取css内容
  wrapper.css("width", document.body.clientWidth)
  // 设置fileViewer的高度和宽度
  fileViewer.css("height", wrapper.height() + "px")
  fileViewer.css("width", parseInt(wrapper.css("width")) * 0.6 + "px"); //jquery的css方法获得的是字符串，用js的parseInt获取数值
  // 设置annotation_update_div的高度和宽度
  $("#annotation_update_div").css("height", wrapper.height() + "px")
  $("#annotation_update_div").css("width", wrapper.width() - 3.8 - fileViewer.width() + "px")

  $("#horizontal_draggable").css("height", wrapper.height() + "px")

  // 设置文档的大小
  $(".PageImg").css("width", fileViewer.width() - 24 + "px")
  $(".PageDiv").each(function() {
    var div = $(this)
    var img = div.children(".PageImg")
    imgLoad(img[0], function() {
      div.css("width", img.width() + "px")
      div.css("height", img.height() + "px")
    })
  })
}


function animateOnce() {
  // add animation using animate.css
  $.fn.extend({
    animateOnce: function(animationName) {
      var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend'
      this.addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName)
      })
    }
  })
  $("#navbar").animateOnce("fadeInDown")
  $("#annotation_update_div").find("blockquote").animateOnce("fadeInRight")
}


function enableResizeButton() {
  $("#buttonForLarger").on('click', function() {
    pdfScale(scaleFactor)
  })
  $("#buttonForSmaller").on('click', function() {
    pdfScale(1/scaleFactor)
  })
}


$(document).ready(function() {
  prepareAndRenderAll($("#file-url").val())
  tinymceInit()
  // animateOnce()

  enablePostCommentButton()
  enableRefreshCommentButton()
  enableResizeButton()
  prepareNavbarFunction()

  $(window).resize(function() {
    setupFileViewerSize()

    var originalWidth = parseFloat($(".PageImg").css("width"))
    var newWidth = parseFloat($(".PageImg").css("width"))
    var scaleFactor = newWidth / originalWidth
    resizeAnnotations(scaleFactor)
  })

  colorPicker = new Huebee( '.color-picker', {
    notation: 'hex',
    saturations: 2,
  })

  addCommentRelatedListener()
  setupFileViewerSize()

  var wrapper = $("#wrapper")
  var fileViewer = $("#file_viewer")
  $("#horizontal_draggable").draggable({
    axis: "x",
    containment: "#containment-wrapper",
    revert: true,
    revertDuration: 0,
    stop: function(event, ui) {
      var left = ui.offset["left"]
      fileViewer.css("width", left + "px")
      $("#annotation_update_div").css("width", wrapper.width() - 3 - fileViewer.width() + "px")
    }
  })
})


function renderTaskList(taskList, finishList, scale) {
  if (taskList.length > 0) {
    rendering = true
    $("#buttonForLarger, #buttonForSmaller").attr("disabled", true)
    var num = taskList[0][0]
    pdfDoc.getPage(num).then(function(page) {
      var page_canvas_id = "page_canvas_" + num
      var canvas = document.getElementById(page_canvas_id)
      var context = canvas.getContext('2d')
      var viewport = page.getViewport(clearnessLevel * scale)
      // refer to the following link for the difference of canvas.height and canvas.style.height
      // https://stackoverflow.com/questions/2588181/canvas-is-stretched-when-using-css-but-normal-with-width-height-properties
      canvas.height = viewport.height
      canvas.width = viewport.width
      canvas.style.height = viewport.height / clearnessLevel + "px"
      canvas.style.width = viewport.width / clearnessLevel + "px"

      var renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      taskList[0][2] = page.render(renderContext); // taskList[0][2] is a RenderTask object
      taskList[0][1] = "RENDERING"

      taskList[0][2].promise.then(function() {
        taskList.shift()
        finishList.push(num)
        rendering = false
        $("#buttonForLarger, #buttonForSmaller").attr("disabled", false)
        renderTaskList(taskList, finishList, scale)
      }, function(reason) {
        console.log("rejected because of this reason: " + reason)
      })
    })
  }
}


function startListeningScroll() {
  var previous = 1

  $("#file_viewer").scroll(function() {
    var percentage = this.scrollTop / this.scrollHeight
    var page_index = Math.ceil(percentage * numPages)
    if (page_index != previous) {
      previous = page_index

      var renderOrNot = [true, true, true, true, true]
      // clear pages which are out of view
      var index = 0
      var originalLength = finishList.length
      for (var i = 0; i < originalLength; i++) {
        if (finishList[index] - page_index >= -1 && finishList[index] - page_index <= 3) {
          renderOrNot[finishList[index] - page_index + 1] = false
          index += 1
        } else {
          var id = "page_canvas_" + finishList[index]
          var pre = document.getElementById(id)
          pre.width = 0
          pre.height = 0
          //pre.getContext('2d').clearRect(0, 0, pre.width, pre.height)
          finishList.splice(index, 1)
        }
      }

      // keep the first renderTask since it is still in RENDERING status,
      // delete the rest since they are in PENDING status
      while (taskList.length > 1) {
        taskList.pop()
      }

      // add in the new task
      for (var i = 0; i < 5; i++) {
        if (renderOrNot[i] == true)
          taskList.push([Math.min(numPages, Math.max(1, page_index + i - 1)), "PENDING", null])
      }

      if (!rendering)
        renderTaskList(taskList, finishList, currentScale)
    }
  })
}


function prepareAndRenderAll(url) {
  PDFJS.workerSrc = '/static/pdfjs/pdf.worker.js'

  var documentLoadingIcon = layer.load(1, {
    shade: false,
    offset: '48%'
  })
  PDFJS.getDocument(url).then(function(pdf) {
    layer.close(documentLoadingIcon)

    pdfDoc = pdf

    numPages = pdfDoc.numPages
    prepareScrollPageIntoView()

    // create the same number of canvases as pages
    // also
    // initialize the canvases' height and width according to the last page
    pdfDoc.getPage(numPages).then(function(sample_page) {
      currentScale = ($('#file_viewer').width() * 0.66) / sample_page.getViewport(1).width

      var appendPages = ""
      sampleHeight = sample_page.getViewport(currentScale).height
      sampleWidth = sample_page.getViewport(currentScale).width

      for (var i = 1; i <= pdfDoc.numPages; i++) {
        var new_page_div_id = "page_div_" + i
        var new_page_canvas_id = "page_canvas_" + i

        var new_page = "<div class='page_div' id=" + "'" + new_page_div_id + "'>" +
          "<canvas class='PageCanvas' id=" + "'" + new_page_canvas_id + "'" + "></canvas>" +
          "</div>" +
          "<br>"
        appendPages = appendPages + new_page
      }

      $("#file_viewer").append(appendPages)

      $(".page_div").css("height", sampleHeight + "px")
      $(".page_div").css("width", sampleWidth + "px")

      startListeningSelectionBoxCreation()
      drawAllExistingAnnotationFrame()
      addAnnotationRelatedListener()

      taskList.push([Math.min(numPages, 1), "PENDING", null])
      taskList.push([Math.min(numPages, 2), "PENDING", null])
      taskList.push([Math.min(numPages, 3), "PENDING", null])
      taskList.push([Math.min(numPages, 4), "PENDING", null])
      taskList.push([Math.min(numPages, 5), "PENDING", null])
      renderTaskList(taskList, finishList, currentScale)
      startListeningScroll()
    })
  })
}

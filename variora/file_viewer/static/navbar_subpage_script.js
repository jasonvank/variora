import { getCookie } from 'util.js'

function prepareNavbarFunction() {
  // coterie file viewer pages do not have collect_button
  // only normal file viewer pages have
  $("#collect_button").on("click", function(){
    var span = $(this).find(".fa")
    if (span.hasClass("fa-star-o")) {
      layer.msg('Collected')
      span.removeClass("fa-star-o");
      span.addClass("fa-star")
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "collect",
          document_id: $("button[name='document_id']").val(),
        },
      })
    }
    else if (span.hasClass("fa-star")) {
      layer.msg('Uncollected')
      span.removeClass("fa-star")
      span.addClass("fa-star-o")
      $.ajax({
        type: "POST",
        url: "",
        data: {
          csrfmiddlewaretoken: getCookie('csrftoken'),
          operation: "uncollect",
          document_id: $("button[name='document_id']").val(),
        },
      })
    }
  })

  $("#show_annotation_frame_button").on('click', function() {
    $(".Annotation").each(function() {
      $(this).slideDown(180)
    })
  })
  $("#hide_annotation_frame_button").on('click', function() {
    $(".Annotation").each(function() {
      $(this).slideUp(180)
    })
  })
}

export { prepareNavbarFunction }





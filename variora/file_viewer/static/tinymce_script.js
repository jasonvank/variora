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
      'styleselect | bold italic codesample | link image | bullist numlist outdent indent | forecolor backcolor'
    ],
    paste_as_text: true,
    branding: false,
    width: 'calc(100% - 2px)',
    setup: function(editor) {
      editor.on('change', function() {
        editor.save()
      })
    }
  });
  $(document).on('focusin', function(e) {
    // this is to solve the issue of being unable to edit link and image link in bootstrap model
    if ($(e.target).closest(".mce-window").length)
      e.stopImmediatePropagation()
  });
}

export { tinymceInit }

$(document).ready(function() {

  $('#contact-form').validator().on('submit', function(e) {
    if (e.isDefaultPrevented()) {
      // handle the invalid form...
      $.notify("Oops, check your message again...", "error");
    } else {
      // everything looks good!
      e.preventDefault();
      $.notify("Message sent!", "success");
    }
  })
});
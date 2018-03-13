$(function() {
  $('#load-button').click(function () {
    const text = $('#url-input').val()
    $.get( "/api/url-extract/all", { url: text } )
      .then(function (data) {
        $('#content').html(data.html_extract.readability)
      }, 'json')
  })
})

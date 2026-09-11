// books.js — renders issues.json into the book grid and provides
// live search (title/author/subject) and level filtering.
$(document).ready(function () {
  var allBooks = [];

  function render(books) {
    var $wrap = $('#issueswrap');
    if (!books.length) {
      $wrap.empty();
      $('#emptyMsg').show();
      $('#bookCount').text('0');
      return;
    }
    $('#emptyMsg').hide();
    var tpl = $('#booktpl').html();
    $wrap.html(Mustache.to_html(tpl, { books: books }));
    $('#bookCount').text(books.length);
  }

  function applyFilter() {
    var q = ($('#searchInput').val() || '').toLowerCase().trim();
    var level = $('#levelFilter').val();

    var filtered = allBooks.filter(function (b) {
      var text = [b.title, b.author, b.publisher, b.info, (b.subjects || []).join(' ')]
        .join(' ')
        .toLowerCase();
      var matchQ = !q || text.indexOf(q) !== -1;
      var matchL = level === 'any' || b.level === level;
      return matchQ && matchL;
    });
    render(filtered);
  }

  $('#searchInput').on('input', applyFilter);
  $('#levelFilter').on('change', applyFilter);

  $.getJSON('./issues.json?' + Math.random(), function (data) {
    allBooks = data.books || [];
    render(allBooks);
  }).fail(function () {
    $('#issueswrap').empty();
    $('#emptyMsg').text('Could not load issues.json').show();
  });
});
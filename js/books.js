// books.js — renders issues.json into the book grid and provides
// live search (title/author/subject), level and year filtering.
// The project description is loaded from a separate description.txt file.
$(document).ready(function () {
  var allBooks = [];

  $.get('./description.txt')
    .done(function (txt) {
      if (txt && txt.trim()) {
        $('#projectDescription').text(txt.trim());
      } else {
        $('#projectDescription').remove();
      }
    })
    .fail(function () {
      $('#projectDescription').remove();
    });

  function enrich(b) {
    if (!b.author && b.publisher) {
      b.author = b.publisher;
      b.authorUrl = 'https://archive.org/search.php?query=creator%3A' + encodeURIComponent(b.publisher);
    }
    if (!b.info || !b.info.trim()) {
      var parts = [];
      (b.subjects || []).forEach(function (s) {
        if (!/^\d+$/.test(String(s).trim()) && parts.indexOf(s) === -1) parts.push(s);
      });
      if (b.publisher && parts.indexOf(b.publisher) === -1) parts.push(b.publisher);
      b.info = parts.length
        ? parts.join(' • ')
        : 'Digitized print publication, freely available online.';
    }
    return b;
  }

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
    var year = $('#yearFilter').val();

    var filtered = allBooks.filter(function (b) {
      var text = [b.title, b.author, b.publisher, b.info, (b.subjects || []).join(' ')]
        .join(' ')
        .toLowerCase();
      var matchQ = !q || text.indexOf(q) !== -1;
      var matchL = level === 'any' || b.level === level;
      var matchY = year === 'any' || String(b.year) === year;
      return matchQ && matchL && matchY;
    });
    render(filtered);
  }

  $('#searchInput').on('input', applyFilter);
  $('#levelFilter').on('change', applyFilter);
  $('#yearFilter').on('change', applyFilter);

  $.getJSON('./issues.json?' + Math.random(), function (data) {
    allBooks = (data.books || []).map(enrich);

    var levels = [];
    var years = [];
    allBooks.forEach(function (b) {
      if (b.level && levels.indexOf(b.level) === -1) levels.push(b.level);
      if (b.year && years.indexOf(String(b.year)) === -1) years.push(String(b.year));
    });

    if (levels.length > 1) {
      levels.forEach(function (v) {
        $('#levelFilter').append($('<option>', { value: v, text: v }));
      });
    } else {
      $('#levelFilterGroup').hide();
    }

    if (years.length > 1) {
      years.sort(function (a, b) { return +b - +a; });
      years.forEach(function (v) {
        $('#yearFilter').append($('<option>', { value: v, text: v }));
      });
    } else {
      $('#yearFilterGroup').hide();
    }

    render(allBooks);
  }).fail(function () {
    $('#issueswrap').empty();
    $('#emptyMsg').text('Could not load issues.json').show();
  });
});
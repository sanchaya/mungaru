// books.js — renders issues.json into the issue grid and provides
// live search (title/author/subject), level filter, a clickable year
// list, and grid/list view switching.
// The project description is loaded from a separate description.txt file.
$(document).ready(function () {
  var allBooks = [];
  var totalBooks = 0;

  $.get('./description.txt?v=' + Date.now())
    .done(function (txt) {
      if (txt && txt.trim()) {
        var paras = txt.trim().split(/\r?\n/).map(function (l) {
          return l.trim();
        }).filter(Boolean);
        $('#projectDescription')
          .empty()
          .append(paras.map(function (l) { return $('<p>').text(l); }));
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
        : 'Digitized newspaper issue, freely available online.';
    }
    return b;
  }

  function render(books) {
    var $wrap = $('#issueswrap');
    if (!books.length) {
      $wrap.empty();
      $('#emptyMsg').show();
    } else {
      $('#emptyMsg').hide();
      var tpl = $('#booktpl').html();
      $wrap.html(Mustache.to_html(tpl, { books: books }));
    }
    updateStats();
  }

  function updateStats() {
    var selectedYear = currentYear();
    $('#bookCount').text(totalBooks);
    var $yearStats = $('#yearStats');
    if (selectedYear && selectedYear !== 'any') {
      var n = allBooks.filter(function (b) {
        return String(b.year) === String(selectedYear);
      }).length;
      var termPlural = window.ITEM_TERM || 'items';
      var termSingular = window.ITEM_TERM_SINGULAR || 'item';
      $yearStats.text(' · ' + n + ' ' + (n === 1 ? termSingular : termPlural) + ' in ' + selectedYear);
    } else {
      $yearStats.text('');
    }
  }

  function currentYear() {
    var $active = $('#yearList .year-pill.active');
    return $active.length ? $active.data('year') : 'any';
  }

  function applyFilter() {
    var q = ($('#searchInput').val() || '').toLowerCase().trim();
    var level = $('#levelFilter').val();
    var year = currentYear();

    var filtered = allBooks.filter(function (b) {
      var text = [b.title, b.alt_title, b.author, b.publisher, b.info, (b.subjects || []).join(' ')]
        .join(' ')
        .toLowerCase();
      var matchQ = !q || text.indexOf(q) !== -1;
      var matchL = level === 'any' || b.level === level;
      var matchY = year === 'any' || String(b.year) === String(year);
      return matchQ && matchL && matchY;
    });
    render(filtered);
  }

  $('#searchInput').on('input', applyFilter);
  $('#levelFilter').on('change', applyFilter);

  $(document).on('click', '#yearList .year-pill', function () {
    $('#yearList .year-pill').removeClass('active');
    $(this).addClass('active');
    applyFilter();
  });

  function setView(view) {
    $('#issueswrap').toggleClass('list-view', view === 'list');
    $('#viewGrid').toggleClass('active', view !== 'list');
    $('#viewList').toggleClass('active', view === 'list');
    try { localStorage.setItem('mungaru-view', view); } catch (e) {}
  }

  $('#viewGrid').on('click', function () { setView('grid'); });
  $('#viewList').on('click', function () { setView('list'); });

  var savedView = 'grid';
  try { savedView = localStorage.getItem('mungaru-view') || 'grid'; } catch (e) {}
  setView(savedView);

  $.getJSON('./issues.json?' + Math.random(), function (data) {
    allBooks = (data.books || []).map(enrich);
    totalBooks = allBooks.length;

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
        $('#yearList').append($('<button>', {
          type: 'button',
          'class': 'year-pill',
          'data-year': v,
          text: v
        }));
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
(function () {
  // "Quote a 10x10" buttons pre-select the booth size in the form.
  document.querySelectorAll('[data-size]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.getElementById('q-size');
      if (select) select.value = link.getAttribute('data-size');
    });
  });

  // Copy email button
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800); };
      var fallback = function () {
        var range = document.createRange();
        range.selectNodeContents(document.getElementById('email-text'));
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        copyBtn.textContent = 'Selected';
      };
      try {
        navigator.clipboard.writeText(text).then(done, fallback);
      } catch (e) { fallback(); }
    });
  }

  // Quote form. Set data-endpoint="https://..." on the form to send submissions
  // to a form service. Without it, the form only validates and shows a notice.
  var form = document.getElementById('quote-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        status.hidden = false;
        status.textContent = 'Add your name and a valid email so we can reply.';
        (name ? form.elements.email : form.elements.name).focus();
        return;
      }
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        status.hidden = false;
        status.textContent = 'This form is not connected yet, so nothing was sent. Please email hello@everspaceexhibits.com instead.';
        return;
      }
      status.hidden = false;
      status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          status.textContent = 'Thanks, ' + name + '. We got your request and will be in touch soon.';
        })
        .catch(function () {
          status.textContent = 'Something went wrong sending the form. Please email hello@everspaceexhibits.com instead.';
        });
    });
  }
})();

/* Casa Rodica — booking bar with stay rules + placeholder submit.
   Ideal: Fri→Mon (weekend), Mon→Fri, 7+ nights.
   OK (mid-week): Mon→Wed, Mon→Thu, Tue→Thu. Min 2 nights.
   Submit is a stub until the reservation engine (Hoteliera) is wired in. */
(function () {
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function nightsTxt(n) { return n + ' ' + (n === 1 ? 'noapte' : 'nopți'); }

  function popup() {
    var ov = document.createElement('div');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(20,26,31,.6);display:flex;align-items:center;justify-content:center;padding:1.2rem';
    ov.innerHTML =
      '<div style="background:#F6F1E7;border:1px solid rgba(201,162,75,.5);border-radius:18px;max-width:400px;width:100%;padding:2rem 1.8rem;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.35);font-family:Poppins,system-ui,sans-serif">' +
        '<div style="width:52px;height:52px;margin:0 auto 1rem;border-radius:50%;border:1.6px solid #C9A24B;display:flex;align-items:center;justify-content:center">' +
          '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2F4733" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg></div>' +
        '<h3 style="margin:0 0 .4rem;font-size:1.25rem;color:#22303A">Not implemented</h3>' +
        '<p style="margin:0 0 1.4rem;font-family:Lato,system-ui,sans-serif;color:rgba(34,48,58,.62);font-size:.95rem">Rezervarea online va fi disponibilă în curând, odată cu integrarea sistemului nostru de rezervări.</p>' +
        '<button type="button" style="font-family:Poppins,system-ui,sans-serif;font-weight:600;background:#3FA34D;color:#fff;border:0;border-radius:999px;padding:.7rem 1.8rem;cursor:pointer">Am înțeles</button>' +
      '</div>';
    function close() { ov.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('button').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
  }

  document.querySelectorAll('form.bookbar[data-booking]').forEach(function (form) {
    var ci = form.querySelector('input[name=ci]');
    var co = form.querySelector('input[name=co]');
    var g = form.querySelector('select[name=g]');
    var cta = form.querySelector('[data-book-cta]');
    var status = (form.parentNode || document).querySelector('[data-book-status]');
    if (!ci || !co || !cta) return;

    var today = new Date(); today.setHours(0, 0, 0, 0);
    ci.min = iso(today);

    function classify() {
      if (!ci.value || !co.value) return { k: 'empty' };
      var a = new Date(ci.value), b = new Date(co.value);
      var nights = Math.round((b - a) / 86400000);
      if (nights <= 0) return { k: 'bad' };
      var cd = a.getDay(), od = b.getDay(); // 0=Sun … 6=Sat
      if (nights >= 7) return { k: 'ideal', n: nights };
      if (cd === 5 && od === 0) return { k: 'ideal', n: nights }; // Fri → Sun (weekend)
      if (cd === 1 && od === 5) return { k: 'ideal', n: nights };              // Mon → Fri
      if (cd === 1 && od === 3) return { k: 'ok', n: nights };                 // Mon → Wed
      if (cd === 1 && od === 4) return { k: 'ok', n: nights };                 // Mon → Thu
      if (cd === 2 && od === 4) return { k: 'ok', n: nights };                 // Tue → Thu
      if (nights < 2) return { k: 'min' };
      return { k: 'other', n: nights };
    }

    function update() {
      if (ci.value) { var a = new Date(ci.value); a.setDate(a.getDate() + 1); co.min = iso(a); if (co.value && new Date(co.value) <= new Date(ci.value)) co.value = ''; }
      var r = classify(), cls = '', txt = '';
      if (r.k === 'empty') txt = 'Alege datele. Sejururi recomandate: weekend Vineri–Duminică, Luni–Vineri sau 7+ nopți.';
      else if (r.k === 'bad') { cls = 'bad'; txt = 'Check-out trebuie să fie după check-in.'; }
      else if (r.k === 'min') { cls = 'bad'; txt = 'Sejur minim 2 nopți.'; }
      else if (r.k === 'ideal') { cls = 'ideal'; txt = '✓ Perioadă ideală de sejur (' + nightsTxt(r.n) + ').'; }
      else if (r.k === 'ok') { cls = 'ok'; txt = '✓ Disponibil — sejur mid-week (' + nightsTxt(r.n) + ').'; }
      else { cls = 'other'; txt = 'Combinație non-standard (' + nightsTxt(r.n) + '). Recomandăm weekend Vineri–Duminică, Luni–Vineri sau 7+ nopți.'; }
      if (status) { status.className = 'book-status' + (cls ? ' ' + cls : ''); status.textContent = txt; }
    }

    ci.addEventListener('change', update);
    co.addEventListener('change', update);
    if (g) g.addEventListener('change', update);
    cta.addEventListener('click', function (e) { e.preventDefault(); popup(); });
    update();
  });
})();

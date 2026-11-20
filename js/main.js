(function () {
  'use strict';

  var SMS_NUMBER = '01073695129';
  var MAIL_TO = 'ljc3196@daum.net';

  /* 헤더: 스크롤 시 테두리 */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 모바일 메뉴 */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* 등장 효과 + 현재 섹션 메뉴 표시 */
  var reveals = document.querySelectorAll('.reveal');
  var navLinks = nav.querySelectorAll('a');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObs.observe(el); });

    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObs.observe(s); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 상담 내용 → 문자 / 이메일 앱으로 전달 (서버 저장 없음) */
  var form = document.getElementById('inquiryForm');
  var errorBox = document.getElementById('formError');

  function buildMessage() {
    var v = function (name) { return form.elements[name].value.trim(); };
    var lines = [
      '[강원129이송단 이송 상담 요청]',
      '연락처: ' + v('phone'),
      '출발지: ' + v('from'),
      '도착지: ' + v('to')
    ];
    if (v('when')) lines.push('희망 일시: ' + v('when'));
    if (v('memo')) lines.push('환자 상태/메모: ' + v('memo'));
    return lines.join('\n');
  }

  function validate() {
    var ok = true;
    var first = null;
    ['phone', 'from', 'to'].forEach(function (name) {
      var input = form.elements[name];
      var empty = !input.value.trim();
      input.classList.toggle('is-invalid', empty);
      if (empty) { ok = false; first = first || input; }
    });
    errorBox.hidden = ok;
    if (first) first.focus();
    return ok;
  }

  form.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-send]');
    if (!btn) return;
    if (!validate()) return;

    var body = encodeURIComponent(buildMessage());
    if (btn.dataset.send === 'sms') {
      /* '?&body=' 형식은 iOS·안드로이드 양쪽에서 동작 */
      window.location.href = 'sms:' + SMS_NUMBER + '?&body=' + body;
    } else {
      var subject = encodeURIComponent('[이송 상담 요청] ' + form.elements.from.value.trim() + ' → ' + form.elements.to.value.trim());
      window.location.href = 'mailto:' + MAIL_TO + '?subject=' + subject + '&body=' + body;
    }
  });

  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid') && e.target.value.trim()) {
      e.target.classList.remove('is-invalid');
      if (!form.querySelector('.is-invalid')) errorBox.hidden = true;
    }
  });

  /* 푸터 연도 */
  document.getElementById('year').textContent = new Date().getFullYear();
})();

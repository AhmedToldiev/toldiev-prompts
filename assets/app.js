(function () {
  var toast = document.querySelector(".toast");
  var toastTimer;

  function showToast(text, label) {
    if (!toast) return;
    if (label) {
      toast.textContent = label;
    } else {
      toast.innerHTML = "Скопировано: <code></code>";
      toast.querySelector("code").textContent = text;
    }
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      copy(text).then(function () {
        btn.classList.add("is-copied");
        showToast(text, btn.getAttribute("data-toast"));
        setTimeout(function () { btn.classList.remove("is-copied"); }, 1500);
      });
    });
  });

  // На телефоне меню — обычная лента: текущий пункт в видимую область
  var current = document.querySelector('.topnav [aria-current="page"]');
  var topnav = document.querySelector(".topnav");
  if (current && topnav && window.matchMedia("(max-width: 720px), (hover: none)").matches) {
    topnav.scrollLeft += current.getBoundingClientRect().left - topnav.getBoundingClientRect().left - 8;
  }

  // Разделы страницы: колесо мыши и подсветка текущего раздела
  var chips = document.querySelector(".chips");
  if (chips) {
    chips.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || chips.scrollWidth <= chips.clientWidth) return;
      e.preventDefault();
      chips.scrollLeft += e.deltaY;
    }, { passive: false });

    var links = Array.prototype.slice.call(chips.querySelectorAll("a"));
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var active = null;
    var spy = function () {
      var line = (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0) + 140;
      var idx = -1;
      targets.forEach(function (t, i) { if (t && !t.hidden && t.getBoundingClientRect().top <= line) idx = i; });
      var next = links[idx] || null;
      if (next === active) return;
      if (active) active.classList.remove("is-active");
      active = next;
      if (active) {
        active.classList.add("is-active");
        chips.scrollTo({ left: active.offsetLeft - 24, behavior: "smooth" });
      }
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  // Высота закреплённой шапки — для липкой панели поиска и якорей
  var header = document.querySelector(".site-header");
  if (header) {
    var setH = function () { document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px"); };
    setH();
    window.addEventListener("resize", setH);
  }

  // Поиск по командам на странице
  var input = document.querySelector(".search input");
  if (input) {
    var items = document.querySelectorAll(".cmd");
    var groups = document.querySelectorAll(".group");
    var empty = document.querySelector(".empty");
    var toolbar = document.querySelector(".toolbar");
    var groupsBox = document.querySelector(".groups");
    var lastQ = "";
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase().replace(/^\//, "");
      var shown = 0;
      items.forEach(function (li) {
        var match = !q || li.getAttribute("data-search").indexOf(q) !== -1;
        li.hidden = !match;
        if (match) shown++;
      });
      groups.forEach(function (g) {
        g.hidden = !g.querySelector(".cmd:not([hidden])");
      });
      if (empty) empty.hidden = shown !== 0;
      if (toolbar) toolbar.classList.toggle("is-searching", !!q);
      // Результаты — сразу под строкой поиска, а не где-то выше экрана
      if (q && q !== lastQ && groupsBox && toolbar) {
        var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
        var top = groupsBox.getBoundingClientRect().top + window.scrollY - headerH - toolbar.offsetHeight + 1;
        if (Math.abs(window.scrollY - top) > 2) window.scrollTo({ top: top, behavior: "auto" });
      }
      lastQ = q;
    });
    var reset = document.querySelector(".empty-reset");
    if (reset) reset.addEventListener("click", function () {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.focus();
    });
  }
})();


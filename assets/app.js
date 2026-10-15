(function () {
  var html = document.documentElement;
  var isEn = function () { return html.classList.contains("en"); };
  var headerH = function () { return parseInt(getComputedStyle(html).getPropertyValue("--header-h")) || 0; };

  var toast = document.querySelector(".toast");
  var toastTimer;

  function showToast(text, label) {
    if (!toast) return;
    if (label) {
      toast.textContent = label;
    } else {
      toast.innerHTML = (isEn() ? "Copied: " : "Скопировано: ") + "<code></code>";
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

  document.querySelectorAll("[data-copy], [data-copy-from]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var from = btn.getAttribute("data-copy-from");
      var text = from ? document.getElementById(from).textContent : btn.getAttribute("data-copy") || "";
      copy(text).then(function () {
        btn.classList.add("is-copied");
        showToast(text, btn.getAttribute("data-toast"));
        setTimeout(function () { btn.classList.remove("is-copied"); }, 1500);
      });
    });
  });

  // Видна только одна языковая версия; у скрытой offsetParent === null
  var visible = function (el) { return !!el && el.offsetParent !== null; };

  // На телефоне меню — обычная лента: текущий пункт в видимую область
  var narrow = window.matchMedia("(max-width: 720px), (hover: none)");
  function showCurrent() {
    if (!narrow.matches) return;
    document.querySelectorAll(".topnav").forEach(function (topnav) {
      var current = topnav.querySelector('[aria-current="page"]');
      if (!current || !visible(topnav)) return;
      topnav.scrollLeft += current.getBoundingClientRect().left - topnav.getBoundingClientRect().left - 8;
    });
  }
  showCurrent();
  // после загрузки шрифта ширина пунктов меняется — пересчитываем
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(showCurrent);

  // Высота закреплённой шапки — для липкой панели поиска и якорей
  var header = document.querySelector(".site-header");
  var setH = function () { if (header) html.style.setProperty("--header-h", header.offsetHeight + "px"); };
  setH();
  window.addEventListener("resize", setH);

  // Разделы и поиск — отдельно в каждой языковой версии страницы
  var spies = [];
  document.querySelectorAll("main > [lang]").forEach(function (root) {
    // Разделы страницы: колесо мыши и подсветка текущего раздела
    var chips = root.querySelector(".chips");
    if (chips) {
      chips.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || chips.scrollWidth <= chips.clientWidth) return;
        e.preventDefault();
        chips.scrollLeft += e.deltaY;
      }, { passive: false });

      var links = Array.prototype.slice.call(chips.querySelectorAll("a"));
      var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
      var active = null;
      var spy = function () {
        if (!visible(root)) return;
        var line = headerH() + 140;
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
      spies.push(spy);
      window.addEventListener("scroll", spy, { passive: true });
      spy();
    }

    // Поиск по командам на странице
    var input = root.querySelector(".search input");
    if (input) {
      var items = root.querySelectorAll(".cmd");
      var groups = root.querySelectorAll(".group");
      var empty = root.querySelector(".empty");
      var toolbar = root.querySelector(".toolbar");
      var groupsBox = root.querySelector(".groups");
      var lastQ = "";
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase().replace(/^\//, "");
        var shown = 0;
        items.forEach(function (li) {
          var match = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
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
          var top = groupsBox.getBoundingClientRect().top + window.scrollY - headerH() - toolbar.offsetHeight + 1;
          if (Math.abs(window.scrollY - top) > 2) window.scrollTo({ top: top, behavior: "auto" });
        }
        lastQ = q;
      });
      var reset = root.querySelector(".empty-reset");
      if (reset) reset.addEventListener("click", function () {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        input.focus();
      });
    }
  });

  // Переключатель языка: RU ⇄ EN без перезагрузки, выбор запоминается
  var switcher = document.querySelector(".lang-switch");
  if (switcher) switcher.addEventListener("click", function () {
    var en = !isEn();
    html.classList.toggle("en", en);
    html.lang = en ? "en" : "ru";
    document.title = html.getAttribute(en ? "data-title-en" : "data-title-ru");
    try { localStorage.setItem("lang", en ? "en" : "ru"); } catch (e) {}
    setH();
    showCurrent();
    spies.forEach(function (spy) { spy(); });
  });
})();

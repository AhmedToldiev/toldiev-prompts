// Генератор статичного сайта: node build.mjs → dist/
// Каждая страница содержит обе версии — русскую и английскую; переключатель в шапке показывает нужную.
import { mkdirSync, rmSync, cpSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import config from "./site.config.mjs";
import categories from "./data/categories.mjs";
import en from "./data/en.mjs";

const OUT = "dist";
const LANGS = ["ru", "en"];

// Версия стилей и скрипта: меняется вместе с их содержимым, чтобы браузер не держал старый кеш
const VERSION = createHash("sha1")
  .update(readFileSync("assets/style.css"))
  .update(readFileSync("assets/app.js"))
  .digest("hex")
  .slice(0, 8);

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const pad = (n) => String(n).padStart(2, "0");
const countOf = (cat) => (cat.items ? cat.items.length : cat.sections.reduce((n, s) => n + s.cmds.length, 0));
const kindOf = (cat) => cat.kind || "commands";

function pluralRu(n, [one, few, many]) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const pluralEn = (n, [one, many]) => (n === 1 ? one : many);

// Строки интерфейса
const UI = {
  ru: {
    ...config,
    plural: pluralRu,
    units: {
      commands: ["команда", "команды", "команд"],
      prompts: ["промпт", "промпта", "промптов"],
      links: ["сайт", "сайта", "сайтов"],
      pages: ["страница", "страницы", "страниц"],
    },
    nav: "Направления",
    heroTitle: (t) => `${t}, которые экономят часы`,
    heroLead:
      "Короткие команды-ярлыки для ChatGPT. Пришли материал, добавь команду — и получи нужный результат без длинных промптов. Выбери направление.",
    back: "← Все направления",
    howto: "Как пользоваться",
    hints: {
      commands: "Нажми на команду — она скопируется.",
      prompts: "Промпт копируется кнопкой «Скопировать».",
      links: "Ссылка копируется кнопкой рядом с ней.",
    },
    copy: "Скопировать",
    copyCmd: "Скопировать",
    copyLink: "Скопировать ссылку",
    copyAll: "Скопировать все",
    promptCopied: "Промпт скопирован",
    instructionCopied: "Инструкция скопирована",
    linksCopied: "Ссылки скопированы",
    showText: "Показать текст",
    hideText: "Свернуть текст",
    allLinks: "Все ссылки разом",
    allLinksHint: "Одним текстом — себе в заметки или в «Избранное».",
    search: "Найти команду",
    sectionsNav: "Разделы",
    empty: "Ничего не нашлось.",
    resetSearch: "Сбросить поиск",
    pagerNav: "Другие направления",
    prev: "← Назад",
    next: "Дальше →",
    commandList: "Список команд:",
    notFoundTitle: "Страница не найдена",
    notFoundH1: "Такой страницы нет",
    notFoundLink: "Вернуться к направлениям →",
  },
  en: {
    ...config,
    ...config.en,
    plural: pluralEn,
    units: {
      commands: ["command", "commands"],
      prompts: ["prompt", "prompts"],
      links: ["website", "websites"],
      pages: ["page", "pages"],
    },
    nav: "Topics",
    heroTitle: (t) => `${t} that save you hours`,
    heroLead:
      "Quick shortcut commands for ChatGPT. Send your material, add a command — and get the result you need without long prompts. Pick a topic.",
    back: "← All topics",
    howto: "How to use",
    hints: {
      commands: "Click a command to copy it.",
      prompts: "Copy a prompt with the “Copy” button.",
      links: "Copy a link with the button next to it.",
    },
    copy: "Copy",
    copyCmd: "Copy",
    copyLink: "Copy link",
    copyAll: "Copy all",
    promptCopied: "Prompt copied",
    instructionCopied: "Instruction copied",
    linksCopied: "Links copied",
    showText: "Show text",
    hideText: "Hide text",
    allLinks: "All links at once",
    allLinksHint: "As one text — for your notes or saved messages.",
    search: "Find a command",
    sectionsNav: "Sections",
    empty: "Nothing found.",
    resetSearch: "Reset search",
    pagerNav: "Other topics",
    prev: "← Back",
    next: "Next →",
    commandList: "Command list:",
    notFoundTitle: "Page not found",
    notFoundH1: "This page doesn't exist",
    notFoundLink: "Back to all topics →",
  },
};

// Английская версия категории: структура и команды — из русской, тексты — из data/en.mjs.
// Чего нет в переводе — остаётся по-русски, с предупреждением при сборке.
function localize(cat) {
  const tr = en[cat.slug];
  const missing = (what) => console.warn(`[en] ${cat.slug}: нет перевода — ${what}`);
  if (!tr) {
    missing("вся страница");
    return cat;
  }
  const out = { ...cat };
  for (const key of ["short", "title", "h1", "eyebrow", "lead", "howto"]) {
    if (tr[key]) out[key] = tr[key];
    else missing(key);
  }
  if (cat.prompt) {
    if (tr.prompt) out.prompt = tr.prompt;
    else missing("prompt");
  }
  if (cat.sections) {
    out.sections = cat.sections.map((s, si) => ({
      title: tr.sections?.[si] ?? (missing(`раздел ${si + 1}`), s.title),
      cmds: s.cmds.map(([cmd, desc]) => [cmd, tr.cmds?.[cmd] ?? (missing(cmd), desc)]),
    }));
  }
  if (cat.items) {
    out.items = cat.items.map((item, ii) => {
      if (!tr.items?.[ii]) missing(`карточка ${ii + 1}`);
      return { ...item, ...tr.items?.[ii] };
    });
  }
  return out;
}

const CATS = { ru: categories, en: categories.map(localize) };

const ICONS = {
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2.5Z"/><path d="M4 19.5A2 2 0 0 0 6 21h13"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L5 21"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
  check: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

const COPY_ICON =
  '<svg class="i-copy" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg><svg class="i-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

const TG_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" class="tg"><path d="M21.05 3.76 2.9 10.86c-1.24.5-1.23 1.2-.23 1.5l4.65 1.45 1.8 5.55c.22.6.37.85.75.85.31 0 .46-.14.65-.35l1.65-1.6 4.06 3c.75.42 1.29.2 1.48-.7l2.68-12.65c.28-1.15-.35-1.65-1.34-1.15Z" fill="currentColor"/></svg>';

// Префикс id: у русской версии id прежние (старые ссылки с #якорями работают), у английской — en-…
const idp = (lang) => (lang === "ru" ? "" : `${lang}-`);

// Язык выбирается до отрисовки, чтобы не мигал другой: сохранённый выбор → язык браузера.
// Поисковым роботам всегда русская версия.
const LANG_SCRIPT = `<script>!function(d){var l;try{l=localStorage.getItem("lang")}catch(e){}if(l!=="ru"&&l!=="en"){l="ru";if(!/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)){var a=navigator.languages||[navigator.language||""];l=a.some(function(x){return/^(ru|uk|be|kk)\\b/i.test(x)})?"ru":"en"}}if(l==="en"){d.classList.add("en");d.lang="en";document.title=d.getAttribute("data-title-en")}}(document.documentElement)</script>`;

function topnav(lang, path) {
  return `<nav class="topnav l-${lang}" aria-label="${esc(UI[lang].nav)}">
        <div class="marquee-track">
          ${[0, 1]
            .map(
              (copy) => `<div class="marquee-group"${copy ? ' aria-hidden="true"' : ""}>
            ${CATS[lang]
              .map(
                (c) =>
                  `<a href="/${c.slug}/"${path === `/${c.slug}/` && !copy ? ' aria-current="page"' : path === `/${c.slug}/` ? ' class="is-current"' : ""}${copy ? ' tabindex="-1"' : ""}>${esc(c.title)}</a>`
              )
              .join("\n            ")}
          </div>`
            )
            .join("\n          ")}
        </div>
      </nav>`;
}

// pages: { ru: {title, description, body}, en: {...} }
function layout({ path, pages }) {
  const canonical = config.siteUrl ? `<link rel="canonical" href="${esc(config.siteUrl + path)}" />` : "";
  const { title, description } = pages.ru;
  const both = (fn) => LANGS.map((lang) => `<span class="l-${lang}">${fn(UI[lang])}</span>`).join("");
  const telegram = config.telegram
    ? `<a class="pill" href="https://t.me/${esc(config.telegram)}" target="_blank" rel="noopener">${TG_ICON}Telegram: @${esc(config.telegram)}</a>`
    : "";
  return `<!doctype html>
<html lang="ru" data-title-ru="${esc(title)}" data-title-en="${esc(pages.en.title)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(title)}</title>
  ${LANG_SCRIPT}
  <meta name="description" content="${esc(description)}" />
  ${canonical}
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="theme-color" content="#14130F" />
  <meta name="color-scheme" content="dark" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="preload" href="/assets/fonts/manrope-cyrillic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/style.css?v=${VERSION}" />
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="brand" href="/">${both((t) => esc(t.brand))}</a>
      ${LANGS.map((lang) => topnav(lang, path)).join("\n      ")}
      <button class="lang-switch" type="button" aria-label="Русский / English"><span class="lang-opt" lang="ru">RU</span><span class="lang-opt" lang="en">EN</span></button>
    </div>
  </header>
  <main>
    ${LANGS.map((lang) => `<div class="l-${lang}" lang="${lang}">${pages[lang].body}\n    </div>`).join("\n    ")}
  </main>
  <footer class="site-footer">
    <div class="container">
      ${both((t) => esc(t.author))}
      ${telegram}
    </div>
  </footer>
  <div class="toast" role="status" aria-live="polite"></div>
  <script src="/assets/app.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

// Собрать страницу на обоих языках: render(lang) → {title, description, body}
const page = (path, render) => layout({ path, pages: Object.fromEntries(LANGS.map((lang) => [lang, render(lang)])) });

const countLabel = (cat, lang) => {
  const t = UI[lang], n = countOf(cat);
  return `${n} ${t.plural(n, t.units[kindOf(cat)])}`;
};

function homeBody(lang) {
  const t = UI[lang], cats = CATS[lang];
  const total = cats.filter((c) => kindOf(c) === "commands").reduce((n, c) => n + countOf(c), 0);
  const cards = cats
    .map(
      (c) => `
          <a class="card" href="/${c.slug}/">
            <span class="card-icon">${icon(c.icon)}</span>
            <span class="card-title">${esc(c.title)}</span>
            <span class="card-lead">${esc(c.short)}</span>
            <span class="card-meta">${countLabel(c, lang)} <span aria-hidden="true">→</span></span>
          </a>`
    )
    .join("");
  const body = `
    <section class="hero">
      <div class="container">
        <span class="eyebrow">${total} ${t.plural(total, t.units.commands)} · ${cats.length} ${t.plural(cats.length, t.units.pages)}</span>
        <h1>${esc(t.heroTitle(t.title))}</h1>
        <p class="lead">${esc(t.heroLead)}</p>
      </div>
    </section>
    <section>
      <div class="container">
        <div class="grid">${cards}
        </div>
      </div>
    </section>`;
  return { title: t.title, description: t.description, body };
}

// Текст инструкции: готовый (text) или вступление + список всех команд страницы (intro)
function promptText(cat, lang) {
  if (cat.prompt.text) return cat.prompt.text;
  const list = cat.sections.flatMap((s) => s.cmds.map(([cmd, desc]) => `${cmd} — ${desc}`));
  return `${cat.prompt.intro}\n\n${UI[lang].commandList}\n${list.join("\n")}`;
}

// Страница с готовыми длинными промптами
function promptsBody(cat, lang) {
  const t = UI[lang], p_ = idp(lang);
  return `
      <div class="prompt-cards">${cat.items
        .map(
          (p, pi) => `
        <section class="pcard" id="${p_}s${pi + 1}">
          <div class="prompt-head">
            <div>
              <span class="tier">${pad(pi + 1)}</span>
              <h2>${esc(p.title)}</h2>
              <p class="hint">${esc(p.desc)}</p>
            </div>
            <button class="btn" type="button" data-copy-from="${p_}p${pi + 1}" data-toast="${esc(t.promptCopied)}">${COPY_ICON}<span>${esc(t.copy)}</span></button>
          </div>
          <pre id="${p_}p${pi + 1}" lang="en">${esc(p.text)}</pre>${
            p.tips?.length ? `\n          <ul class="tips">${p.tips.map((tip) => `<li>${esc(tip)}</li>`).join("")}</ul>` : ""
          }
        </section>`
        )
        .join("")}
      </div>`;
}

// Страница-подборка ссылок
function linksBody(cat, lang) {
  const t = UI[lang], p_ = idp(lang);
  const all = cat.items.map((l) => `${l.title} — ${l.url}`).join("\n");
  return `
      <div class="prompt-cards">${cat.items
        .map(
          (l, li) => `
        <section class="pcard" id="${p_}s${li + 1}">
          <div class="prompt-head">
            <div>
              <span class="tier">${pad(li + 1)} · ${esc(l.tag)}</span>
              <h2><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title)} ↗</a></h2>
              <p class="hint">${esc(l.desc)}</p>
            </div>
            <button class="cmd-copy" type="button" data-copy="${esc(l.url)}" aria-label="${esc(t.copyLink)} ${esc(l.title)}"><code>${esc(l.url.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</code><span class="copy-ico" aria-hidden="true"></span></button>
          </div>${
            l.tips?.length ? `\n          <ul class="tips">${l.tips.map((tip) => `<li>${esc(tip)}</li>`).join("")}</ul>` : ""
          }
        </section>`
        )
        .join("")}
        <div class="prompt-box">
          <div class="prompt-head">
            <div>
              <h2>${esc(t.allLinks)}</h2>
              <p class="hint">${esc(t.allLinksHint)}</p>
            </div>
            <button class="btn" type="button" data-copy="${esc(all)}" data-toast="${esc(t.linksCopied)}">${COPY_ICON}<span>${esc(t.copyAll)}</span></button>
          </div>
        </div>
      </div>`;
}

function categoryBody(i, lang) {
  const t = UI[lang], p_ = idp(lang), cats = CATS[lang], cat = cats[i];
  let n = 0;
  const sections = (cat.sections || [])
    .map((s, si) => {
      const from = n + 1;
      const items = s.cmds
        .map(([cmd, desc]) => {
          n++;
          return `
            <li class="cmd">
              <span class="cmd-num">${pad(n)}</span>
              <button class="cmd-copy" type="button" data-copy="${esc(cmd)}" title="${esc(t.copyCmd)}"><code>${esc(cmd)}</code><span class="copy-ico" aria-hidden="true"></span></button>
              <span class="cmd-desc">${esc(desc)}</span>
            </li>`;
        })
        .join("");
      return `
          <section class="group" id="${p_}s${si + 1}">
            <div class="group-head">
              <h2>${esc(s.title)}</h2>
              <span class="tier">${pad(from)}–${pad(n)}</span>
            </div>
            <ul class="cmd-list">${items}
            </ul>
          </section>`;
    })
    .join("");

  const prev = cats[(i - 1 + cats.length) % cats.length];
  const next = cats[(i + 1) % cats.length];

  const body = `
    <section class="hero hero-page">
      <div class="container">
        <a class="back" href="/">${esc(t.back)}</a>
        <span class="eyebrow">${esc(cat.eyebrow)} · ${countLabel(cat, lang)}</span>
        <h1>${esc(cat.h1)}</h1>
        <p class="lead">${esc(cat.lead)}</p>
      </div>
    </section>
    <div class="container">
      <div class="howto">
        <h2>${esc(t.howto)}</h2>
        <ol>${cat.howto.map((h) => `<li>${esc(h)}</li>`).join("")}</ol>
        <p class="hint">${esc(t.hints[kindOf(cat)])}</p>
      </div>${
        cat.prompt
          ? `
      <div class="prompt-box">
        <div class="prompt-head">
          <div>
            <h2>${esc(cat.prompt.title)}</h2>
            <p class="hint">${esc(cat.prompt.note)}</p>
          </div>
          <button class="btn" type="button" data-copy-from="${p_}instruction" data-toast="${esc(t.instructionCopied)}">${COPY_ICON}<span>${esc(t.copy)}</span></button>
        </div>
        <details>
          <summary><span class="when-closed">${esc(t.showText)}</span><span class="when-open">${esc(t.hideText)}</span></summary>
          <pre id="${p_}instruction">${esc(promptText(cat, lang))}</pre>
        </details>
      </div>`
          : ""
      }
${
        kindOf(cat) === "prompts"
          ? promptsBody(cat, lang)
          : kindOf(cat) === "links"
            ? linksBody(cat, lang)
            : `
      <div class="toolbar">
        <label class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" placeholder="${esc(t.search)}" aria-label="${esc(t.search)}" />
        </label>
        <nav class="chips" aria-label="${esc(t.sectionsNav)}">
          ${cat.sections.map((s, si) => `<a href="#${p_}s${si + 1}">${esc(s.title)}</a>`).join("\n          ")}
        </nav>
      </div>
      <div class="groups">${sections}
        <p class="empty" hidden>${esc(t.empty)}<button class="empty-reset" type="button">${esc(t.resetSearch)}</button></p>
      </div>`
      }
      <nav class="pager" aria-label="${esc(t.pagerNav)}">
        <a href="/${prev.slug}/"><small>${esc(t.prev)}</small>${esc(prev.title)}</a>
        <a href="/${next.slug}/" class="next"><small>${esc(t.next)}</small>${esc(next.title)}</a>
      </nav>
    </div>`;

  return { title: `${cat.h1} — ${t.brand}`, description: cat.lead, body };
}

function notFoundBody(lang) {
  const t = UI[lang];
  return {
    title: `${t.notFoundTitle} — ${t.brand}`,
    description: t.description,
    body: `<section class="hero"><div class="container"><span class="eyebrow">404</span><h1>${esc(t.notFoundH1)}</h1><p class="lead"><a href="/">${esc(t.notFoundLink)}</a></p></div></section>`,
  };
}

// Минификация: убираем переносы и отступы между тегами (текст внутри <pre> не трогаем — в нём нет тегов)
const minifyHtml = (html) => html.replace(/>\s*\n\s*</g, "><").trim() + "\n";
const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*\n\s*/g, "")
    .replace(/\s*([{};,>])\s*/g, "$1")
    .replace(/;}/g, "}");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("assets", `${OUT}/assets`, { recursive: true });
writeFileSync(`${OUT}/assets/style.css`, minifyCss(readFileSync("assets/style.css", "utf8")));
writeFileSync(`${OUT}/index.html`, minifyHtml(page("/", homeBody)));
categories.forEach((cat, i) => {
  mkdirSync(`${OUT}/${cat.slug}`, { recursive: true });
  writeFileSync(`${OUT}/${cat.slug}/index.html`, minifyHtml(page(`/${cat.slug}/`, (lang) => categoryBody(i, lang))));
});
writeFileSync(`${OUT}/404.html`, page("/404", notFoundBody));
console.log(`Готово: ${categories.length + 1} страниц в ${OUT}/ (RU + EN)`);

// Генератор статичного сайта: node build.mjs → dist/
import { mkdirSync, rmSync, cpSync, writeFileSync } from "node:fs";
import config from "./site.config.mjs";
import categories from "./data/categories.mjs";

const OUT = "dist";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const pad = (n) => String(n).padStart(2, "0");
const countOf = (cat) => (cat.items ? cat.items.length : cat.sections.reduce((n, s) => n + s.cmds.length, 0));

const UNITS = {
  commands: ["команда", "команды", "команд"],
  prompts: ["промпт", "промпта", "промптов"],
  links: ["сайт", "сайта", "сайтов"],
};
function plural(n, [one, few, many]) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const kindOf = (cat) => cat.kind || "commands";
const countLabel = (cat) => `${countOf(cat)} ${plural(countOf(cat), UNITS[kindOf(cat)])}`;

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

const IG_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" class="ig"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>';
const TG_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" class="tg"><path d="M21.05 3.76 2.9 10.86c-1.24.5-1.23 1.2-.23 1.5l4.65 1.45 1.8 5.55c.22.6.37.85.75.85.31 0 .46-.14.65-.35l1.65-1.6 4.06 3c.75.42 1.29.2 1.48-.7l2.68-12.65c.28-1.15-.35-1.65-1.34-1.15Z" fill="currentColor"/></svg>';

function layout({ title, description, path, body }) {
  const canonical = config.siteUrl ? `<link rel="canonical" href="${esc(config.siteUrl + path)}" />` : "";
  const instagram = config.instagram
    ? `<a class="social" href="https://instagram.com/${esc(config.instagram)}" target="_blank" rel="noopener" aria-label="Instagram ${esc(config.instagram)}">${IG_ICON}<span>${esc(config.instagram)}</span></a>`
    : "";
  const telegram = config.telegram
    ? `<a class="pill" href="https://t.me/${esc(config.telegram)}" target="_blank" rel="noopener">${TG_ICON}Telegram: @${esc(config.telegram)}</a>`
    : "";
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  ${canonical}
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="theme-color" content="#F4F1EA" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#14130F" media="(prefers-color-scheme: dark)" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="brand" href="/">${esc(config.brand)}</a>
      <nav class="topnav" aria-label="Направления">
        <div class="marquee-track">
          ${[0, 1]
            .map(
              (copy) => `<div class="marquee-group"${copy ? ' aria-hidden="true"' : ""}>
            ${categories
              .map(
                (c) =>
                  `<a href="/${c.slug}/"${path === `/${c.slug}/` && !copy ? ' aria-current="page"' : path === `/${c.slug}/` ? ' class="is-current"' : ""}${copy ? ' tabindex="-1"' : ""}>${esc(c.title)}</a>`
              )
              .join("\n            ")}
          </div>`
            )
            .join("\n          ")}
        </div>
      </nav>
      ${instagram}
    </div>
  </header>
  <main>
${body}
  </main>
  <footer class="site-footer">
    <div class="container">
      <span>${esc(config.author)}</span>
      ${telegram}
    </div>
  </footer>
  <div class="toast" role="status" aria-live="polite"></div>
  <script src="/assets/app.js" defer></script>
</body>
</html>
`;
}

function homePage() {
  const total = categories.filter((c) => kindOf(c) === "commands").reduce((n, c) => n + countOf(c), 0);
  const cards = categories
    .map(
      (c) => `
          <a class="card" href="/${c.slug}/">
            <span class="card-icon">${icon(c.icon)}</span>
            <span class="card-title">${esc(c.title)}</span>
            <span class="card-lead">${esc(c.short)}</span>
            <span class="card-meta">${countLabel(c)} <span aria-hidden="true">→</span></span>
          </a>`
    )
    .join("");
  const body = `
    <section class="hero">
      <div class="container">
        <span class="eyebrow">${total} ${plural(total, UNITS.commands)} · ${categories.length} страниц</span>
        <h1>${esc(config.title)}, которые экономят часы</h1>
        <p class="lead">Короткие команды-ярлыки для ChatGPT. Пришли материал, добавь команду — и получи нужный результат без длинных промптов. Выбери направление.</p>
      </div>
    </section>
    <section>
      <div class="container">
        <div class="grid">${cards}
        </div>
      </div>
    </section>`;
  return layout({ title: config.title, description: config.description, path: "/", body });
}

// Текст инструкции: готовый (text) или вступление + список всех команд страницы (intro)
function promptText(cat) {
  if (cat.prompt.text) return cat.prompt.text;
  const list = cat.sections.flatMap((s) => s.cmds.map(([cmd, desc]) => `${cmd} — ${desc}`));
  return `${cat.prompt.intro}\n\nСписок команд:\n${list.join("\n")}`;
}

// Страница с готовыми длинными промптами
function promptsBody(cat) {
  return `
      <div class="prompt-cards">${cat.items
        .map(
          (p, pi) => `
        <section class="pcard" id="s${pi + 1}">
          <div class="prompt-head">
            <div>
              <span class="tier">${pad(pi + 1)}</span>
              <h2>${esc(p.title)}</h2>
              <p class="hint">${esc(p.desc)}</p>
            </div>
            <button class="btn" type="button" data-copy="${esc(p.text)}" data-toast="Промпт скопирован">${COPY_ICON}<span>Скопировать</span></button>
          </div>
          <pre>${esc(p.text)}</pre>${
            p.tips?.length ? `\n          <ul class="tips">${p.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""
          }
        </section>`
        )
        .join("")}
      </div>`;
}

// Страница-подборка ссылок
function linksBody(cat) {
  const all = cat.items.map((l) => `${l.title} — ${l.url}`).join("\n");
  return `
      <div class="prompt-cards">${cat.items
        .map(
          (l, li) => `
        <section class="pcard" id="s${li + 1}">
          <div class="prompt-head">
            <div>
              <span class="tier">${pad(li + 1)} · ${esc(l.tag)}</span>
              <h2><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title)} ↗</a></h2>
              <p class="hint">${esc(l.desc)}</p>
            </div>
            <button class="cmd-copy" type="button" data-copy="${esc(l.url)}" aria-label="Скопировать ссылку ${esc(l.title)}"><code>${esc(l.url.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</code><span class="copy-ico">${COPY_ICON}</span></button>
          </div>${
            l.tips?.length ? `\n          <ul class="tips">${l.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""
          }
        </section>`
        )
        .join("")}
        <div class="prompt-box">
          <div class="prompt-head">
            <div>
              <h2>Все ссылки разом</h2>
              <p class="hint">Одним текстом — себе в заметки или в «Избранное».</p>
            </div>
            <button class="btn" type="button" data-copy="${esc(all)}" data-toast="Ссылки скопированы">${COPY_ICON}<span>Скопировать все</span></button>
          </div>
        </div>
      </div>`;
}

const HINTS = {
  commands: "Нажми на команду — она скопируется.",
  prompts: "Промпт копируется кнопкой «Скопировать».",
  links: "Ссылка копируется кнопкой рядом с ней.",
};

function categoryPage(cat, i) {
  let n = 0;
  const sections = (cat.sections || [])
    .map((s, si) => {
      const from = n + 1;
      const items = s.cmds
        .map(([cmd, desc]) => {
          n++;
          return `
            <li class="cmd" data-search="${esc((cmd + " " + desc).toLowerCase())}">
              <span class="cmd-num">${pad(n)}</span>
              <button class="cmd-copy" type="button" data-copy="${esc(cmd)}" aria-label="Скопировать ${esc(cmd)}">
                <code>${esc(cmd)}</code><span class="copy-ico">${COPY_ICON}</span>
              </button>
              <span class="cmd-desc">${esc(desc)}</span>
            </li>`;
        })
        .join("");
      return `
          <section class="group" id="s${si + 1}">
            <div class="group-head">
              <h2>${esc(s.title)}</h2>
              <span class="tier">${pad(from)}–${pad(n)}</span>
            </div>
            <ul class="cmd-list">${items}
            </ul>
          </section>`;
    })
    .join("");

  const prev = categories[(i - 1 + categories.length) % categories.length];
  const next = categories[(i + 1) % categories.length];

  const body = `
    <section class="hero hero-page">
      <div class="container">
        <a class="back" href="/">← Все направления</a>
        <span class="eyebrow">${esc(cat.eyebrow)} · ${countLabel(cat)}</span>
        <h1>${esc(cat.h1)}</h1>
        <p class="lead">${esc(cat.lead)}</p>
      </div>
    </section>
    <div class="container">
      <div class="howto">
        <h2>Как пользоваться</h2>
        <ol>${cat.howto.map((h) => `<li>${esc(h)}</li>`).join("")}</ol>
        <p class="hint">${HINTS[kindOf(cat)]}</p>
      </div>${
        cat.prompt
          ? `
      <div class="prompt-box">
        <div class="prompt-head">
          <div>
            <h2>${esc(cat.prompt.title)}</h2>
            <p class="hint">${esc(cat.prompt.note)}</p>
          </div>
          <button class="btn" type="button" data-copy="${esc(promptText(cat))}" data-toast="Инструкция скопирована">${COPY_ICON}<span>Скопировать</span></button>
        </div>
        <details>
          <summary>Показать текст</summary>
          <pre>${esc(promptText(cat))}</pre>
        </details>
      </div>`
          : ""
      }
${
        kindOf(cat) === "prompts"
          ? promptsBody(cat)
          : kindOf(cat) === "links"
            ? linksBody(cat)
            : `
      <div class="toolbar">
        <label class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" placeholder="Найти команду" aria-label="Найти команду" />
        </label>
        <nav class="chips" aria-label="Разделы">
          ${cat.sections.map((s, si) => `<a href="#s${si + 1}">${esc(s.title)}</a>`).join("\n          ")}
        </nav>
      </div>
      <div class="groups">${sections}
        <p class="empty" hidden>Ничего не нашлось.<button class="empty-reset" type="button">Сбросить поиск</button></p>
      </div>`
      }
      <nav class="pager" aria-label="Другие направления">
        <a href="/${prev.slug}/"><small>← Назад</small>${esc(prev.title)}</a>
        <a href="/${next.slug}/" class="next"><small>Дальше →</small>${esc(next.title)}</a>
      </nav>
    </div>`;

  return layout({
    title: `${cat.h1} — ${config.brand}`,
    description: cat.lead,
    path: `/${cat.slug}/`,
    body,
  });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("assets", `${OUT}/assets`, { recursive: true });
writeFileSync(`${OUT}/index.html`, homePage());
categories.forEach((cat, i) => {
  mkdirSync(`${OUT}/${cat.slug}`, { recursive: true });
  writeFileSync(`${OUT}/${cat.slug}/index.html`, categoryPage(cat, i));
});
writeFileSync(
  `${OUT}/404.html`,
  layout({
    title: `Страница не найдена — ${config.brand}`,
    description: config.description,
    path: "/404",
    body: `<section class="hero"><div class="container"><span class="eyebrow">404</span><h1>Такой страницы нет</h1><p class="lead"><a href="/">Вернуться к направлениям →</a></p></div></section>`,
  })
);
console.log(`Готово: ${categories.length + 1} страниц в ${OUT}/`);

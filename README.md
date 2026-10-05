# toldiev-prompts

Сайт с командами для ChatGPT: главная + отдельная страница на каждое направление (книги, учёба, изображения, фото, тексты, бизнес и т. д.), готовые промпты и подборки ссылок.

Статичный сайт без фреймворков — HTML генерируется скриптом `build.mjs`.

## Где что менять

- `data/categories.mjs` — страницы с командами и порядок страниц в меню
- `data/extra.mjs` — «Учёба по фото», «Ретро-фото» (готовые промпты), «Сайты с промптами» (ссылки)
- `site.config.mjs` — название, автор, Instagram, Telegram
- `assets/style.css`, `assets/app.js` — стили и поведение
- `assets/fonts/` — шрифты Manrope и JetBrains Mono (SIL OFL), лежат на сайте вместо Google Fonts

Новая категория в данных = новая страница `/<slug>/`.

## Запуск

```bash
node build.mjs                          # сборка в dist/
python3 -m http.server 4173 -d dist     # локальный просмотр: http://localhost:4173
```

## Деплой

Vercel: сборка `node build.mjs`, папка `dist` (см. `vercel.json`).

## CI/CD

`.github/workflows/deploy.yml`: каждый пуш в `main` собирает сайт, проверяет страницы, запускает деплой этого коммита на Timeweb (API) и ждёт, пока новая версия появится на сайте. Нужен секрет репозитория `TIMEWEB_TOKEN`. Vercel обновляется сам через интеграцию с GitHub.

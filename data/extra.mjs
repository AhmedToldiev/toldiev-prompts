// Дополнительные страницы: учёба, готовые промпты, подборки ссылок.

export const study = {
  slug: "study",
  short: "Сфоткал страницу учебника — получил шпаргалку, тест, схему или план ответа у доски.",
  icon: "cap",
  title: "Учёба по фото",
  h1: "Команды ChatGPT, чтобы подготовиться по фото учебника",
  eyebrow: "Школа и вуз",
  lead: "Фотографируешь страницу учебника или конспекта, отправляешь в ChatGPT с командой — и получаешь шпаргалку, хронологию, тест, схему или план ответа у доски.",
  howto: [
    "Сфотографируй страницу ровно, без бликов и обрезанных строк — чтобы текст читался целиком.",
    "Открой новый чат в ChatGPT, прикрепи фото и добавь команду. Следующие команды отправляй в тот же чат.",
    "Уточняй парой слов: «/quiz 10 вопросов, только по тексту на фото». Даты и имена сверяй с учебником — ChatGPT может ошибиться при распознавании.",
  ],
  sections: [
    {
      title: "Самое нужное",
      cmds: [
        ["/cheatsheet", "шпаргалка: главные факты, даты и вывод"],
        ["/timeline", "события по датам: дата, событие, почему важно"],
        ["/quiz", "тест с вариантами ответов и разбором"],
        ["/mindmap", "тема в центре, вокруг причины, события и итоги"],
        ["/comic", "параграф комиксом из нескольких кадров"],
      ],
    },
    {
      title: "Понять тему",
      cmds: [
        ["/quicksummary", "суть страницы в 5–7 пунктах"],
        ["/studynotes", "конспект: тезис, понятия, аргументы, выводы"],
        ["/coreideas", "ключевые идеи темы"],
        ["/simple", "простыми словами, как другу, который пропустил урок"],
        ["/explain", "подробный разбор логики темы"],
        ["/example", "наглядный пример к каждому понятию"],
        ["/analogy", "аналогия из жизни для сложной темы"],
        ["/glossary", "термины с короткими определениями"],
        ["/causeeffect", "таблица: причина, событие, последствие"],
        ["/questionsanswered", "главные вопросы по теме с ответами"],
      ],
    },
    {
      title: "Наглядно",
      cmds: [
        ["/visualsummary", "наглядная страница: блоки, стрелки, примеры"],
        ["/conceptmap", "как связаны понятия между собой"],
        ["/flowchart", "процесс или причины и следствия на схеме"],
        ["/infographic", "материал в виде инфографики"],
        ["/sketchnote", "конспект с иконками, рисунками и цветом"],
        ["/compare", "сравнение двух понятий, событий или людей"],
        ["/visualanalogies", "сложное через наглядные сравнения"],
      ],
    },
    {
      title: "Запомнить",
      cmds: [
        ["/flashcards", "карточки: термин и короткий ответ"],
        ["/visualflashcards", "карточки с примером и образом для памяти"],
        ["/mnemonics", "запоминалки для дат, имён и терминов"],
        ["/fillintheblanks", "фразы с пропусками, чтобы вспомнить текст"],
        ["/trueorfalse", "утверждения «верно или нет»"],
        ["/reviewquestions", "короткие вопросы для быстрого повторения"],
        ["/activerecall", "задания, где надо вспомнить, а не перечитать"],
        ["/spacedrepetition", "график повторений до контрольной"],
      ],
    },
    {
      title: "Ответ у доски и экзамен",
      cmds: [
        ["/oralanswer", "план устного ответа на 1–2 минуты"],
        ["/examiner", "устный опрос: по одному вопросу, с проверкой ответа"],
        ["/mockexam", "пробный экзамен с разбором"],
        ["/checkmyretelling", "найдёт ошибки в твоём пересказе, пришли его следом"],
        ["/review", "разбор твоего текста или плана с советами"],
        ["/solvestepbystep", "ведёт по решению задачи, не выдавая ответ сразу"],
        ["/steps", "пошаговая инструкция к заданию"],
        ["/feynmanmethod", "объясни тему сам, а ChatGPT найдёт пробелы"],
        ["/mythsvsfacts", "частые ошибки и мифы против фактов"],
        ["/deepquestions", "вопросы, на которые не ответить пересказом"],
        ["/fullstudy", "всё сразу: конспект, схема, карточки, тест, план"],
      ],
    },
    {
      title: "Домашка",
      cmds: [
        ["/homeworkcheck", "проверить решение и показать ошибки"],
        ["/similartasks", "похожие задачи для тренировки"],
        ["/formulas", "формулы со страницы с объяснением каждой"],
        ["/essayplan", "план сочинения или эссе по теме"],
        ["/keydates", "все даты и имена списком"],
      ],
    },
  ],
};

export const retro = {
  slug: "retro",
  kind: "prompts",
  short: "Готовые промпты: твоё фото как настоящий снимок из 80-х, 90-х или нулевых.",
  icon: "film",
  title: "Ретро-фото",
  h1: "Твоё фото как настоящий снимок из прошлого",
  eyebrow: "Фото через нейросеть",
  lead: "Загружаешь своё фото в ChatGPT, вставляешь промпт — и через минуту получаешь кадр, будто его нашли в семейном альбоме. Лицо остаётся твоим.",
  howto: [
    "Открой ChatGPT и загрузи обычное фото: лицо хорошо видно, свет нормальный. Подойдёт портрет или фото в полный рост.",
    "Скопируй промпт нужной эпохи и отправь его вместе с фото.",
    "Через 10–30 секунд получишь результат. Если что-то не так — поправь следующим сообщением (подсказки под каждым промптом).",
  ],
  items: [
    {
      title: "Плёночное фото 1980-х",
      desc: "Тёплые выцветшие цвета, зерно, причёска и одежда той эпохи — как снимок из семейного архива.",
      text: "Use the uploaded photo as the identity reference. Recreate this person in an authentic photograph taken in the 1980s. Keep the face fully recognizable: the same facial features, proportions, skin tone, age and natural expression. Give them hair, makeup, clothing and accessories typical of the 1980s that suit their appearance, in a believable everyday setting of that time. The photo must look like it was really shot on a cheap 35mm film camera: warm faded film colors, visible grain, slight softness, imperfect exposure, light halation, tiny dust and scratches, realistic skin texture. Natural pose and composition. No modern objects, clothes, buildings or gadgets, and no look of a modern photo with a vintage filter. The result should feel like a real old family photo found in an album — photorealistic and nostalgic.",
      tips: [
        "Лицо изменилось — допиши: «keep the face exactly as in the original photo».",
        "Слишком чисто и современно — попроси: «add more film grain and fading, remove anything that looks digital».",
        "Нужна конкретная обстановка — замени «everyday setting of that time» на свою, например «a Soviet apartment with a carpet on the wall» или «a seaside resort».",
      ],
    },
    {
      title: "Мыльница 1990-х",
      desc: "Вспышка в лоб, насыщенные цвета, дата в углу кадра — как фото с праздника или из поездки.",
      text: "Use the uploaded photo as the identity reference. Recreate this person in an authentic amateur photo from the mid-1990s. Keep the face fully recognizable: the same features, proportions, skin tone, age and expression. Dress and style them in typical 1990s fashion that suits their appearance, in a believable everyday 1990s setting. The photo must look like it was taken with a point-and-shoot film camera with a direct on-camera flash: harsh flash light, slightly red eyes, dark background falloff, saturated colors, visible grain, a small orange date stamp in the bottom right corner, slightly off-center framing. No modern objects, clothes or gadgets and no vintage filter look — it should feel like a real printed photo from a 1990s family album.",
      tips: [
        "Без даты в углу — удали из промпта фразу про «date stamp».",
        "Хочешь дачу, школу или вокзал — допиши место в конце промпта: «setting: a summer dacha».",
      ],
    },
    {
      title: "Цифровая камера 2000-х",
      desc: "Холодноватые цвета, резкая вспышка и лёгкий цифровой шум — фото с первой «цифровой мыльницы».",
      text: "Use the uploaded photo as the identity reference. Recreate this person in an authentic photo from around 2005, taken with an early compact digital camera. Keep the face fully recognizable: the same features, proportions, skin tone, age and expression. Give them typical mid-2000s hairstyle, clothing and accessories that suit their appearance, in a believable setting of that time. The image must look like a real early digital photo: low dynamic range, slightly blown highlights, cool white balance, harsh built-in flash, mild JPEG compression and digital noise, slightly soft focus, casual framing. No modern smartphones, clothes or interiors and no retro filter look — it should feel like a real photo from an old memory card.",
      tips: [
        "Нужно селфи «с вытянутой руки» — допиши: «arm's-length selfie angle».",
        "Хочешь вечеринку или клуб — допиши: «setting: a 2000s house party».",
      ],
    },
  ],
};

export const libraries = {
  slug: "libraries",
  kind: "links",
  short: "Бесплатные галереи промптов для картинок и видео: за идеей, моделью или стилем.",
  icon: "link",
  title: "Сайты с промптами",
  h1: "Где брать готовые промпты для картинок и видео",
  eyebrow: "Подборка",
  lead: "Вместо того чтобы ловить промпты в рилсах — три бесплатные библиотеки, где они собраны по задачам, моделям и стилям.",
  howto: [
    "Ищи по картинке, а не по словам: это в первую очередь галереи, текст промпта вторичен.",
    "Смотри, для какой модели написан промпт: запрос под одну нейросеть в другой даст другой результат.",
    "Не копируй дословно — меняй объект, сцену и текст под себя. Удачные куски собирай в свой файл.",
  ],
  items: [
    {
      title: "MeiGen",
      url: "https://www.meigen.ai/",
      tag: "за идеей",
      desc: "Галерея промптов, разложенная по задачам: реклама и товары, логотипы, постеры, портреты, персонажи, 3D, обои. Находишь похожий референс и переписываешь промпт под свой продукт.",
      tips: ["Официальный адрес — www.meigen.ai. В поиске много клонов с похожими названиями."],
    },
    {
      title: "YouMind",
      url: "https://youmind.com/prompts",
      tag: "под модель",
      desc: "Огромная база с фильтром по нейросетям: сразу видно, под какую модель написан промпт. Есть изображения, видео и даже генерация веб-страниц.",
      tips: ["Разделы: youmind.com/prompts/image, /video и /webpage."],
    },
    {
      title: "PromptHero",
      url: "https://prompthero.com/",
      tag: "за стилем",
      desc: "Поиск по миллионам промптов для ChatGPT, Midjourney, Flux, Stable Diffusion и видео-моделей. Идёшь сюда за конкретным стилем: fashion, аниме, 3D, кино, портрет.",
      tips: ["Разбирай промпт как конструктор: что отвечает за свет, оптику и композицию — и переноси куски в свои запросы."],
    },
  ],
};

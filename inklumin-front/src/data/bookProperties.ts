export interface GenreDetail {
  description: string;
  char_count: { min: number; max: number };
  subcategories?: {
    [name: string]: GenreDetail;
  };
}

export interface FormDetail {
  description: string;
  char_count: { min: number; max: number };
}

export const genres: {
  [name: string]: GenreDetail;
} = {
  Фэнтези: {
    description:
      "Жанр, в котором действие происходит в вымышленном мире, часто с магией, мифическими существами и необычными законами.",
    char_count: { min: 360000, max: 576000 },
    subcategories: {
      "Романтическое фэнтези": {
        description:
          "Фэнтези, в центре которого любовные отношения между героями, часто с элементами магии и волшебства.",
        char_count: { min: 320000, max: 480000 },
      },
      "Боевое фэнтези": {
        description: "Фэнтези с акцентом на сражениях, военных конфликтах и приключениях героев.",
        char_count: { min: 400000, max: 640000 },
      },
      "Городское фэнтези": {
        description:
          "Фэнтези, действие которого происходит в современном городе, где магия и реальность переплетаются.",
        char_count: { min: 280000, max: 480000 },
      },
      "Темное фэнтези": {
        description:
          "Мрачное фэнтези с элементами ужасов, где герои сталкиваются с моральными дилеммами и злом.",
        char_count: { min: 320000, max: 560000 },
      },
      "Юмористическое фэнтези": {
        description: "Фэнтези с комическими ситуациями, пародиями и сатирой на жанровые клише.",
        char_count: { min: 240000, max: 400000 },
      },
      "Героическое фэнтези": {
        description: "Фэнтези о подвигах великих героев, их борьбе со злом и спасении мира.",
        char_count: { min: 360000, max: 560000 },
      },
      "Эпическое фэнтези": {
        description:
          "Масштабное фэнтези с проработанными мирами, сложными сюжетами и множеством персонажей.",
        char_count: { min: 480000, max: 800000 },
      },
      "Любовное фэнтези": {
        description:
          "Фэнтези, где основной акцент делается на развитии любовной линии между персонажами в магическом мире.",
        char_count: { min: 280000, max: 480000 },
      },
      "Магический реализм": {
        description:
          "Произведение, в котором магические элементы вплетены в реалистическую картину мира.",
        char_count: { min: 200000, max: 400000 },
      },
    },
  },
  Фантастика: {
    description:
      "Жанр, основанный на научных допущениях, технологических прогнозах и исследовании будущего.",
    char_count: { min: 320000, max: 560000 },
    subcategories: {
      "Боевая фантастика": {
        description:
          "Фантастика с акцентом на военных конфликтах, космических сражениях и приключениях.",
        char_count: { min: 360000, max: 560000 },
      },
      "Космическая фантастика": {
        description:
          "Фантастика о путешествиях в космосе, исследовании других планет и контактах с внеземными цивилизациями.",
        char_count: { min: 320000, max: 640000 },
      },
      "Социальная фантастика": {
        description:
          "Фантастика, исследующая социальные проблемы, утопии, антиутопии и модели общества будущего.",
        char_count: { min: 280000, max: 480000 },
      },
      Постапокалипсис: {
        description:
          "Фантастика о мире после глобальной катастрофы, выживании человечества и построении нового общества.",
        char_count: { min: 280000, max: 480000 },
      },
      "Научная фантастика": {
        description:
          "Фантастика, строго придерживающаяся научных законов и исследующая возможные технологические прорывы.",
        char_count: { min: 320000, max: 560000 },
      },
      "Альтернативная история": {
        description:
          "Фантастика, рассматривающая варианты развития истории при изменении ключевых событий прошлого.",
        char_count: { min: 320000, max: 560000 },
      },
      Антиутопия: {
        description:
          "Изображение тоталитарного, дегуманизированного общества, предостережение о негативных тенденциях.",
        char_count: { min: 240000, max: 480000 },
      },
      Киберпанк: {
        description:
          "Фантастика о мире высоких технологий, киборгов, искусственного интеллекта и социальных контрастов.",
        char_count: { min: 280000, max: 480000 },
      },
      Стимпанк: {
        description:
          "Фантастика, вдохновленная эпохой пара и викторианской Англией, с паровыми машинами и механизмами.",
        char_count: { min: 280000, max: 480000 },
      },
      "Юмористическая фантастика": {
        description:
          "Фантастика с комическими ситуациями, пародиями и сатирой на научные и технологические темы.",
        char_count: { min: 240000, max: 400000 },
      },
      "Героическая фантастика": {
        description:
          "Фантастика о подвигах героев в будущем, их борьбе с врагами и защите человечества.",
        char_count: { min: 320000, max: 480000 },
      },
      "Любовная фантастика": {
        description:
          "Фантастика, где основной акцент делается на развитии любовной линии между персонажами в футуристическом или инопланетном сеттинге.",
        char_count: { min: 280000, max: 480000 },
      },
      "Реалистическая фантастика": {
        description:
          "Фантастические допущения вплетены в канву современной реалистической прозы, исследуя их влияние на обыденную жизнь.",
        char_count: { min: 200000, max: 400000 },
      },
    },
  },
  Попаданцы: {
    description:
      "Жанр о героях, перенесшихся в другой мир, эпоху или тело, и их адаптации к новым условиям.",
    char_count: { min: 320000, max: 560000 },
    subcategories: {
      "Попаданцы в магические миры": {
        description: "Герои попадают в миры с магией, мифическими существами и другими законами.",
        char_count: { min: 320000, max: 560000 },
      },
      "Попаданцы во времени": {
        description:
          "Герои перемещаются в прошлое или будущее, пытаясь изменить историю или выжить.",
        char_count: { min: 280000, max: 480000 },
      },
      "Попаданцы в космос": {
        description:
          "Герои оказываются на других планетах или космических кораблях, сталкиваясь с внеземными цивилизациями.",
        char_count: { min: 320000, max: 560000 },
      },
    },
  },
  "Современная проза": {
    description:
      "Произведения, отражающие реалии и проблемы современного общества, характеры и судьбы людей.",
    char_count: { min: 200000, max: 480000 },
    subcategories: {
      "Психологическая проза": {
        description: "Проза, исследующая внутренний мир героев, их мысли, чувства и мотивации.",
        char_count: { min: 240000, max: 400000 },
      },
      "Социальная проза": {
        description: "Проза, поднимающая острые социальные вопросы, конфликты и проблемы общества.",
        char_count: { min: 200000, max: 400000 },
      },
      "Бытовая проза": {
        description:
          "Проза, описывающая повседневную жизнь, семейные отношения и бытовые ситуации.",
        char_count: { min: 160000, max: 320000 },
      },
    },
  },
  "Историческая проза": {
    description:
      "Произведения, действие которых происходит в прошлом, с историческими личностями и событиями.",
    char_count: { min: 320000, max: 640000 },
  },
  "Любовные романы": {
    description: "Произведения, в центре которых любовные отношения, чувства и переживания героев.",
    char_count: { min: 200000, max: 400000 },
    subcategories: {
      "Короткий любовный роман": {
        description: "Небольшой по объему любовный роман, часто с динамичным сюжетом.",
        char_count: { min: 80000, max: 200000 },
      },
      "Современный любовный роман": {
        description: "Любовный роман, действие которого происходит в наше время.",
        char_count: { min: 200000, max: 360000 },
      },
      "Исторический любовный роман": {
        description:
          "Любовный роман на фоне исторических событий, с элементами приключений и драмы.",
        char_count: { min: 280000, max: 400000 },
      },
      Мелодрама: {
        description: "Произведение с острым сюжетом, яркими эмоциями и часто трагическим финалом.",
        char_count: { min: 160000, max: 320000 },
      },
    },
  },
  Юмор: {
    description:
      "Произведения, вызывающие смех, с комическими ситуациями, персонажами и диалогами.",
    char_count: { min: 120000, max: 320000 },
    subcategories: {
      Пародия: {
        description: "Комическое подражание известному произведению, стилю или жанру.",
        char_count: { min: 40000, max: 160000 },
      },
      Скетч: {
        description: "Короткая комическая сценка или рассказ с неожиданной развязкой.",
        char_count: { min: 4000, max: 40000 },
      },
      Фельетон: {
        description:
          "Сатирическая или юмористическая газетная или журнальная статья на злободневную тему.",
        char_count: { min: 8000, max: 20000 },
      },
    },
  },
  Мистика: {
    description:
      "Произведения о сверхъестественных явлениях, тайнах, загадках и потусторонних силах.",
    char_count: { min: 280000, max: 480000 },
  },
  Приключения: {
    description:
      "Произведения с захватывающим сюжетом, опасными путешествиями, поисками и открытиями.",
    char_count: { min: 240000, max: 480000 },
    subcategories: {
      "Авантюрный роман": {
        description: "Роман о рискованных похождениях, интригах и приключениях главного героя.",
        char_count: { min: 280000, max: 400000 },
      },
    },
  },
  Ужасы: {
    description:
      "Произведения, вызывающие страх, тревогу и напряжение, с элементами сверхъестественного или психологического хоррора.",
    char_count: { min: 200000, max: 400000 },
  },
  Эротика: {
    description:
      "Произведения с откровенными сценами, исследующие сексуальность и эротические переживания.",
    char_count: { min: 120000, max: 320000 },
  },
  Триллер: {
    description:
      "Произведения, держащие читателя в напряжении, с неожиданными поворотами сюжета и ощущением опасности.",
    char_count: { min: 280000, max: 480000 },
  },
  Фанфик: {
    description:
      "Произведение, созданное поклонниками по мотивам существующего произведения искусства.",
    char_count: { min: 20000, max: 600000 },
  },
  ЛитРПГ: {
    description:
      "Жанр, сочетающий элементы литературы и ролевых игр, с прокачкой персонажа, квестами и миром, живущим по игровым законам.",
    char_count: { min: 320000, max: 560000 },
  },
  РеалРПГ: {
    description:
      "Жанр, где элементы ролевой игры (уровни, характеристики, навыки) интегрированы в реальный мир.",
    char_count: { min: 320000, max: 560000 },
  },
  Детектив: {
    description: "Произведения о расследовании преступлений, поиске улик и раскрытии тайн.",
    char_count: { min: 240000, max: 400000 },
    subcategories: {
      "Полицейский детектив": {
        description: "Детектив, в центре которого работа полиции и ее методы расследования.",
        char_count: { min: 280000, max: 400000 },
      },
      "Психологический детектив": {
        description: "Детектив с акцентом на психологии преступника и мотивах его действий.",
        char_count: { min: 240000, max: 360000 },
      },
      "Шпионский детектив": {
        description:
          "Детектив о работе разведчиков, международных интригах и государственных тайнах.",
        char_count: { min: 280000, max: 480000 },
      },
    },
  },
  Боевик: {
    description: "Произведения с динамичным сюжетом, погонями, перестрелками и драками.",
    char_count: { min: 280000, max: 480000 },
  },
  "Подростковая проза": {
    description:
      "Произведения для подростков, затрагивающие актуальные для них темы: дружба, любовь, самоопределение, проблемы взросления.",
    char_count: { min: 160000, max: 320000 },
  },
  Поэзия: {
    description:
      "Литературные произведения, написанные в стихотворной форме, выражающие чувства, мысли и образы.",
    char_count: { min: 4000, max: 80000 },
    subcategories: {
      "Сборник поэзии": {
        description:
          "Книга, содержащая несколько поэтических произведений одного или нескольких авторов.",
        char_count: { min: 20000, max: 80000 },
      },
      Ода: {
        description:
          "Торжественное, патетическое стихотворение, прославляющее какое-либо событие или героя.",
        char_count: { min: 2000, max: 8000 },
      },
      Элегия: {
        description:
          "Лирическое стихотворение, проникнутое грустью, размышлениями о жизни и смерти.",
        char_count: { min: 1000, max: 6000 },
      },
      Сонет: {
        description: "Стихотворение из 14 строк с определенной рифмовкой и строфикой.",
        char_count: { min: 560, max: 840 },
      },
      Баллада: {
        description:
          "Стихотворное повествование с драматическим сюжетом, часто на историческую или легендарную тему.",
        char_count: { min: 4000, max: 20000 },
      },
      Эпиграмма: {
        description:
          "Короткое сатирическое стихотворение, высмеивающее какое-либо лицо или явление.",
        char_count: { min: 200, max: 1200 },
      },
      Гимн: {
        description:
          "Торжественная песнь или стихотворение, прославляющее божество, героя, событие или идею.",
        char_count: { min: 2000, max: 10000 },
      },
      Мадригал: {
        description:
          "Небольшое лирическое стихотворение комплиментарного содержания, обычно посвященное даме.",
        char_count: { min: 400, max: 2000 },
      },
      "Лирическое стихотворение": {
        description: "Стихотворение, выражающее субъективные чувства и переживания поэта.",
        char_count: { min: 400, max: 8000 },
      },
      Экспромт: {
        description: "Стихотворение, созданное спонтанно, без предварительной подготовки.",
        char_count: { min: 200, max: 2000 },
      },
    },
  },
  Драма: {
    description:
      "Литературные произведения, предназначенные для постановки на сцене, с диалогами и действиями персонажей.",
    char_count: { min: 60000, max: 160000 },
    subcategories: {
      Трагедия: {
        description:
          "Драматическое произведение, изображающее непримиримый конфликт, заканчивающийся гибелью героя.",
        char_count: { min: 80000, max: 120000 },
      },
      Комедия: {
        description:
          "Драматическое произведение с юмористическим или сатирическим содержанием, высмеивающее пороки.",
        char_count: { min: 60000, max: 100000 },
      },
      Трагикомедия: {
        description: "Драматическое произведение, сочетающее элементы трагедии и комедии.",
        char_count: { min: 70000, max: 110000 },
      },
      Мелодрама: {
        description:
          "Драматическое произведение с острым сюжетом, преувеличенными эмоциями и счастливым или трагическим финалом.",
        char_count: { min: 60000, max: 100000 },
      },
      Фарс: {
        description: "Легкая комедия с грубоватыми приемами, неожиданными и нелепыми ситуациями.",
        char_count: { min: 40000, max: 80000 },
      },
      Водевиль: {
        description: "Легкая комедийная пьеса с песенками-куплетами и танцами.",
        char_count: { min: 50000, max: 90000 },
      },
      Интермедия: {
        description: "Короткая комическая сценка, разыгрываемая между действиями большой пьесы.",
        char_count: { min: 8000, max: 20000 },
      },
      Буффонада: {
        description:
          "Комедийное представление, построенное на преувеличенно комических, шутовских приемах.",
        char_count: { min: 30000, max: 70000 },
      },
    },
  },
  Разное: {
    description:
      "Категория для произведений, не подходящих под другие основные жанры или имеющих смешанную природу.",
    char_count: { min: 20000, max: 200000 },
    subcategories: {
      Сказка: {
        description:
          "Повествовательное произведение о вымышленных лицах и событиях, преимущественно с участием волшебных, фантастических сил.",
        char_count: { min: 8000, max: 120000 },
      },
      Басня: {
        description:
          "Короткое нравоучительное произведение в стихах или прозе с аллегорическим смыслом.",
        char_count: { min: 2000, max: 8000 },
      },
      Миф: {
        description: "Древнее сказание о богах, героях, происхождении мира и человека.",
        char_count: { min: 4000, max: 40000 },
      },
      Былина: {
        description:
          "Русская народная эпическая песня-сказание о богатырях и исторических событиях.",
        char_count: { min: 8000, max: 40000 },
      },
      Легенда: {
        description:
          "Поэтическое сказание о героическом или историческом событии, часто с элементами вымысла.",
        char_count: { min: 4000, max: 60000 },
      },
      Притча: {
        description: "Короткий иносказательный рассказ с нравоучительным смыслом.",
        char_count: { min: 2000, max: 20000 },
      },
      Очерк: {
        description:
          "Литературное произведение, основанное на реальных событиях и фактах, часто с элементами анализа или портрета.",
        char_count: { min: 20000, max: 120000 },
      },
      Памфлет: {
        description:
          "Злободневное публицистическое произведение обличительного, часто сатирического характера.",
        char_count: { min: 8000, max: 40000 },
      },
      Эссе: {
        description:
          "Прозаическое сочинение небольшого объема и свободной композиции, выражающее индивидуальные впечатления и соображения по конкретному поводу или вопросу.",
        char_count: { min: 8000, max: 40000 },
      },
      Мемуары: {
        description: "Воспоминания о прошлых событиях, написанные их участником или современником.",
        char_count: { min: 120000, max: 400000 },
      },
      "Документальная проза": {
        description: "Проза, основанная на реальных документах, фактах и свидетельствах очевидцев.",
        char_count: { min: 80000, max: 400000 },
      },
      Публицистика: {
        description: "Произведения, посвященные актуальным общественно-политическим вопросам.",
        char_count: { min: 20000, max: 200000 },
      },
      Репортаж: {
        description:
          "Оперативное сообщение о событии, очевидцем или участником которого был автор.",
        char_count: { min: 8000, max: 40000 },
      },
      "Журнальная статья": {
        description:
          "Публикация в журнале на определенную тему, часто аналитического или информационного характера.",
        char_count: { min: 8000, max: 60000 },
      },
      "Бизнес-литература": {
        description:
          "Книги по управлению, маркетингу, финансам, развитию бизнеса и личной эффективности в профессиональной сфере.",
        char_count: { min: 80000, max: 240000 },
      },
      "Развитие личности": {
        description:
          "Книги по самосовершенствованию, психологии, мотивации, улучшению навыков и качества жизни.",
        char_count: { min: 60000, max: 200000 },
      },
      "Детская литература": {
        description:
          "Произведения, предназначенные для детей разных возрастов, от сказок до подростковых повестей.",
        char_count: { min: 4000, max: 200000 },
      },
    },
  },
  "Научная литература": {
    description:
      "Произведения, основанные на научных исследованиях, теориях и фактах, предназначенные для специалистов или широкого круга читателей.",
    char_count: { min: 120000, max: 600000 },
    subcategories: {
      Биография: {
        description: "Описание жизни и деятельности какого-либо человека.",
        char_count: { min: 120000, max: 400000 },
      },
      Автобиография: {
        description: "Описание собственной жизни автором.",
        char_count: { min: 100000, max: 360000 },
      },
      "Очерк НЛ": {
        description: "Научный или научно-популярный очерк, основанный на фактах и исследованиях.",
        char_count: { min: 20000, max: 120000 },
      },
      "Мемуары НЛ": {
        description:
          "Научные мемуары, воспоминания ученых или исследователей о своей работе и открытиях.",
        char_count: { min: 120000, max: 400000 },
      },
      "Эссе НЛ": {
        description:
          "Научное эссе, представляющее авторский взгляд на научную проблему или концепцию.",
        char_count: { min: 8000, max: 40000 },
      },
      "Публицистика НЛ": {
        description:
          "Научно-популярная публицистика, освещающая научные достижения и проблемы для широкой аудитории.",
        char_count: { min: 20000, max: 200000 },
      },
    },
  },
};

export const forms: {
  [name: string]: FormDetail;
} = {
  Роман: {
    description: "Крупное эпическое произведение с разветвлённым сюжетом и множеством персонажей.",
    char_count: { min: 320000, max: 1280000 },
  },
  "Роман-эпопея": {
    description:
      "Монументальное произведение, охватывающее значительный исторический период или судьбы нескольких поколений.",
    char_count: { min: 640000, max: 1600000 },
  },
  Повесть: {
    description:
      "Эпическое произведение средней длины, обычно с одним основным сюжетом и меньшим количеством персонажей, чем в романе.",
    char_count: { min: 80000, max: 320000 },
  },
  Новелла: {
    description:
      "Короткое повествовательное произведение с острым, напряженным сюжетом и неожиданной развязкой.",
    char_count: { min: 20000, max: 80000 },
  },
  Рассказ: {
    description:
      "Малое эпическое произведение, описывающее одно событие или эпизод из жизни героя.",
    char_count: { min: 4000, max: 80000 },
  },
  Эпопея: {
    description:
      "Крупное героическое повествование в стихах или прозе о выдающихся исторических или мифических событиях.",
    char_count: { min: 400000, max: 1200000 },
  },
  Эпос: {
    description:
      "Совокупность народных героических сказаний, песен, поэм (например, древнегреческий эпос). Также может означать крупное повествовательное произведение.",
    char_count: { min: 200000, max: 1000000 },
  },
  Пьеса: {
    description: "Драматическое произведение, предназначенное для постановки на сцене.",
    char_count: { min: 60000, max: 160000 },
  },
  Опус: {
    description:
      "Отдельное музыкальное или литературное произведение, часто используется для нумерации сочинений композитора или писателя.",
    char_count: { min: 20000, max: 400000 },
  },
  Стансы: {
    description:
      "Лирическое стихотворение, состоящее из строф (стансов) с законченной мыслью в каждой.",
    char_count: { min: 1000, max: 8000 },
  },
  Послание: {
    description:
      "Литературное произведение в форме письма или обращения к кому-либо, часто в стихах.",
    char_count: { min: 2000, max: 20000 },
  },
  Эпитафия: {
    description:
      "Надгробная надпись, часто в стихотворной форме, или произведение, написанное по случаю чьей-либо смерти.",
    char_count: { min: 200, max: 2000 },
  },
  Дума: {
    description:
      "Лиро-эпическое произведение украинского фольклора, а также жанр русской поэзии XIX века с медитативно-элегическим содержанием.",
    char_count: { min: 4000, max: 20000 },
  },
  Экспромт: {
    description: "Короткое произведение, созданное спонтанно, без подготовки.",
    char_count: { min: 400, max: 4000 },
  },
};

// Helper type for genre structure if needed later
export type GenreData = typeof genres;
export type FormData = typeof forms;

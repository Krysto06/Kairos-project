/* Parcours : Anglais Roadmap */
const TRACK_EN = {
  "id": "en",
  "title": "Anglais Roadmap",
  "sub": "De A1 à C2, puis DET & TOEFL",
  "desc": "De A1 à C2 en six compétences : vocabulaire, grammaire, écoute, lecture, écriture, oral. Les durées sont des estimations à ajuster à ton rythme. Tout est gratuit, sauf les examens officiels.",
  "steps": [
    {
      "id": "en-a1",
      "lvl": "A1",
      "t": "Découverte",
      "d": "Se présenter, chiffres, vie quotidienne. 20 minutes par jour suffisent.",
      "links": [
        [
          "Duolingo",
          "https://www.duolingo.com"
        ],
        [
          "BBC Learning English",
          "https://www.bbc.co.uk/learningenglish"
        ],
        [
          "British Council – Test your English",
          "https://learnenglish.britishcouncil.org/test-your-english"
        ]
      ],
      "tasks": [
        [
          "Vocabulaire",
          "500 premiers mots par thèmes (famille, nourriture, travail). 10 mots par jour, chacun dans une phrase."
        ],
        [
          "Grammaire",
          "to be, présent simple, articles, pluriels, there is / there are."
        ],
        [
          "Écoute",
          "Dialogues lents de LearnEnglish (A1-A2) : 10 minutes par jour."
        ],
        [
          "Contrôle",
          "Test de niveau gratuit du British Council : viser A2 avant de continuer."
        ]
      ]
    },
    {
      "id": "en-a2",
      "lvl": "A2",
      "t": "Survie",
      "d": "Présent, passé simple, petites conversations. Commencer un carnet de vocabulaire.",
      "links": [
        [
          "British Council – LearnEnglish",
          "https://learnenglish.britishcouncil.org"
        ],
        [
          "British Council – Grammaire (A1 à C1)",
          "https://learnenglish.britishcouncil.org/category/resource-skill/grammar"
        ]
      ],
      "tasks": [
        [
          "Vocabulaire",
          "Carnet de 1 000 mots avec traduction et exemple. Réviser la veille, le jour même et une semaine plus tard."
        ],
        [
          "Grammaire",
          "Passé simple, futur (will / going to), comparatifs, modaux de base."
        ],
        [
          "Lecture",
          "Textes courts de niveau A2 sur LearnEnglish, un par jour."
        ],
        [
          "Écriture",
          "Message de 5 lignes par jour (journal, courriel)."
        ],
        [
          "Contrôle",
          "Raconter sa journée à voix haute en 1 minute sans s’arrêter."
        ]
      ]
    },
    {
      "id": "en-b1",
      "lvl": "B1",
      "t": "Autonomie",
      "d": "Present perfect, conditionnel. Un podcast lent par jour, écrire 5 lignes par jour.",
      "links": [
        [
          "6 Minute English",
          "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english"
        ],
        [
          "Write & Improve (Cambridge)",
          "https://writeandimprove.com"
        ],
        [
          "VOA Learning English – actualité en anglais simplifié",
          "https://learningenglish.voanews.com"
        ]
      ],
      "tasks": [
        [
          "Vocabulaire",
          "Verbes à particule et collocations courantes, un thème par semaine."
        ],
        [
          "Grammaire",
          "Present perfect, conditionnels 1 et 2, voix passive, discours indirect."
        ],
        [
          "Écoute",
          "Un podcast lent par jour, puis réécoute avec la transcription."
        ],
        [
          "Lecture",
          "Un article court par jour, résumé en 2 phrases."
        ],
        [
          "Écriture",
          "150 mots par semaine, corrigés avec Write & Improve."
        ],
        [
          "Oral",
          "Se filmer 1 minute par jour sur un sujet quotidien."
        ]
      ]
    },
    {
      "id": "en-t1",
      "exam": true,
      "t": "Test de niveau gratuit",
      "d": "Mesurer ton niveau réel (score CECRL) avant d’attaquer le B2.",
      "links": [
        [
          "EF SET – gratuit",
          "https://www.efset.org"
        ],
        [
          "EF SET – test gratuit jusqu’à C2",
          "https://efset.org"
        ]
      ],
      "tasks": [
        [
          "Contrôle",
          "EF SET gratuit : 50 minutes (lecture et écoute) ou 90 minutes (quatre compétences). Noter le score et la compétence la plus faible."
        ]
      ]
    },
    {
      "id": "en-b2",
      "lvl": "B2",
      "t": "Indépendance",
      "d": "Lire un article de The Economist par semaine, écrire des essais argumentés.",
      "links": [
        [
          "The Economist",
          "https://www.economist.com"
        ],
        [
          "TED Talks",
          "https://www.ted.com/talks"
        ],
        [
          "Academic Word List – PDF gratuit (570 familles)",
          "https://academic-englishuk.com/awl-teaching-words/"
        ],
        [
          "Purdue OWL – rédaction académique",
          "https://owl.purdue.edu/owl/general_writing/index.html"
        ]
      ],
      "tasks": [
        [
          "Vocabulaire",
          "Academic Word List : 10 sous-listes, une par semaine. Écrire une phrase par mot."
        ],
        [
          "Grammaire",
          "Conditionnels mixtes, relatives, connecteurs logiques, inversions simples."
        ],
        [
          "Écoute",
          "Un exposé TED par jour : d’abord avec transcription, puis sans."
        ],
        [
          "Lecture",
          "Un article long par semaine, résumé en 3 phrases."
        ],
        [
          "Écriture",
          "Essai argumentatif de 250 mots par semaine (thèse, arguments, conclusion)."
        ],
        [
          "Oral",
          "Exposé de 2 minutes enregistré chaque jour, réécouté pour repérer les hésitations."
        ]
      ]
    },
    {
      "id": "en-c1",
      "lvl": "C1",
      "t": "Avancé",
      "d": "Présenter un sujet économique à l’oral, rédiger un rapport structuré.",
      "links": [
        [
          "C1 Advanced",
          "https://www.cambridgeenglish.org/exams-and-tests/advanced/"
        ],
        [
          "Coursera – anglais académique",
          "https://www.coursera.org/search?query=academic%20english"
        ],
        [
          "English Grammar Profile (Cambridge)",
          "https://www.englishprofile.org/english-grammar-profile"
        ],
        [
          "Merriam-Webster – mot du jour",
          "https://www.merriam-webster.com/word-of-the-day"
        ],
        [
          "Project Gutenberg – livres libres de droits",
          "https://www.gutenberg.org"
        ]
      ],
      "tasks": [
        [
          "Vocabulaire",
          "Mot du jour, collocations avancées, registres soutenu et familier. Objectif : 15 mots par semaine, tous réutilisés à l’écrit."
        ],
        [
          "Grammaire",
          "English Grammar Profile, filtre C1 : inversions, structures emphatiques, nuances des modaux."
        ],
        [
          "Écoute",
          "Conférences et débats longs, sans sous-titres, avec prise de notes."
        ],
        [
          "Lecture",
          "Presse de qualité et essais. Un classique de Project Gutenberg par mois."
        ],
        [
          "Écriture",
          "Essai ou compte rendu de 300 mots, corrigé avec Write & Improve (viser C1)."
        ],
        [
          "Oral",
          "Exposé de 5 minutes enregistré chaque semaine."
        ]
      ]
    },
    {
      "id": "en-c2",
      "lvl": "C2",
      "t": "Maîtrise",
      "d": "Nuances, idiomes, lecture de papiers académiques en économie.",
      "links": [
        [
          "C2 Proficiency",
          "https://www.cambridgeenglish.org/exams-and-tests/proficiency/"
        ],
        [
          "Cambridge C2 Proficiency – matériel gratuit",
          "https://www.cambridgeenglish.org/exams-and-tests/proficiency/preparation/"
        ],
        [
          "Write & Improve (Cambridge)",
          "https://writeandimprove.com"
        ]
      ],
      "tasks": [
        [
          "Vocabulaire",
          "Nuances de sens, expressions idiomatiques, mots rares mais utiles. Dictionnaire monolingue."
        ],
        [
          "Grammaire",
          "English Grammar Profile, filtre C2 : nuances de modalité, ellipses, structures emphatiques."
        ],
        [
          "Écoute",
          "Accents variés, débats rapides, humour, sans transcription."
        ],
        [
          "Lecture",
          "Textes littéraires et académiques denses, résumés écrits."
        ],
        [
          "Écriture",
          "Essais, rapports et lettres de 300 à 350 mots dans le style de l’examen C2."
        ],
        [
          "Oral",
          "Discussion libre avec un partenaire d’échange, enregistrée puis analysée."
        ],
        [
          "Contrôle",
          "Épreuves d’exemple C2 Proficiency de Cambridge, en conditions réelles."
        ]
      ]
    },
    {
      "id": "en-t2",
      "exam": true,
      "t": "Test blanc TOEFL & DET",
      "d": "Un test blanc de chaque avant l’inscription officielle.",
      "links": [
        [
          "DET – pratique gratuite",
          "https://englishtest.duolingo.com/prepare"
        ],
        [
          "TOEFL – préparation ETS",
          "https://www.ets.org/toefl/test-takers/ibt/prepare.html"
        ],
        [
          "EF SET – test gratuit jusqu’à C2",
          "https://efset.org"
        ]
      ],
      "tasks": [
        [
          "Contrôle",
          "EF SET en quatre compétences (90 minutes). Comparer avec le premier test et viser C2 (score de 71 à 100)."
        ]
      ]
    },
    {
      "id": "en-det",
      "summit": true,
      "t": "Duolingo English Test",
      "d": "En ligne, environ 1 h, score sur 160. Viser 125–135+ pour un master.",
      "links": [
        [
          "Site officiel DET",
          "https://englishtest.duolingo.com"
        ]
      ]
    },
    {
      "id": "en-toefl",
      "summit": true,
      "t": "TOEFL iBT",
      "d": "Score sur 120. Beaucoup de masters demandent 90 à 100+.",
      "links": [
        [
          "ETS – TOEFL iBT",
          "https://www.ets.org/toefl.html"
        ]
      ],
      "tasks": [
        [
          "Plan",
          "La préparation détaillée (lecture, écoute, oral, écriture) est dans le parcours TOEFL."
        ]
      ]
    }
  ]
};

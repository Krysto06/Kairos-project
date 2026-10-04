/* Parcours d'études : contenu éditorial fixe. La progression (étapes cochées) vit dans l'état utilisateur. */
export const TRACKS = [
  { id:'en', title:'Anglais → C2', sub:'De A1 à C2, puis DET & TOEFL', desc:'Un niveau à la fois, avec un test gratuit à mi-chemin et les deux examens officiels comme sommet.',
    steps:[
      {id:'en-a1',lvl:'A1',t:'Découverte',d:'Se présenter, chiffres, vie quotidienne. 20 minutes par jour suffisent.',links:[['Duolingo','https://www.duolingo.com'],['BBC Learning English','https://www.bbc.co.uk/learningenglish']]},
      {id:'en-a2',lvl:'A2',t:'Survie',d:'Présent, passé simple, petites conversations. Commencer un carnet de vocabulaire.',links:[['British Council – LearnEnglish','https://learnenglish.britishcouncil.org']]},
      {id:'en-b1',lvl:'B1',t:'Autonomie',d:'Present perfect, conditionnel. Un podcast lent par jour, écrire 5 lignes par jour.',links:[['6 Minute English','https://www.bbc.co.uk/learningenglish/english/features/6-minute-english'],['Write & Improve (Cambridge)','https://writeandimprove.com']]},
      {id:'en-t1',exam:true,t:'Test de niveau gratuit',d:'Mesurer ton niveau réel (score CECRL) avant d’attaquer le B2.',links:[['EF SET – gratuit','https://www.efset.org']]},
      {id:'en-b2',lvl:'B2',t:'Indépendance',d:'Lire un article de The Economist par semaine, écrire des essais argumentés.',links:[['The Economist','https://www.economist.com'],['TED Talks','https://www.ted.com/talks']]},
      {id:'en-c1',lvl:'C1',t:'Avancé',d:'Présenter un sujet économique à l’oral, rédiger un rapport structuré.',links:[['C1 Advanced','https://www.cambridgeenglish.org/exams-and-tests/advanced/'],['Coursera – anglais académique','https://www.coursera.org/search?query=academic%20english']]},
      {id:'en-c2',lvl:'C2',t:'Maîtrise',d:'Nuances, idiomes, lecture de papiers académiques en économie.',links:[['C2 Proficiency','https://www.cambridgeenglish.org/exams-and-tests/proficiency/']]},
      {id:'en-t2',exam:true,t:'Test blanc TOEFL & DET',d:'Un test blanc de chaque avant l’inscription officielle.',links:[['DET – pratique gratuite','https://englishtest.duolingo.com/prepare'],['TOEFL – préparation ETS','https://www.ets.org/toefl/test-takers/ibt/prepare.html']]},
      {id:'en-det',summit:true,t:'Duolingo English Test',d:'En ligne, environ 1 h, score sur 160. Viser 125–135+ pour un master.',links:[['Site officiel DET','https://englishtest.duolingo.com']]},
      {id:'en-toefl',summit:true,t:'TOEFL iBT',d:'Score sur 120. Beaucoup de masters demandent 90 à 100+.',links:[['ETS – TOEFL iBT','https://www.ets.org/toefl.html']]},
    ]},
  { id:'lic', title:'Licence en économie', sub:'L1 → soutenance', desc:'Les fondamentaux, ton ABC pour l’empire, puis la soutenance. Ensuite le parcours continue vers le master.', next:'gre',
    steps:[
      {id:'lic-l1',lvl:'L1',t:'Fondamentaux',d:'Microéconomie, macroéconomie, maths pour économistes, comptabilité.',links:[['Khan Academy – Micro','https://www.khanacademy.org/economics-finance-domain/microeconomics'],['Khan Academy – Macro','https://www.khanacademy.org/economics-finance-domain/macroeconomics']]},
      {id:'lic-l2',lvl:'L2',t:'Outils quantitatifs',d:'Statistiques, probabilités, introduction à l’économétrie.',links:[['MIT OCW – Economics','https://ocw.mit.edu/search/?d=Economics'],['Marginal Revolution University','https://mru.org']]},
      {id:'lic-l3',lvl:'L3',t:'Spécialisation',d:'Économétrie appliquée, économie internationale, finance, politique économique.',links:[['QuantEcon','https://quantecon.org'],['Banque mondiale – données','https://data.worldbank.org']]},
      {id:'lic-abc',lvl:'ABC',t:'Mon ABC pour l’empire',d:'Ton artefact de référence A-B-C. Colle son lien ci-dessous pour l’ouvrir d’ici.',abc:true,links:[]},
      {id:'lic-mem',lvl:'MÉM',t:'Mémoire',d:'Choisir un sujet, trouver des données, écrire la revue de littérature, les résultats, la conclusion.',links:[['Google Scholar','https://scholar.google.com'],['NBER Working Papers','https://www.nber.org/papers']]},
      {id:'lic-prep',exam:true,t:'Répétition de la soutenance',d:'Slides en 12–15 minutes, deux répétitions chronométrées, liste des questions probables du jury.',links:[]},
      {id:'lic-sout',summit:true,t:'Soutenance',d:'Le jour J. Après ça : le master.',links:[]},
    ]},
  { id:'gre', title:'Master & GRE', sub:'Préparer l’après-licence', desc:'Le GRE, le dossier, puis l’admission en master.',
    steps:[
      {id:'gre-list',lvl:'M0',t:'Choisir 5 à 8 masters',d:'Économie, économétrie ou finance quantitative. Noter pour chacun : scores exigés, dates limites, frais.',links:[['Mastersportal','https://www.mastersportal.com']]},
      {id:'gre-diag',exam:true,t:'Diagnostic GRE',d:'Passer un test officiel gratuit pour connaître ton point de départ.',links:[['ETS POWERPREP (gratuit)','https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html']]},
      {id:'gre-q',lvl:'Q',t:'Quantitative Reasoning',d:'Ton point fort d’économiste : viser 165+. Arithmétique, algèbre, stats, data interpretation.',links:[['Khan Academy – maths','https://www.khanacademy.org/math'],['Magoosh GRE','https://magoosh.com/gre/']]},
      {id:'gre-v',lvl:'V',t:'Verbal Reasoning',d:'Vocabulaire (10 mots/jour), text completion, lecture rapide.',links:[['GregMat','https://www.gregmat.com'],['Vocabulary.com','https://www.vocabulary.com']]},
      {id:'gre-w',lvl:'AW',t:'Analytical Writing',d:'Un essai « Analyze an Issue » par semaine, chronométré à 30 minutes.',links:[['ETS – pool de sujets','https://www.ets.org/gre/test-takers/general-test/prepare/content/analytical-writing.html']]},
      {id:'gre-exam',exam:true,t:'GRE officiel',d:'S’inscrire 2 à 3 mois avant les premières dates limites.',links:[['S’inscrire au GRE','https://www.ets.org/gre.html']]},
      {id:'gre-dos',lvl:'DOS',t:'Dossier de candidature',d:'Statement of purpose, CV académique, 2 à 3 lettres de recommandation, relevés de notes.',links:[]},
      {id:'gre-adm',summit:true,t:'Admission en master',d:'Candidatures envoyées, puis la lettre d’admission.',links:[]},
    ]},
];

export const trackById = id => TRACKS.find(t => t.id === id);

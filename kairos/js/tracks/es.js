/* Roadmap : Espagnol Roadmap — de A1 à B2, avec le DELE comme sommet. Durées = estimations. */
const TRACK_ES = {
  id:'es', title:'Espagnol Roadmap', sub:'De A1 à B2, puis le diplôme DELE',
  desc:'Ton français et ton créole t’aident : beaucoup de mots se ressemblent. Environ 30 minutes par jour, avec des ressources gratuites. Les durées sont des estimations.',
  steps:[
    {id:'es-a1',lvl:'A1',t:'Premiers pas (4 à 6 semaines)',d:'Se présenter, les chiffres, la famille, la nourriture. Habituer l’oreille aux sons de l’espagnol.',
      tasks:[['Écoute','Suivre le cours audio Complete Spanish de Language Transfer (gratuit, leçons audio courtes).'],['Vocabulaire','200 mots de base : famille, couleurs, jours, nourriture. Les écrire dans un carnet avec la phrase d’exemple.'],['Grammaire','Verbes ser et estar, présent des verbes en -ar, -er, -ir, articles et genre.'],['Oral','Se présenter à voix haute, 5 phrases, et s’enregistrer.']],
      links:[['Language Transfer – Complete Spanish','https://www.languagetransfer.org/complete-spanish'],['SpanishDict – dictionnaire, conjugaison, leçons','https://www.spanishdict.com/']]},
    {id:'es-a2',lvl:'A2',t:'Vie quotidienne (6 à 8 semaines)',d:'Parler du passé simple, des projets, des achats et du travail. Premiers textes courts.',
      tasks:[['Vocabulaire','Le travail, la ville, les voyages, la santé : 300 mots de plus.'],['Grammaire','Prétérito indefinido, futur proche (ir a + infinitif), verbes réfléchis, gustar.'],['Écoute','Une vidéo par jour sur Dreaming Spanish, niveau débutant (un compte est demandé ; la part gratuite n’est pas précisée sur le site).'],['Écriture','Écrire 5 lignes par jour : ta journée, un message court, une liste de courses.']],
      links:[['Dreaming Spanish','https://www.dreaming.com/spanish'],['Centro Virtual Cervantes – enseñanza','https://cvc.cervantes.es/ensenanza/']]},
    {id:'es-b1',lvl:'B1',t:'Autonomie (8 à 12 semaines)',d:'Raconter, donner son avis, comprendre l’essentiel d’un article ou d’un podcast.',
      tasks:[['Grammaire','Imparfait contre indefinido, parfait, impératif, premiers emplois du subjonctif.'],['Lecture','Un article court par jour dans un média en espagnol ; noter 5 mots nouveaux.'],['Écoute','Écouter un épisode de Radio Ambulante par semaine avec la transcription (gratuit).'],['Oral','Parler 10 minutes seule sur un sujet (ton travail, ta ville) ou avec un partenaire.']],
      links:[['Radio Ambulante – podcast et transcriptions','https://radioambulante.org/'],['Diccionario de la RAE','https://dle.rae.es/']]},
    {id:'es-t1',exam:true,t:'Test blanc DELE',d:'Faire un modèle d’examen DELE A2 ou B1 en conditions réelles, puis corriger avec la grille.',
      tasks:[['Épreuves','Compréhension écrite et orale, expression écrite, expression orale : chronométrer chacune.'],['Correction','Comparer avec les corrigés et les transcriptions fournis, puis lister les erreurs récurrentes.']],
      links:[['Instituto Cervantes – modèles d’examen DELE (gratuits)','https://examenes.cervantes.es/es/dele/preparar-prueba']]},
    {id:'es-b2',lvl:'B2',t:'Indépendance (12 semaines ou plus)',d:'Argumenter, comprendre des textes complexes, écrire des textes structurés.',
      tasks:[['Grammaire','Subjonctif complet, conditionnel, hypothèses, connecteurs logiques.'],['Vocabulaire','Le vocabulaire de l’économie et de la finance : inflación, tipo de interés, deuda, desarrollo.'],['Écriture','Un texte argumenté de 150 à 200 mots par semaine, à faire relire.'],['Lecture','Lire un article d’actualité par jour et le résumer en trois phrases.']],
      links:[['SpanishDict – conjugaison','https://www.spanishdict.com/'],['Centro Virtual Cervantes – enseñanza','https://cvc.cervantes.es/ensenanza/']]},
    {id:'es-dele',summit:true,t:'Diplôme DELE (B1 ou B2)',d:'Examen officiel de l’Instituto Cervantes. L’inscription est payante : vérifier les centres d’examen et les tarifs de ton pays.',
      links:[['Instituto Cervantes – préparer les épreuves DELE','https://examenes.cervantes.es/es/dele/preparar-prueba']]}
  ]
};

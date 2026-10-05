/* ---------- Listes à cocher (importées de tes notes : Mes Projets Habit et To Do’s) ----------
   Chaque élément : [texte, note, date limite AAAA-MM-JJ, fait ?]. Tu peux en ajouter, cocher et retirer dans l’app. */
const LISTS = [
  { id:'wd-day', title:'Garde-robe de tout les jours', sub:'Achats à faire, avec les boutiques prévues.', c:'sty', items:[
    ['10 pantalons toile','SHEIN'],['10 jeans','SHEIN + Fashion Nova'],['20 hauts','SHEIN, Commense, Cider'],['10 chemises','SHEIN'],['10 maillots','SHEIN'],
    ['3 ballerines','Commense ou Cider'],['3 sandales','Commense ou Cider'],['4 talons sandales','SHEIN'],['1 tennis Adidas blanc'],['1 tennis Puma noir'],
    ['10 robes','Fashion Nova, Commense, Zara, Cider'],['5 jupes','Fashion Nova, Commense, Cider'],['1 montre Casio'],['Bijoux','SHEIN'],['Foulard']]},
  { id:'wd-norah', title:'Garde-robe de Norah', sub:'Vêtements et chaussures à prévoir.', c:'sty', items:[
    ['15 jeans','Fashion Nova Kids'],['20 hauts','Fashion Nova Kids, SHEIN'],['2 tennis Adidas'],['1 tennis Puma'],['3 sandales','SHEIN'],
    ['3 souliers fermés','SHEIN, Amazon'],['1 montre enfant'],['5 pantalons toile','SHEIN'],['Robe','Etsy']]},
  { id:'wd-work', title:'Garde-robe pour le travail', sub:'Tenues de bureau.', c:'sty', items:[
    ['20 vestes','Zara, Cider, Commense, H&M, Ralph Lauren. Dont 3 noires, 3 blanches, 3 crèmes, 1 rose, 2 burgundy, 2 dark navy, 2 bleu ciel, 2 grises, 1 rouge, 1 vert pâle'],
    ['20 dessous','Commense, Cider, SHEIN. 5 blancs, 5 noirs, 5 crèmes, 3 dark navy, 1 gris, 1 vert pâle'],
    ['20 pantalons','Commense, Cider'],['Talons','Zara, Vagabond, Cider'],['Ballerines','Zara'],['Montres Timex','Amazon'],
    ['10 chemises blanches','Zara, H&M'],['10 jupes longues','Cider, Commense, Zara'],['5 sandales','Zara'],['1 sac tote bag','Amazon'],
    ['2 paires de lunettes','écran et soleil'],['Foulard'],['Bijoux','faux perles']]},
  { id:'glow', title:'Plan Glow Up', sub:'Corps, peau, cheveux et démarches.', c:'pro', items:[
    ['Sport à faire','j’ai déjà mon plan de sport'],['Finir mon mémoire'],['Boire du jus','j’ai déjà mes jus'],['Ponytail à acheter','16 pouces, kinky curly'],
    ['Coiffure signature','Miracle knots'],['Continuer à mettre de la crème sur la peau','acheter une crème éclaircissante avec huile, à appliquer sur les taches de peau ; acheter un SPF'],
    ['Sculpting corps (Mind body)','','2026-10-10'],['Vacuum lifting brésilien','','2026-10-10'],['Flawless glutathione','','2026-08-10'],
    ['Arranger la voiture','20 000 gourdes pour une batterie 60 A','2026-08-11'],['Avoir son permis','','2026-09-10'],['Faire extrait des archives pour Norah','','2026-09-10'],
    ['Passeport Norah'],['Passeport maman','','2026-08-26'],['Achat de vêtements à faire'],
    ['The Ordinary à acheter pour le visage','','2026-07-10',1],['Prendre la génératrice','','2026-06-26',1],['Apprendre à conduire','','2026-08-23',1],['Aller à l’hôpital avec maman','','',1]]},
  { id:'nails', title:'Kit Nails', sub:'Tout le matériel pour tes ongles.', c:'pro', items:[
    ['Kit polygel'],['Lampe UV','rechargeable'],['Ponceuse','rechargeable'],['Machine pieds','électrique'],['Base coat'],['Top coat'],['Primer'],['Glue'],
    ['Vernis gel','couleurs neutres : blanc, rouge, noir, marron, rose pâle, crème'],['Kit manucure'],['Kit pédicure'],['Ongles','carré, rond'],['Lime'],['Pencil'],
    ['Dissolvant'],['Plumeau'],['Coupe-ongles'],['Boîte pour les ranger']]},
  { id:'bizi', title:'To do list pour Bizi', sub:'Travaux et démarches de la maison.', c:'pro', items:[
    ['Monter le mur sur le toit'],['Nettoyer la cour'],['Mettre l’électricité'],['Faire le carnet à la Capital Bank','','',1]]},
  { id:'rentree', title:'Liste de rentrée de Norah', sub:'Ce qu’il reste à acheter, et ce qui est déjà prêt.', c:'me', items:[
    ['Tennis 2'],['Fournitures scolaires'],['Bol pour manger'],['1 hoodie rose, ou la couleur qu’elle veut'],
    ['Sac à dos','','',1],['Boîte à lunch','','',1],['Sac à dos de réserve','','',1],['Boîte à lunch de réserve','','',1],['Souliers noirs (2)','','',1],['Tennis 1','','',1],
    ['24 culottes','j’en ai pris 12','',1],['12 paires de chaussettes','','',1],['Uniformes','','',1],['2 thermos','','',1],['Montre','','',1],
    ['1 hoodie noir','','',1],['1 hoodie gris','','',1],['Parapluie','','',1],['Postiche pour identifier ses affaires','','',1]]},
  { id:'famgoals', title:'Objectifs de la famille', sub:'Les projets que vous voulez réaliser ensemble.', c:'me', items:[] }
];

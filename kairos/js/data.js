/* ---------- Contenu ---------- */
const TABS=[['moi','Moi','me'],['langues','Langues','edu'],['diplomes','Diplômes','edu'],['skills','Skills','sk'],['finance','Finance','fin'],['style','Style','sty'],['projets','Projets','pro'],['famille','Famille','me'],['perso','Perso','pro'],['calendrier','Calendrier','edu']];
const TRACKS = [TRACK_EN, TRACK_TOEFL, TRACK_ES, TRACK_LIC, TRACK_GRE];
/* Regroupement des parcours : Langues et Diplômes */
const TRACK_META = {en:['langues','Anglais'],toefl:['langues','Anglais'],es:['langues','Espagnol'],lic:['diplomes','Licence'],gre:['diplomes','Master']};
TRACKS.forEach(t=>{ const m=TRACK_META[t.id]; if(m){ t.group=m[0]; t.part=m[1]; } });
const SKILLS = [SKILL_PY, SKILL_SQL, SKILL_GIT, SKILL_EXCEL, SKILL_POWERBI, SKILL_STATS, SKILL_DATAVIZ, SKILL_LINUX, SKILL_DA, SKILL_FA, SKILL_FMVA];
const LOOKS = [
  { id:'cc', name:'Casual chic', vibe:'Décontracté mais pensé.', pal:[['#C19A6B','Blazer camel'],['#F4F1EA','T-shirt blanc'],['#2F3A56','Jean brut'],['#5A3A2E','Mocassins']],
    pieces:['Blazer camel légèrement oversize','T-shirt blanc épais','Jean droit brut','Mocassins en cuir'], tip:'Retrousse les manches du blazer : le look paraît immédiatement plus détendu.', q:'casual chic outfit' },
  { id:'sb', name:'Smart bureau', vibe:'Pour les entretiens, stages et soutenances.', pal:[['#2B3445','Pull marine'],['#BFD3EA','Chemise oxford'],['#8C8F96','Pantalon gris'],['#3B2A22','Derbies']],
    pieces:['Chemise oxford bleu ciel','Pull mérinos col V marine','Pantalon à pinces gris','Derbies marron foncé'], tip:'Une seule couleur vive maximum. Le reste reste neutre.', q:'smart casual office outfit' },
  { id:'mn', name:'Minimal neutre', vibe:'Des tons crème, beige et blanc.', pal:[['#EDE4D3','Col roulé crème'],['#CBB89A','Trench'],['#D9CFC0','Pantalon large'],['#FAFAFA','Sneakers blanches']],
    pieces:['Pull col roulé crème','Trench beige','Pantalon large sable','Sneakers blanches minimalistes'], tip:'Joue sur les matières (maille, coton, cuir) plutôt que sur les couleurs.', q:'minimalist neutral outfit' },
  { id:'lin', name:'Lin & sauge', vibe:'Frais et léger pour les jours chauds.', pal:[['#B7C4A8','Chemise lin sauge'],['#F7F5EF','Pantalon blanc'],['#D6B98C','Espadrilles'],['#C9A96E','Panier']],
    pieces:['Chemise en lin vert sauge','Pantalon blanc fluide','Espadrilles ou sandales','Sac panier ou tote en toile'], tip:'Le lin froissé fait partie du charme, pas besoin de repasser.', q:'linen summer outfit sage' },
  { id:'we', name:'Week-end urbain', vibe:'Confort sans négliger.', pal:[['#A7A9AC','Sweat gris chiné'],['#7A7454','Chino kaki'],['#F2F2F2','Sneakers'],['#1E1E1E','Casquette']],
    pieces:['Sweat gris chiné','Chino kaki','Sneakers blanches','Tote bag en toile'], tip:'Un sweat bien coupé fait tout le travail : taille ajustée aux épaules.', q:'weekend street casual outfit' },
  { id:'ev', name:'Soirée élégante', vibe:'Monochrome et sûr.', pal:[['#1A1A1A','Blazer noir'],['#262626','Haut noir'],['#111111','Pantalon noir'],['#C9A34E','Bijou doré']],
    pieces:['Blazer structuré noir','Haut noir fluide','Pantalon noir droit','Un seul accessoire doré'], tip:'Total look noir + une touche dorée : simple, et ça marche partout.', q:'all black elegant evening outfit' },
];

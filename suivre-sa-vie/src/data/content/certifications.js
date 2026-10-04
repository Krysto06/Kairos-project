/* Formations ajoutées à la demande de l'utilisatrice (4 octobre 2026). Copiées une fois dans l'état par la migration v8.
   LFCS : plan de 17 semaines à 1 h 30 par jour, du lundi au samedi (débutante, ~130 h), examen visé début février 2027.
   Parcours Python : ordre donné par l'utilisatrice. Les programmes officiels n'ont pas pu être consultés (sites bloqués
   depuis l'environnement de travail) : les modules sont à vérifier et à ajuster. */
const m = (id, t, d, start, end) => ({ id, t, d, done: false, ...(start ? { start, end } : {}) });

export const LFCS = {
  id: 'lfcs', short: 'LFCS', title: 'Linux Foundation Certified System Administrator (LFCS)',
  sub: 'Examen pratique en ligne de commande. Plan de débutante : 1 h 30 par jour, 6 jours sur 7.',
  kind: 'certification', provider: 'The Linux Foundation', status: 'cours', target: '2027-02-06',
  url: 'https://trainingportal.linuxfoundation.org/learn/dashboard', cost: '445 $',
  schedule: { days: [1, 2, 3, 4, 5, 6], minutes: 90 },
  links: [['Mon cours (tableau de bord)', 'https://trainingportal.linuxfoundation.org/learn/dashboard'], ['Page de la certification LFCS', 'https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/']],
  mods: [
    m('lfcs-1', 'Fondamentaux et ligne de commande', 'Installer une VM Ubuntu. Distributions, terminal, navigation : ls, cd, pwd, cp, mv, rm, mkdir, rmdir, cat, nano, options et raccourcis.', '2026-10-05', '2026-10-18'),
    m('lfcs-2', 'Fichiers, utilisateurs et permissions', 'Gestion des fichiers et dossiers ; permissions rwx, chmod, chown ; utilisateurs et groupes (useradd, usermod, groupadd, passwd).', '2026-10-19', '2026-11-01'),
    m('lfcs-3', 'Administration système', 'Processus (ps, top, kill), paquets (apt, yum/dnf), services systemd, journaux système (journalctl), surveillance (df, free).', '2026-11-02', '2026-11-15'),
    m('lfcs-4', 'Réseau et SSH', 'Adresse IP et configuration réseau, ping, ss, netstat, résolution DNS, SSH et accès à distance par clé.', '2026-11-16', '2026-11-29'),
    m('lfcs-5', 'Stockage', 'Partitions, systèmes de fichiers, montage et /etc/fstab, LVM, swap. Domaine de l’examen absent de la roadmap NexaCloud.', '2026-11-30', '2026-12-13'),
    m('lfcs-6', 'Scripts shell et tâches planifiées', 'Variables, boucles, conditions, automatisation des tâches quotidiennes ; cron et tâches planifiées.', '2026-12-14', '2026-12-27'),
    m('lfcs-7', 'Sécurité', 'Propriété et droits des fichiers, sudo et accès root, pare-feu (ufw, iptables), durcissement de base. Semaine légère (fêtes).', '2026-12-28', '2027-01-03'),
    m('lfcs-8', 'Révision par domaine d’examen', 'Tâches chronométrées par domaine : commandes essentielles, déploiement et exploitation, utilisateurs et groupes, réseau, stockage.', '2027-01-04', '2027-01-17'),
    m('lfcs-9', 'Examens blancs et points faibles', 'Simulateur d’examen, correction des erreurs. Acheter l’examen seulement si les tâches passent sans notes et dans le temps.', '2027-01-18', '2027-01-31'),
  ],
};

export const PYTHON_PATH = [
  { id: 'py-fcc', short: 'freeCodeCamp', title: 'Python Certification — freeCodeCamp', sub: 'Apprendre et pratiquer, premier certificat gratuit. Étape 1 du parcours Python.',
    kind: 'certification', provider: 'freeCodeCamp', status: 'afaire', target: '', url: 'https://www.freecodecamp.org/learn', cost: 'Gratuit', links: [],
    mods: [m('fcc-1', 'Suivre les leçons du cursus Python', 'Sommaire à reporter depuis le site (non consulté).'), m('fcc-2', 'Réaliser les projets de certification', ''), m('fcc-3', 'Obtenir le certificat', '')] },
  { id: 'py-exercism', short: 'Exercism', title: 'Exercism — piste Python', sub: 'Beaucoup de pratique, avec mentorat gratuit. Étape 2 du parcours Python.',
    kind: 'mooc', provider: 'Exercism', status: 'afaire', target: '', url: 'https://exercism.org/tracks/python', cost: 'Gratuit', links: [],
    mods: [m('exe-1', 'Rejoindre la piste Python et installer l’outil en ligne de commande', ''), m('exe-2', 'Exercices des concepts de base', ''), m('exe-3', 'Exercices pratiques réguliers', ''), m('exe-4', 'Demander une revue de code à un mentor', '')] },
  { id: 'py-realpython', short: 'Real Python', title: 'Real Python — Python professionnel', sub: 'Aller plus loin vers un Python professionnel. Étape 3 du parcours Python.',
    kind: 'mooc', provider: 'Real Python', status: 'afaire', target: '', url: 'https://realpython.com', cost: '', links: [],
    mods: [m('rp-1', 'Code idiomatique et bonnes pratiques', ''), m('rp-2', 'Environnements virtuels et paquets', ''), m('rp-3', 'Tests avec pytest', ''), m('rp-4', 'Programmation orientée objet avancée', ''), m('rp-5', 'Python pour la data (pandas)', '')] },
  { id: 'py-pcap', short: 'PCAP', title: 'PCAP — Certified Associate Python Programmer', sub: 'Certification professionnelle payante. Étape 4. Programme de mémoire, à vérifier sur pythoninstitute.org.',
    kind: 'certification', provider: 'Python Institute', status: 'afaire', target: '', url: 'https://pythoninstitute.org/pcap', cost: 'Payant', links: [],
    mods: [m('pcap-1', 'Modules et paquets', ''), m('pcap-2', 'Exceptions', ''), m('pcap-3', 'Chaînes de caractères', ''), m('pcap-4', 'Programmation orientée objet', ''), m('pcap-5', 'Compréhensions, lambdas, closures et fichiers', ''), m('pcap-6', 'Examens blancs', '')] },
  { id: 'py-pcpp1', short: 'PCPP1', title: 'PCPP1 — Certified Professional Python Programmer Level 1', sub: 'Niveau avancé. Étape 5. Programme de mémoire, à vérifier sur pythoninstitute.org.',
    kind: 'certification', provider: 'Python Institute', status: 'afaire', target: '', url: 'https://pythoninstitute.org/pcpp1', cost: 'Payant', links: [],
    mods: [m('pcpp-1', 'Programmation orientée objet avancée', ''), m('pcpp-2', 'Conventions de code (PEP 8, PEP 257)', ''), m('pcpp-3', 'Interfaces graphiques (tkinter)', ''), m('pcpp-4', 'Programmation réseau (sockets, API REST)', ''), m('pcpp-5', 'Fichiers et environnement (SQLite, CSV, XML, logging)', ''), m('pcpp-6', 'Examens blancs', '')] },
];

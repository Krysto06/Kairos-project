# Suivre sa vie — analyse et architecture

Étape 1 : analyse de l'artefact existant et préparation d'une base modulaire.
Aucune fonctionnalité existante n'a été supprimée.

## 1. Analyse de la version précédente (un seul fichier, ~500 lignes)

### Interface et navigation
- 6 onglets horizontaux en pastilles : Moi, Éducation, Finance, Skills, Style, Projets.
- Style « verre dépoli » avec halos pastel, avatar incliné, titre en dégradé, symboles décoratifs (✦).
  Agréable mais plutôt ludique que professionnel.
- Navigation à plat : impossible d'ajouter 11 modules sans surcharger la barre.

### Fonctionnalités réellement fonctionnelles
| Zone | Ce qui marche |
|---|---|
| Moi | Profil modifiable, 6 tuiles de progression, « prochaines actions » (règle simple) |
| Éducation | 3 parcours (Anglais → C2, Licence, Master & GRE), étapes à cocher, étapes perso, lien ABC |
| Finance | Salaire, postes de budget modifiables, devise, comparaison 50/30/20, taux d'épargne |
| Skills | 3 formations (Python, CFA I, SQL), modules à cocher |
| Style | 6 looks, favoris, garde-robe capsule à cocher |
| Projets | Création, édition, statut, avancement, filtre, suppression avec confirmation |
| Enregistrement | Copie locale + document unique `life/state` dans la base claude.ai, synchronisation entre appareils |

### Fonctionnalités simulées ou statiques
- Les parcours, formations, looks et la capsule sont du **contenu écrit dans le code** : on ne peut pas les modifier depuis l'app (sauf ajout d'étapes perso).
- Les liens Pinterest ouvrent une **recherche externe** ; l'app ne consulte pas Pinterest.
- Les « prochaines actions » sont une **règle fixe**, pas une recommandation intelligente.
- Le sous-titre de profil par défaut (« Économiste · data · finance · Python ») s'affichait comme s'il venait de l'utilisatrice.

### Problèmes de code
- Tout dans un fichier : contenu, état, enregistrement, calculs, rendu et styles mélangés.
- Répétitions : normalisation d'URL écrite 3 fois, même carte de projet en deux variantes, boutons de cocher répétés.
- `vEdu` gère trois parcours avec un sélecteur interne : Anglais et GRE n'étaient pas des pages à part.
- Pas de version de schéma : impossible de faire évoluer les données proprement.
- Le lien d'un projet n'était pas filtré à l'enregistrement (un `javascript:` restait stocké, même s'il était corrigé à l'affichage).
- Si la base claude.ai était vide mais l'appareil avait des données, rien n'était envoyé avant la prochaine modification.

### Limites techniques de l'artefact
- La page ne peut **pas appeler d'API externes** (FRED, Banque mondiale, banques…) : la sécurité de l'artefact bloque les requêtes réseau vers d'autres sites.
- Pas d'accès au navigateur de l'utilisatrice, à LinkedIn, ni à son calendrier sans connecteur autorisé.
- Pas d'IA intégrée tant que la capacité `sample` (Claude depuis la page) n'est pas déclarée.
- Pas d'historique daté : l'état ne garde que la situation actuelle, ce qui empêche toute courbe de progression.
- Un document unique : suffit aujourd'hui, mais deviendra lourd avec des transactions ou des sessions d'étude.

## 2. Ce qui a changé

### Navigation
- Barre latérale fixe (ordinateur) et tiroir « Menu » (téléphone), générées depuis un registre de modules.
- Trois groupes : **Pilotage**, **Apprentissage**, **Vie & projets**.
- Les modules non construits sont rangés dans une section repliable **À venir** : 9 entrées visibles au lieu de 13.
- **Profil & système** en bas : profil, état réel des connexions, inventaire des données, feuille de route.
- Anglais, GRE et Études deviennent des pages à part. Les anciennes adresses (`#moi`, `#education`…) redirigent.

### Design
- Papier ivoire, encre sombre, filets fins, une teinte patrimoniale par domaine (marine, vert bouteille, prune, bordeaux, ocre).
- Titres en Cormorant Garamond, texte en Figtree, chiffres en IBM Plex Mono.
- Suppression des halos, du verre dépoli, du dégradé et des symboles décoratifs. Thème clair et sombre.

### Nouveautés minimes
- **Projet principal** : un projet mis en avant sur le tableau de bord. Le laboratoire de recherche quantitative est créé automatiquement (migration v2).
- **Pastilles d'état** partout : Actif, Demo, Placeholder, À connecter, Nécessite une autorisation, Connecté.
- Pages « placeholder » pour Planning, Analytics, Recherche, Assistant IA : elles décrivent ce qui est prévu et disent clairement que rien n'y fonctionne.

## 3. Structure du code

```
suivre-sa-vie/
  index.html                 coquille : polices, jetons de couleur, config Tailwind, conteneurs
  src/
    main.js                  point d'entrée
    app/      app.js         contexte (ctx), rendu, navigation   · router.js  adresses #module
    config/   modules.js     registre des modules (ajouter un module = une entrée)
              status.js      vocabulaire d'état partagé
              integrations.js  connexions externes et leur état réel
              dataCatalog.js   inventaire des données (enregistrées / fixes / à créer)
    data/     defaults.js    forme de l'état persistant + constantes
              migrations.js  hydrate() + migrations versionnées (schemaVersion)
              content/       contenu fixe : tracks.js, skills.js, style.js
    domain/   progress.js, budget.js, projects.js   logique métier pure (sans DOM)
    services/ store.js       état, commit(), statut d'enregistrement, synchro
              persistence/   local.js (appareil) · claudeDb.js (base claude.ai)
    ui/       classes.js     classes Tailwind partagées
              components.js  pageHeader, section, statusBadge, metric, progressBar, ring, notice, field, segmented…
              trackPath.js   frise de parcours réutilisée par Études, Anglais, GRE
              shell.js       barre latérale et tiroir
    pages/    une page par module + placeholder.js + index.js (module → page)
```

Règles :
- Les pages reçoivent `ctx` (`state`, `ui`, `update`, `commit`, `render`, `go`) et renvoient un élément.
- La logique métier vit dans `domain/` et ne touche jamais au DOM.
- Les composants de `ui/` ne lisent pas l'état global.
- Seul `services/` sait où les données sont enregistrées.

### Ajouter un module
1. Passer son entrée de `status: 'placeholder'` à `'live'` dans `config/modules.js`.
2. Créer `pages/<module>.js` et l'ajouter à `pages/index.js`.
3. Si le module a des données : les ajouter à `data/defaults.js` (petites) ou créer une collection (grandes, voir §4), puis une migration.

## 4. Données

### Déjà enregistrées (document `life/state`)
Profil, étapes cochées, étapes perso, lien ABC, modules de formation cochés, projets, budget du mois, favoris et capsule.

### À créer (collections prévues dans la base claude.ai)
| Collection | Module |
|---|---|
| `goals`, `tasks`, `events` | Planning |
| `sessions` (date, durée, module) | Anglais, GRE, Compétences, Analytics |
| `tests` (GRE, TOEFL, DET, EF SET : date, scores) | Anglais, GRE |
| `transactions`, `budgets` (mois archivés) | Finance |
| `notes`, `resources` | Recherche |
| `wardrobe`, `outfits` | Style |
| `activity` (journal horodaté) | Analytics |
| `ai` (conversations, recommandations) | Assistant IA |

Plan : garder `life/state` pour les réglages et petits états, et ajouter un adaptateur par collection dans `services/persistence/`.
Les données qui grossissent dans le temps (transactions, sessions, notes) iront dans des collections, pas dans le document unique.

## 5. Ce qui demandera des accès

| Besoin | Fonctionnalités | État |
|---|---|---|
| Base de données (collections) | Planning, Analytics, historique Finance, sessions, tests, Recherche, garde-robe réelle | À connecter (la base existe, les collections non) |
| Claude depuis la page (`sample`) | Assistant IA, recommandations, plans d'étude adaptatifs | À connecter |
| Navigateur / recherche web | Recherche de sources, veille, analyse de pages, LinkedIn | Nécessite une autorisation |
| Google Calendar | Planning synchronisé | Nécessite une autorisation |
| API externes | Données FRED / Banque mondiale / INSEE pour le labo, cours de bourse, banque | À connecter, via un connecteur (l'artefact ne peut pas appeler ces API lui-même) |

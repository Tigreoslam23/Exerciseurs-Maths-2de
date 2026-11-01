# Exerciseurs-Maths-2de
Divers exerciceurs pour 2de

## Applications

- [Automatismes de Seconde](https://tigreoslam23.github.io/Exerciseurs-Maths-2de/)
- [Identités remarquables : développements et factorisations](https://tigreoslam23.github.io/Exerciseurs-Maths-2de/identites-remarquables.html)
- [Résolution d’équations : entraînements guidés et mode mixte](https://tigreoslam23.github.io/Exerciseurs-Maths-2de/equations-entrainement.html)

AutoMaths Seconde propose un QCM individuel, des fiches PDF et un diaporama pour la classe. Le diaporama affiche les questions seules, puis tous les corrigés dans le même ordre ; il ne modifie pas la progression individuelle. Les flèches du clavier, la barre d’espace et les boutons permettent de naviguer. Le mode plein écran est adapté à la projection.

L’exerciseur sur les identités remarquables propose trois niveaux, des séries de 3, 5 ou 10 questions, un chronomètre facultatif, une correction ciblée et un clavier numérique intégré. Il s’utilise sur ordinateur, tablette et téléphone.

## Résolution d’équations

Quatre types avec trois niveaux chacun, un mode mixte (niveau 1, 2, 3 ou tous), des séries de 1, 3 ou 5 équations, des étapes à compléter, une correction ciblée et un score final, sans chronomètre. Les niveaux sont représentés par une pousse, une feuille et un arbre.

| Type | Niveau 1 | Niveau 2 | Niveau 3 |
| --- | --- | --- | --- |
| Premier degré | ax + b = c | Inconnue dans les deux membres, parenthèses | Fractions à dénominateurs numériques |
| Après développement | Produits de binômes simples | Identités remarquables | Produits de facteurs affines plus généraux |
| Quotient nul | a/x + b = 0 | Deux fractions, numérateurs entiers | Deux fractions, numérateurs affines |
| Produit nul | Produit déjà factorisé | Facteur commun, y compris dans un carré | Différence de deux carrés |

Les équations du type 2 et les numérateurs du type 3 sont construits pour que les termes en x² s’annulent. Le type 3 commence par la détermination des valeurs interdites ; elles restent visibles pendant la résolution. Toute solution candidate interdite est écartée. Les cas sans solution et les identités sur un domaine restreint sont pris en charge.

Le score compte les étapes réussies du premier essai. Les erreurs peuvent être corrigées ; révéler une étape ne rapporte pas de point. La conclusion affiche l’équation initiale et l’ensemble des solutions avec des fractions réduites. Le clavier intégré et les aides visuelles s’adaptent aux téléphones, tablettes et ordinateurs. Le fichier HTML est autonome et peut être utilisé hors ligne après téléchargement.

## Installer Équations sur un appareil

Ouvrir [Équations](https://tigreoslam23.github.io/Exerciseurs-Maths-2de/equations/), puis utiliser le bouton **Installer l’application**. Il lance l’invite du navigateur lorsqu’elle est disponible et donne les instructions adaptées dans les autres cas : écran d’accueil sur iPhone/iPad, Ajouter au Dock dans Safari sur Mac, ou menu d’installation du navigateur.

Après la première ouverture en ligne et l’indication **Prête hors ligne**, les entraînements fonctionnent sans connexion. Le mode installé s’ouvre dans sa propre fenêtre avec une icône Équations. Les résultats restent enregistrés localement dans le navigateur utilisé ; ils ne sont pas synchronisés entre appareils ou navigateurs.

L’ancien lien `equations-entrainement.html` redirige vers cette version. Les sources de l’exerciceur sont désormais dans `equations/index.html`. Son manifeste, ses icônes et son service worker sont limités au dossier `equations/` ; le service worker et le cache d’AutoMaths restent indépendants. Le HTML de l’exerciceur conserve le moteur mathématique autonome. Lors d’une modification des fichiers d’installation, incrémenter `VERSION` dans `equations/sw.js` ; les mises à jour du HTML sont récupérées automatiquement au retour en ligne.


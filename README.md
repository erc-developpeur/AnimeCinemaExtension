# 🍿 Anime-Sama Cinema & Autoplay

![Icône de l'extension avec une avance rapide (>>)](icon.png)

> Une extension Chrome / Chromium conçue pour optimiser l'expérience de visionnage sur Anime-Sama et autres plateformes de streaming en ajoutant un **Mode Cinéma** immersif, un **Autoplay** agressif et un **Bouton Épisode Suivant** pour une navigation fluide.

---

## 🤖 Réalisé avec l'aide de l'Intelligence Artificielle (IA)

Ce projet a été conçu et développé avec l'assistance de Gemini, une Intelligence Artificielle. L'IA a été utilisée pour l'architecture du script de contenu (`content.js`), notamment la gestion des deux modes (iframe et page principale), la création des règles CSS pour le Mode Cinéma, l'implémentation de la logique d'Autoplay, ainsi que pour la structuration de ce `README`.

---

## ✨ Fonctionnalités Clés

* **Mode Cinéma Immersif :** Transforme l'iframe du lecteur vidéo en un plein écran sans distraction, masquant les éléments de navigation (headers, sidebars) et la barre de défilement.
    * **Activation :** Via le bouton **Cinéma** ou la touche **`F`**.
    * **Contrôles Intelligents :** Les boutons de contrôle apparaissent au survol de la souris et se masquent après 3 secondes d'inactivité en Mode Cinéma.
* **Autoplay Agressif :** Tente de lancer la lecture automatiquement dans les lecteurs vidéo intégrés (iframes) en cliquant sur divers boutons de lecture (ex: `.vjs-big-play-button`).
    * Si l'Autoplay est bloqué par le navigateur, le script tente de mettre la vidéo en **muet** avant de relancer la lecture pour contourner la restriction.
* **Bouton Épisode Suivant :** Un bouton flottant et permanent pour passer immédiatement à l'épisode suivant (recherche des liens `suivant` ou des éléments d'épisode actifs).
    * **Raccourci :** Touche **`N`**.

## 🛠️ Installation (Mode Développeur)

1.  **Téléchargement :** Clonez ce dépôt ou téléchargez le code source complet sous forme de fichier ZIP.
2.  **Ouvrir les Extensions :** Accédez à `chrome://extensions` dans votre navigateur.
3.  **Mode Développeur :** Activez le **Mode développeur** (interrupteur en haut à droite).
4.  **Charger l'Extension :** Cliquez sur **"Charger l'extension non empaquetée"** et sélectionnez le dossier racine du projet.
5.  **Épingler :** Épinglez l'icône de l'extension (la double flèche) pour une visibilité accrue.

## 🚀 Utilisation

L'extension s'active automatiquement sur les sites listés dans le `manifest.json`.

### Sites Ciblés

* `anime-sama.org`
* `voiranime.com` (inclut `v6.voiranime.com`)
* Lecteurs intégrés (ex: Sibnet, Sendvid, Myvi)

### Raccourcis Clavier :

| Touche | Action | Source |
| :--- | :--- | :--- |
| **`F`** | Active/Désactive le Mode Cinéma (Fullscreen) | |
| **`N`** | Passe instantanément à l'épisode suivant | |
| **Souris** | Mouvement de la souris réactive les boutons de contrôle en Mode Cinéma | |

## 👨‍💻 Technologie

* **Manifest V3**
* **JavaScript (`content.js`) :** Gère la logique de l'interface Cinéma sur la page principale et l'Autoplay dans les iframes (`all_frames: true`).
* **CSS Injection :** Utilisation d'une fonction de remplacement pour injecter dynamiquement le CSS qui gère les styles des boutons et le Mode Cinéma (`.as-fullscreen-player`, `body.as-cinema-mode`).

## 📄 Licence

Ce projet est sous licence [Ajouter le type de licence, ex: MIT].

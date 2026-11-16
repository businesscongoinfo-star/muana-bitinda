# Muana Bitinda — portail logistique Apps Script

Ce dépôt contient une application Google Apps Script liée à un classeur Google Sheets : `code.gs` (serveur) et `index.html` (interface). Un hébergement statique seul ne peut pas exécuter `google.script.run`.

## Tests locaux

Exécuter `node tests/regression.cjs`. Ces tests simulent les services Google : ils ne remplacent pas un essai sur un classeur de test et dans un vrai navigateur.

## Préparation d'un déploiement

1. Faire une copie de sauvegarde du classeur et identifier le projet Apps Script lié au bon classeur. Tester d'abord sur une copie : `setupSystem` crée des onglets et des données initiales.
2. Dans l'éditeur Apps Script, copier `code.gs` et créer un fichier HTML nommé **index** (minuscules), contenant `index.html`. Exécuter `setupSystem` depuis l'éditeur et accepter les autorisations.
3. Tester inscription, validation d'un partenaire, stock et opérations sur le classeur de test. Les corrections ne rétroagissent pas aux livraisons ou cellules déjà enregistrées : vérifier les données historiques avant tout ajustement.
4. Ne publier en production qu'après revue de sécurité : le code d'origine crée un compte administrateur avec un mot de passe par défaut public et utilise SHA-256 sans sel pour les mots de passe. Changer le mot de passe administrateur immédiatement ne remplace pas une refonte de l'authentification et des protections contre les tentatives de connexion. Limiter l'accès au classeur et choisir avec soin les paramètres d'accès du déploiement.
5. Utiliser **Déployer → Nouveau déploiement → Application Web**, ou mettre à jour un déploiement existant en sélectionnant une nouvelle version après sauvegarde et validation. Vérifier l'URL et les droits dans un navigateur distinct.

Le dossier Google Drive `muana-bitinda-livraison`, s'il est utilisé, peut contenir une autre application : ne pas remplacer son contenu par ce projet sans confirmation.

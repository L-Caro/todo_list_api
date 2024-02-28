// Config pm2 pour avoir le projet toujours lancé, même quand le projet est fermé
// Surtout pratique en ligne
// La configuration est faite en production, et permet de lancer autant d'instance que de cœur sur le serveur

module.exports = {
  apps: [ {
    name: 'node_twitter',   // Nom de l'application PM2
    script: 'build/index.js',  // Chemin vers le script principal de l'application
    exec_mode: 'cluster',   // Définit le mode d'exécution sur cluster
    instances: 'max',       // Utilisez 'max' pour utiliser autant de cœurs CPU que possible
    autorestart: true,      // Redémarre automatiquement l'application en cas de plantage
    watch: true,            // Surveille les modifications du fichier et redémarre automatiquement l'application si
                            // nécessaire
    env: {
      NODE_ENV: 'production' // Configuration de l'environnement de l'application, ici défini sur 'production'
    }
  } ]
  //
  // deploy : {
  //   production : {  // Configuration spécifique au déploiement en production
  //     user : 'SSH_USERNAME',      // Nom d'utilisateur SSH pour se connecter au serveur
  //     host : 'SSH_HOSTMACHINE',   // Adresse IP ou nom d'hôte du serveur
  //     ref  : 'origin/master',     // Référence Git à utiliser lors du déploiement (généralement la branche master)
  //     repo : 'GIT_REPOSITORY',    // URL du dépôt Git contenant le code source de votre application
  //     path : 'DESTINATION_PATH',  // Chemin sur le serveur où l'application sera déployée
  //     'pre-deploy-local': '',     // Commandes à exécuter localement avant le déploiement (peut être laissé vide)
  //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production', // Commandes à exécuter
  // après le déploiement 'pre-setup': ''             // Commandes à exécuter sur le serveur avant la configuration du
  // déploiement (peut être laissé vide) } }
};

# Guide Journalisation & Audit.

## 📊 Système de logging configuré.

### Fichiers de logs.

Tous les logs sont stockés dans `backend/logs/` :

- **`access.log`** : Logs d'accès HTTP (toutes les requêtes).
- **`combined.log`** : Tous les logs (info, warn, error).
- **`error.log`** : Erreurs uniquement.

### Niveaux de logging.

- **`error`** : Erreurs critiques.
- **`warn`** : Avertissements (tentatives de connexion échouées, etc.).
- **`info`** : Informations importantes (connexions réussies, commandes créées).
- **`debug`** : Informations de débogage (développement).

## 🔐 Actions auditées.

### Authentification.

- ✅ Connexion réussie (`LOGIN` / `success`).
- ❌ Tentative de connexion échouée (`LOGIN_FAILED`).
- 📝 Inscription réussie (`REGISTER`).

### Commandes.

- ✅ Création de commande (`ORDER_CREATED` / `success`).
- ❌ Erreur lors de la création (`ORDER_CREATED` / `failure`).

### Sécurité.

- ⚠️ Tentative d'accès non autorisé (`UNAUTHORIZED`).
- 🚨 Événements de sécurité (`SECURITY`).

## 📈 Surveillance des logs.

### En développement (Docker local).

Les logs s'affichent en temps réel dans la console.

### Vérifier les logs manuellement.

```bash
# Afficher les derniers logs d'accès.
tail -f backend/logs/access.log

# Afficher les erreurs.
tail -f backend/logs/error.log

# Afficher tous les logs avec les audits.
tail -f backend/logs/combined.log
```

### Utiliser le script de monitoring.

```bash
bash scripts/monitor-logs.sh
```

## 🎯 Structure des logs d'audit.

Chaque entrée d'audit contient :

```json
{
  "level": "info",
  "message": "[AUDIT] Action: LOGIN | User: 692ec706806effa81fd433b2 | Status: success",
  "timestamp": "2025-12-02 12:24:20",
  "service": "exam-backend",
  "action": "LOGIN",
  "userId": "692ec706806effa81fd433b2",
  "details": {
    "username": "testuser"
  },
  "status": "success"
}
```

## 🔧 Configuration des logs.

Modifier le fichier `backend/config/logger.js` pour :

- Changer le niveau de log : `process.env.LOG_LEVEL`
- Ajouter de nouveaux transports (ex: Sentry, ELK).
- Modifier le format des logs.

## 📊 Staging vs Production.

### Staging.

- Logs affichés en console.
- Fichiers de logs stockés en local.
- Niveau par défaut : `info`.

### Production.

- Logs **uniquement** en fichiers.
- Pas d'affichage en console.
- Niveau recommandé : `warn` ou `error`.
- À intégrer avec Sentry ou ELK pour une meilleure surveillance.

## 🚀 Exemple de flux d'audit.

```bash
# User se connecte.
2025-12-02 12:24:20 [info]: [AUDIT] Action: LOGIN | User: 692ec706806effa81fd433b2 | Status: success

# User crée une commande.
2025-12-02 12:25:30 [info]: [AUDIT] Action: ORDER_CREATED | User: 692ec706806effa81fd433b2 | Status: success

# Erreur lors d'une action.
2025-12-02 12:26:45 [error]: Erreur lors de la création de la commande.
2025-12-02 12:26:45 [info]: [AUDIT] Action: ORDER_CREATED | User: 692ec706806effa81fd433b2 | Status: failure
```

## ✅ Contrôles d'audit effectués.

- Qui a fait quoi (`userId`, `action`).
- Quand (`timestamp`).
- Avec quel résultat (`status`).
- Avec quels détails (`details`).

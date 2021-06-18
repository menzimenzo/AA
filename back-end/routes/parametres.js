const express = require('express');
const router = express.Router();
const config     = require('../config');

const logger = require('../utils/logger')
const log = logger(module.filename)

// Route permettant de savoir si la clé CLIENT_ID France connect est renseignée ou existante
// Si elle ne l'est pas, alors on n'affiche pas les infos de connexion France Connect
router.get('/fcactif', (req, res) => {
    log.i('IN::parametre France Connect', config.franceConnect.CLIENT_ID)
    if (config.franceConnect.CLIENT_ID && config.franceConnect.CLIENT_ID!="") {
        res.send(true);
    } else {
        res.send(false);
    }
});

module.exports = router;
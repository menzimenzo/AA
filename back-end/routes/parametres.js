const express = require('express');
const router = express.Router();

const logger = require('../utils/logger')
const log = logger(module.filename)

const pgPool = require('../pgpool').getPool();
const config     = require('../config');
var moment = require('moment');

// Route permettant de savoir si la clé CLIENT_ID France connect est renseignée ou existante
// Si elle ne l'est pas, alors on n'affiche pas les infos de connexion France Connect
router.get('/fcactif', (req, res) => {
    log.i('IN::parametre  France Connect')
    log.d(config.franceConnect.CLIENT_ID)
    if (config.franceConnect.CLIENT_ID && config.franceConnect.CLIENT_ID!="") 
    {
        res.send(true);
    }
    else
    {
        res.send(false);
    }
});

router.get('/', function (req, res) {
    res.send('Ceci est la route des parametres');
});

module.exports = router;
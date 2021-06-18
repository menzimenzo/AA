const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
        log.i('::listdepartement - In')
        pgPool.query(`SELECT dep_num, dep_libelle FROM departement`,
            (err, result) => {
                if (err) {
                    log.w('::listdepartement - Erreur', err)
                    return res.statusCode(400).json({ message: 'erreur sur la requete de listedepartement' });
                }
                else {
                    log.i('::listdepartement - Done', { count: result.rowCount })
                    const departements = result.rows;
                    return res.status(200).json({ departements });
                }
            });
    });

module.exports = router;
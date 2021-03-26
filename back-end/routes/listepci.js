const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
        log.i('::listepci - In')
        var v_codepostal;
        v_codepostal = req.query.codepostal;
        // Recherche des communes correspondant au codepostal
        pgPool.query(`select ep.epci_id,ep.epci_code, ep.epci_libelle from epci ep
                    join codepostal_insee cpi on cpi.cpi_codeinsee = ep.com_codeinsee
                    where cpi.cpi_codepostal = $1 limit 1`,
            [$1 = v_codepostal],
            (err, result) => {
                if (err) {
                    log.w('::listepci - Erreur', err);
                    return res.status(400).json({ message: 'Erreur survenue lors de la récupération des collectivités territoriales.' });
                }
                else {
                    log.i('::listepci - Done', { count: result.rowCount})
                    const epci = result.rows;
                    return res.status(200).json({ epci });
                }
            });
    });

module.exports = router;
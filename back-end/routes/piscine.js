const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
    log.i('::list - In')    
    const v_codepostal = req.query.codepostal;
    // Recherche des communes correspondant au codepostal
    return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, \
        pis.pis_adr AS adresse FROM piscine pis  
        INNER JOIN codepostal_insee cpi on cpi.cpi_codeinsee = pis.cpi_codeinsee
        WHERE cpi.cpi_codepostal = $1 `,
        [$1 = v_codepostal],
        (err, result) => {
            if (err) {
                log.w('::list - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de listpiscine' });
            }
            else {
                const piscines = result.rows;
                log.i('::list - Done')    
                return res.status(200).json({ piscines });
            }
        })
})


router.get('/user/:id', function (req, res) {
    const uti_id = req.params.id
    log.i('::get - for user - In')
    // Recherche des piscines appartenant au utilisateur
    return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y,pis.pis_adr AS adresse, com.com_libelle AS cp
                FROM piscine pis  
                INNER JOIN uti_pis upi on upi.pis_id = pis.pis_id
                INNER JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee
                WHERE upi.uti_id = $1 `,
        [$1 = uti_id],
        (err, result) => {
            if (err) {
                log.w('::get - for user - error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' + uti_id });
            }
            else {
                log.i('::get - for user - Done')
                const mesPiscines = result.rows;
                return res.status(200).json({ mesPiscines });
            }
        });
});

router.get('/:id', async function (req, res) {
    const id = req.params.id
    log.i('::get - In')
    // Recherche des piscines appartenant au utilisateur
    pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y,pis.pis_adr AS adresse, com.com_libelle AS cp
                FROM piscine pis  
                INNER JOIN commune com ON com.cpi_codeinsee = pis.cpi_codeinsee
                WHERE pis.pis_id = $1 `, [$1 = id], (err, result) => {
            if (err) {
                log.w('::get - error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération de la piscine ' + id });
            }
            else {
                log.i('::get - Done')
                const maPiscine = result.rows[0];
                return res.status(200).json({ maPiscine });
            }
        });
})

router.post('/', function (req, res) {
    const { maPiscine } = req.body
    log.i('::posts - In', { maPiscine })
    //insert dans la table uti_pis
    const requete = `INSERT INTO uti_pis (uti_id,pis_id) values($1,$2 ) RETURNING *`;

    log.d('::post - requete', { requete });
    return pgPool.query(requete, [maPiscine.utilisateurId,maPiscine.id], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.', err.stack);
            return res.status(400).json({ message: 'erreur lors de la sauvegarde de la piscine favorite' });
        }
        else {
            log.i('::post - second request about to start', { rows: result.rows })
            return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, pis.pis_adr AS adresse
                        FROM piscine pis  
                        JOIN codepostal_insee cpi ON cpi.cpi_codeinsee = pis.cpi_codeinsee
                        WHERE pis.pis_id = $1 `, [$1 = maPiscine.id],  (err, resu) => {
            if (err) {
                log.w('::post - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' + uti_id });
            } else {
                    log.i('::post - Done', { rows: result.rows })
                    const newPiscine = resu.rows[0];
                    return res.status(200).json({ maPiscine: newPiscine });
            }});
        }
    })
})

router.post('/delete/', async function (req, res) {
    log.i('::delete - In')
    const maPiscine = req.body.piscine
    const requete = `DELETE FROM  uti_pis WHERE uti_id = $1 and pis_id = $2 RETURNING *;`;

    pgPool.query(requete, [maPiscine.uti_id, maPiscine.id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack })
            return res.status(400).json({ message: `Erreur lors de la suppression de la piscine favorite ${id} ` });
        }
        else {
            log.i('::delete - Done')
            return res.status(200).json(result.rows[0]);
        }
    })
})

module.exports = router;
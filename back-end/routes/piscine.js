const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const logger = require('../utils/logger')
const log = logger(module.filename)
/*
Test : 
    Sur serveur web backend : 
        http://localhost:3001/listecommune?codepostal=57530
    Via l'exposition du backend par le proxy (nginx)  
        http://localhost/backend/listecommune?codepostal=57530
*/

router.get('/',

    function (req, res) {
        var v_codepostal;
        v_codepostal = req.query.codepostal;
        // Recherche des communes correspondant au codepostal
        pgPool.query(`select pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, \
         pis.pis_adr AS adresse from piscine pis  
                        inner join codepostal_insee cpi on cpi.cpi_codeinsee = pis.cpi_codeinsee
                    where cpi.cpi_codepostal = $1 `,
            [$1 = v_codepostal],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({ message: 'erreur sur la requete de listpiscine' });
                }
                else {
                    const piscines = result.rows;
                    return res.status(200).json({ piscines });
                }
            });
    });


router.get('/:id', async function (req, res) {
    const uti_id = req.params.id
    // Recherche des piscines appartenant au utilisateur
    pgPool.query(`select pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y,pis.pis_adr AS adresse, com.com_libelle AS cp
                     from piscine pis  
                        inner join uti_pis upi on upi.pis_id = pis.pis_id
                        inner join commune com on com.cpi_codeinsee = pis.cpi_codeinsee
                    where upi.uti_id = $1 `,
        [$1 = uti_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' + uti_id });
            }
            else {
                const mesPiscines = result.rows;
                return res.status(200).json({ mesPiscines });
            }
        });
});

router.post('/', function (req, res) {
    const maPiscine = req.body.maPiscine
    //insert dans la table uti_pis
    const requete = `insert into uti_pis 
                        (uti_id,pis_id) 
                        values($1,$2 ) RETURNING *`;


    log.d('::post - requete', { requete });
    pgPool.query(requete, [maPiscine.utilisateurId,maPiscine.id], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.', err.stack);
            return res.status(400).json('erreur lors de la sauvegarde de la piscine favorite');
        }
        else {
            log.i('::post - Done', { rows: result.rows })
            pgPool.query(`select pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, \
         pis.pis_adr AS adresse
                        from piscine pis  
                        join codepostal_insee cpi on cpi.cpi_codeinsee = pis.cpi_codeinsee
                    where pis.pis_id = $1 `,
                [$1 = maPiscine.id],  (err, resu) => {
                if(err) {
                    console.log(err);
                    return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' + uti_id });
                }
            else {
                    console.log(resu.rows.length)
                    const mesPiscines = resu.rows[0];
                    return res.status(200).json({ maPiscine: mesPiscines });
                }
            });
            //return res.status(200).json({ maPiscine: result.rows[0] });
        }
    })
});

router.post('/delete/', async function (req, res) {
    const maPiscine = req.body.piscine
    const requete = `DELETE FROM  uti_pis 
            WHERE uti_id = $1 and pis_id = $2
            RETURNING *
            ;`;

    pgPool.query(requete, [maPiscine.uti_id, maPiscine.id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la suppression de la piscine favorite ' + id);
        }
        else {
            log.i('::delete - Done')
            // Suppression effectuée avec succès
            return res.status(200).json(result.rows[0]);

        }
    })
})

module.exports = router;
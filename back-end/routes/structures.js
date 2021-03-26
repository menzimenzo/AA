const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool()
const logger = require('../utils/logger');
const log = logger(module.filename)

/*router.get('/:id', async function (req, res) {
    const id = req.params.id;
    
    const requete = `SELECT stru.str_id AS id,str_libelle AS nom,str_code AS code,str_actif as actif,str_commune as commune,
                    str_type as type, str_soustype as soustype,str_adresse as adresse from Structure stru
                    where stru.str_id=${id} `;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { userId, requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la récupération de la structure '+id);
        }
        else {
            const structures = result.rows;
            if (!structures) {
                log.w('::get - aucune structure')
                return res.status(200).json({structures: []});
            }
            log.i('::get - Done')
            console.log(structures.length)
            return res.status(200).json({ structures: structures})
        }
    })
})*/

router.get('/user/:id', async function (req, res) {
    const userId = req.params.id;
    
    const requete = `SELECT stru.str_id AS id,str_libelle AS nom,str_code AS code,str_actif as actif,str_commune as commune,
                    str_type as type, str_soustype as soustype,str_adresse as adresse from Structure stru 
                    join UTI_STR ust on ust.str_id = stru.str_id
                    where ust.uti_id=${userId} `;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { userId, requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la récupération des structures du user');
        }
        else {
            const structures = result.rows;
            if (!structures) {
                log.w('::get - aucune structure')
                return res.status(200).json({structures: []});
            }
            log.i('::get - Done')
            return res.status(200).json({ structures: structures})
        }
    })
})

router.post('/', async function (req, res) {
    log.i('::post - In')
    const structure = req.body.structure
    const userId = req.body.userId
    const { nom, code, actif, adresse, commune, type, soustype } = structure
    let structureCreee = {};

    // On vérifie si la structure est déjà créé ou non 
    const requete = `SELECT stru.str_id AS id,str_libelle AS nom,str_code AS code,str_actif as actif,str_commune as commune,
    str_type as type, str_soustype as soustype,str_adresse as adresse from Structure stru  where stru.str_code='${code}'`;

    pgPool.query(requete, async (err, res1) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la récupération de la structure');
        }
        else {
            log.i('::get - Done')
            const structures = res1.rows[0];

            if (!structures) {
                log.d('::Structure a créer')
                //return res.status(200).json({ message: 'Structure inexistante' });

                //insert dans la table structure
                const secondeRequete = `insert into structure 
                    (str_libelle,str_code,str_actif,str_adresse,str_commune,str_type,str_soustype ) 
                    values($1,$2,$3,$4,$5,$6,$7 ) RETURNING str_id AS id,str_libelle AS nom,str_code AS code,str_actif as actif,str_commune as commune,
                    str_type as type, str_soustype as soustype,str_adresse as adresse  `

                //console.log({ secondeRequete });
                const creation = await pgPool.query(secondeRequete, [nom, code, actif, adresse, commune, type, soustype])
                if (!creation) {
                    log.w('::update - Erreur lors de la création.', { secondeRequete, erreur: err.stack })
                    return result.status(400).json('erreur lors de la création de la structure');
                }
                else {
                    log.i('::post - Done')
                    structureCreee = creation.rows[0]
                }
            }
            else {
                log.d('structure existante')
                structureCreee = structures
            }
            
            const troisiemeRequete = `insert into uti_str 
                    (uti_id,str_id) 
                    values($1,$2) RETURNING *`;

            const insert = await pgPool.query(troisiemeRequete, [userId, structureCreee.id])
            if (!insert) {
                log.w('::post - Erreur lors de la création du lien user - structure.', { troisiemeRequete, erreur: err.stack })
                return res.status(400).json('erreur lors de la création du lien user - structure');
            }
            else {
                log.i('::post - Done')
                return res.status(200).json({ structure: structureCreee });
            }
        }
    })
});


router.post('/delete', async function (req, res) {
    log.i('::delete - In')
    const structure = req.body.structure;
    
    const requete = `DELETE from uti_str where str_id='${structure.id}'`;

    pgPool.query(requete, async (err, result) => {
        if (err) {
            log.w('::delete - Erreur lors de la suppression de la structure favorite', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la suppression de la structure favorite');
        }
        else {
            log.i('::delete - Done')
            return res.status(200).json('structure '+structure.nom+ ' supprimée des favorites');
            }
    })
});


const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/:id', async function (req, res) {
    const id = req.params.id;
    log.i('::get - In', { id })
    const requete = `SELECT * from Structure where str_id=${id}`;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { id, requete, erreur: err.stack })
            return res.status(400).json({ message: 'erreur lors de la récupération de la structure'});
        }
        else {
            const structures = result.rows[0];
            if (!structures) {
                log.w('::get - Structure inexistante')
                return res.status(400).json({ message: 'Structure inexistante' });
            }
            log.i('::get - Done')
            return res.status(200).json({ structures });
        }
    })
});

router.get('/', function (req, res) {
    log.i('::list - In')
    // La méthode get est appelée sans paramètre : On retourne la liste
    pgPool.query(
        `SELECT *, replace(replace(str_actif::text,'true','Oui'),'false','Non') as str_actif_on FROM structure order by str_libellecourt`,
        function (err, result) {
            if (err) {
                log.w('::list - Erreur lors de la requete', { requete, erreur: err.stack })
            } else {
                log.i('::list - Fin de la transaction structures (sans paramètres)', result.length);
                return res.send(result.rows);
            }
        });
});

router.put('/:id', async function (req, res) {
    const structure = req.body.structureSelectionnee    
    const id = req.params.id
    log.i('::update - In', { id })
    let { str_libelle, str_libellecourt, str_actif,str_federation } = structure

    //insert dans la table intervention
    const requete = `UPDATE structure 
        SET str_libelle = $1,
        str_libellecourt = $2,
        str_actif = $3,
        str_federation = $4
        WHERE str_id = ${id}
        RETURNING *
        ;`    
    pgPool.query(requete,[str_libelle,
        str_libellecourt,
        str_actif,
        str_federation], (err, result) => {
        if (err) {
            log.w('::update - Erreur lors de la mise à jour', { requete , erreur: err.stack})
            return res.status(400).json({ message: 'erreur lors de la sauvegarde de la structure' });
        }
        else {
            log.i('::update - Done')
            return res.status(200).json({ structure: (result.rows[0])});
        }
    })
})

router.post('/', function (req, res) {
    const structure = req.body.structure
    log.i('::post - In', { structure })
    let { str_libelle,  str_libellecourt, str_actif, str_federation } = structure

    if (str_actif == '') { str_actif = false } else { str_actif = true}
    if (str_federation == '') { str_federation = false } else { str_federation = true}

    //insert dans la table structure
    const requete = `insert into structure 
                    (str_libelle,  str_libellecourt, str_actif, str_federation) 
                    values($1,$2,$3,$4 ) RETURNING *`;
    
    //console.log({ requete });
    pgPool.query(requete, [str_libelle,  str_libellecourt, str_actif, str_federation],(err, result) => {
        if (err) {
            log.w('::update - Erreur lors de la création.', { requete , erreur: err.stack})                
            return res.status(400).json({ message: 'erreur lors de la création de la structure' });
        }
        else {
            log.i('::post - Done')
            return res.status(200).json({ structure: (result.rows[0]) });
        }
    })
})

module.exports = router;
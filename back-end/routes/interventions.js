const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const stringify = require('csv-stringify')
const myPdf = require('../utils/pdf')
const { getIntervention } = require('../controllers');
const { getUtilisateursFromIntervention } = require('../controllers');
const { getEnfantsFromIntervention } = require('../controllers/');
const { postUtilisateursForIntervention } = require('../controllers/');
const { postEnfantsForIntervention } = require('../controllers/');
const { deleteEnfantsFromIntervention } = require('../controllers/');
const { deleteUtilisateursFromIntervention } = require('../controllers/');

//const formatIntervention = require('../utils/utils')
var moment = require('moment');
moment().format();

const logger = require('../utils/logger');


const log = logger(module.filename)

const formatIntervention = intervention => {
    var result = {
        id: intervention.int_id,
        nbEnfants: intervention.int_nombreenfant,
        piscine: {
          nom: intervention.pis_nom,
          id: intervention.pis_id,
          adresse: intervention.pis_adresse,
          cp: intervention.cp,
          type: intervention.typ_id,
          x: intervention.pis_x,
          y: intervention.pis_y
        },
        strId: intervention.str_id,
        strNom: intervention.str_libellecourt,
        cai: intervention.int_cai,
        classe:intervention.int_age,
        nbSession:intervention.int_nbsession,
        dateDebutIntervention: new Date(intervention.int_datedebutintervention),
        dateFinIntervention: new Date(intervention.int_datefinintervention),
        dateCreation: new Date(intervention.int_datecreation),
        dateMaj: intervention.int_datemaj
    }
    return result
}


router.get('/delete/:id', async function (req, res) {
    const intervention = req.body.intervention;
    const id = req.params.id;
    log.i('::delete - In', { id })

    //insert dans la table intervention
    const requete = `DELETE FROM  intervention 
        WHERE int_id = $1
        RETURNING *
        ;`;

    pgPool.query(requete, [id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la suppression de l\'intervention ' + id);
        }
        else {
            log.i('::delete - Done')
            // Suppression effectuée avec succès
            return res.status(200).json({ intervention: result.rows.map(formatIntervention)[0] });

        }
    })
})

router.get('/csv/:utilisateurId', async function (req, res) {

    // Modification de la récupération de l'utilisateur courant 
    if (!req.session.user) {
        return res.sendStatus(403)
    }
    const id = req.params.id
    const user = req.session.user
    const utilisateurId = user.uti_id
    const stru = user.uti_id

    log.i('::csv - In', { utilisateurId, stru })

    /* Pour un profil Admin, on exporte toutes les interventions */
    var whereClause = ""
    /* Pour un profil Intervenant on exporte que ces interventions */
    // Modification des profils.
    if (user.pro_id == 4 || user.pro_id == 3) {
        whereClause += ` and utilisateur.uti_id=${utilisateurId} `
    }
    /* Pour un profil Partenaire, on exporte les interventions de sa structure*/
    if (user.pro_id == 2) {
        whereClause += ` and utilisateur.str_id=${user.str_id} `
    }
    // Remplacement Clause Where en remplacant utilisateur par clause dynamique
    const requete = `SELECT * from intervention 
    INNER JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id 
    ${whereClause} 
    INNER JOIN structure ON structure.str_id = utilisateur.str_id 
    order by int_id asc`;
    log.d('::csv - requet', { requete })

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csv - erreur lors de la requête.', err.stack);
            return res.status(400).json('erreur lors de la récupération de l\'intervention');
        }
        else {
            var interventions = result.rows;
            interventions = interventions.map(intervention => {
                var newIntervention = formatIntervention(intervention)
                delete newIntervention.commune
                newIntervention.commune = intervention.int_com_libelle
                newIntervention.codeinsee = intervention.int_com_codeinsee
                newIntervention.dep_num = intervention.int_dep_num
                newIntervention.reg_num = intervention.int_reg_num
                newIntervention.dateIntervention = newIntervention.dateIntervention.toLocaleDateString(),
                    newIntervention.dateCreation = newIntervention.dateCreation.toISOString(),
                    newIntervention.dateMaj = newIntervention.dateMaj.toISOString()
                delete newIntervention.structureCode;
                delete newIntervention.structureLibelle;
                delete newIntervention.StructureLocaleUtilisateur;
                newIntervention.structureCode = intervention.str_libellecourt;
                newIntervention.structureLibelle = intervention.str_libelle;
                newIntervention.StructureLocaleUtilisateur = intervention.uti_structurelocale;
                // Suppression du commentaire dans l'export CSV
                delete newIntervention.commentaire

                return newIntervention
            })
            if (!interventions || !interventions.length) {
                log.w('::csv - Intervention inexistante.', err.stack);
                return res.status(400).json({ message: 'Interventions inexistante' });
            }
            stringify(interventions, {
                quoted: '"',
                header: true
            }, (err, csvContent) => {
                if (err) {
                    log.w('::csv - Erreur lors callback après stringify.', err.stack);
                    return res.status(500)
                } else {
                    log.i('::csv - Done')
                    return res.send(csvContent)
                }
            })
        }
    })
});

router.get('/:id', async function (req, res) {
    log.i('::get - In')
    const id = req.params.id
    const user = req.session.user
    const params = {
        id: id,
        user: user
    }
    inter = await getIntervention(params)
    return res.status('200').json({ intervention: inter[0] })
});

router.get('/', async function (req, res) {
    log.i('::list - In')
    if (!req.session.user) {
        log.w('::list - User manquant.')
        return res.sendStatus(403)
    }

    const user = req.session.user
    const utilisateurId = user.uti_id
    var whereClause = ""


    if (user.rol_id == 3 || user.rol_id == 4) {
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
         LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id
         where uti.uti_id=${utilisateurId}`
        // Utilisateur Administrateur : 
    } else {
        // whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id LEFT JOIN structure ON structure.str_id = utilisateur.str_id `
        // Laurent : Pour le moment on met la même chose pour les admin pour éviter que ça plante.
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
        LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id
         where uti.uti_id=${utilisateurId}`
    }

    const requete = `SELECT int.*, pis.*, str.str_libellecourt from intervention int ${whereClause} order by int.int_datefinintervention desc`;
    log.d('::list - récuperation via la requête.', { requete });

    (async () => {
        try {
            let result = await pgPool.query(requete)
            let interventions = result.rows.map(formatIntervention);

            for (const [key, intervention] of Object.entries(interventions)) {
                await Promise.all([getUtilisateursFromIntervention(intervention.id), getEnfantsFromIntervention(intervention.id)]).then(values => {
                    interventions[key].utilisateur = values[0];
                    interventions[key].enfant = values[1];
                })
            }
            res.json({ interventions });
        }
        catch (err) {
            throw err
        }
    })().catch(err => {
        log.w('::list - Erreur survenue lors de la récupération', err.stack)
        return res.status(400).json('erreur lors de la récupération des interventions')
    }
    )

});


router.put('/:id', async function (req, res) {
    const intervention = req.body.intervention
    const user = req.session.user
    const id = req.params.id
    log.i('::update - In', { id })
    let { strId, nbEnfants, piscine, dateDebutIntervention,dateFinIntervention,utilisateur,enfant,nbSession,cai,classe } = intervention

    //insert dans la table intervention
    const requete = `UPDATE intervention 
        SET str_id= $1,
        int_nombreenfant= $2,
        pis_id = $3,
        int_datedebutintervention = $4,
        int_datefinintervention = $5,
        int_nbsession = $6,
        int_cai =$7,
        int_age = $8,
        int_datemaj = now()
        WHERE int_id = ${id}
        RETURNING *
        ;`

    log.d('::update - requete', { requete })
    pgPool.query(requete, [strId,
        nbEnfants,
        piscine.id,
        dateDebutIntervention,
        dateFinIntervention,
        nbSession,
        cai,
        classe
    ], async (err, result) => {
        if (err) {
            log.w('::update - erreur lors de la sauvegarde', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.i('::update - Done')
            // generation du pdf (synchrone)

            // suppression des données utilisateurs et enfants
            await Promise.all([deleteUtilisateursFromIntervention([id]),deleteEnfantsFromIntervention([id])]).then(async () => {
                
                // Ajout des données utilsiateurs et enfants
                await Promise.all([postUtilisateursForIntervention([utilisateur,id]),postEnfantsForIntervention([enfant,id])]).then(async () => {
                
                    const user = req.session.user
                    const params = {
                        id: result.rows[0].int_id,
                        user: user
                    }
                    let inter = await getIntervention(params)
                    log.i('::post - Done')
                    return res.status(200).json({ intervention: inter[0] })
                })

            })
        }
    })
})

router.post('/', async function (req, res) {
    log.i('::post - In')
    const intervention = req.body.intervention
    if ( ! intervention.classe) { intervention.classe = null}

    const requete = `insert into intervention 
                    (pis_id,str_id,int_nombreenfant,int_datedebutintervention,int_datefinintervention,int_nbsession, int_cai, int_age,int_datecreation,int_datemaj) 
                    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10 ) RETURNING int_id AS int_id`;

    console.log(requete)
    await pgPool.query(requete, [intervention.piscine.id,
    intervention.strId,
    intervention.nbEnfants,
    intervention.dateDebutIntervention,
    intervention.dateFinIntervention,
    intervention.nbSession,
    intervention.cai,
    intervention.classe,
    new Date().toISOString(),
    new Date().toISOString()], async (err, result) => {
        if (err) {
            log.w('::post - erreur lors de l\'insertion dans la table des interventions', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.d('::post - insert dans intervention Done');
            let int_id = result.rows[0].int_id;
            await Promise.all([postUtilisateursForIntervention([intervention.utilisateur, int_id]),postEnfantsForIntervention([intervention.enfant, int_id])]).then(async () => {
                
                const user = req.session.user
                const params = {
                    id: result.rows[0].int_id,
                    user: user
                }
                let inter = await getIntervention(params)
                log.i('::post - Done')
                return res.status(200).json({ intervention: inter[0] })
            })
            
        }
    })
})

module.exports = router;
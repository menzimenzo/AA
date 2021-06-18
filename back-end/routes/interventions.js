const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const stringify = require('csv-stringify')

const { 
    getIntervention, 
    getUtilisateursFromIntervention,
    getEnfantsFromIntervention,
    postUtilisateursForIntervention,
    postEnfantsForIntervention,
    deleteEnfantsFromIntervention,
    deleteUtilisateursFromIntervention } = require('../controllers');

const { formatIntervention } = require('../utils/utils')

const logger = require('../utils/logger');
const log = logger(module.filename)

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
         LEFT JOIN structure str on str.str_id = int.str_id \
         LEFT JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee \
         where uti.uti_id=${utilisateurId}`
    } else {
        // Laurent : Pour le moment on met la même chose pour les admin pour éviter que ça plante.
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
         LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id \
         LEFT JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee \
         where uti.uti_id=${utilisateurId}`
    }
    const requete = `SELECT int.*, pis.*, str.*,com.com_libelle from intervention int ${whereClause} order by int.int_datefinintervention desc`;
    
    log.d('::list - récuperation via la requête.');
    const result = await pgPool.query(requete)
    const interventions = result && result.rowCount > 0 && result.rows.map(formatIntervention)

    if(interventions) {
        log.d('::list - interventions trouvées.')
        interventions.map(intervention => {
            return Promise.all([getUtilisateursFromIntervention(intervention.id), getEnfantsFromIntervention(intervention.id)]).then(values => {
                intervention.utilisateur = values[0];
                intervention.enfant = values[1];
            }).catch(error => {
                log.w('::list - error on getting enfants and utilisateurs', error)
                return res.status(400).json('Une erreur est survenue lors de la récupérations des enfants et des utilisateurs pour la liste des interventions.')
            })
        })
        log.i('::list - Done')
        return res.status(200).json({ interventions })
    } else {
        return res.status(200).json('Aucune intervention trouvée.')
    }
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
    if(!inter || inter.rowCount === 0) {
        log.w('get - Intervention inexistante')
        return res.status(404).json('Intervention inexistante.')
    }
    log.i('::get - Done', { id: inter[0].id })
    return res.status(200).json({ intervention: inter[0] })
});

router.get('/csv/:utilisateurId', async function (req, res) {
    // Modification de la récupération de l'utilisateur courant 
    if (!req.session.user) {
        return res.sendStatus(403)
    }
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

    return pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csv - erreur lors de la requête.', err.stack);
            return res.status(400).json('erreur lors de la récupération de l\'intervention');
        }
        else {
            let interventions = result.rows;
            if (!interventions || !interventions.length) {
                log.w('::csv - Intervention inexistante.', err.stack);
                return res.status(400).json({ message: 'Interventions inexistante' });
            }
            interventions = interventions.map(intervention => {
                const clientInter = formatIntervention(intervention)
                delete clientInter.commune
                clientInter.commune = intervention.int_com_libelle
                clientInter.codeinsee = intervention.int_com_codeinsee
                clientInter.dep_num = intervention.int_dep_num
                clientInter.reg_num = intervention.int_reg_num
                clientInter.dateCreation = clientInter.dateCreation.toISOString(),
                clientInter.dateMaj = clientInter.dateMaj.toISOString()
                delete clientInter.structureCode;
                delete clientInter.structureLibelle;
                delete clientInter.StructureLocaleUtilisateur;
                clientInter.structureCode = intervention.str_libellecourt;
                clientInter.structureLibelle = intervention.str_libelle;
                clientInter.StructureLocaleUtilisateur = intervention.uti_structurelocale;
                // Suppression du commentaire dans l'export CSV
                delete clientInter.commentaire
                return clientInter
            })

            return stringify(interventions, {
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
})

router.put('/:id', async function (req, res) {
    const intervention = req.body.intervention
    const id = req.params.id
    log.i('::update - In', { id })
    const { strId, nbEnfants, piscine, dateDebutIntervention,dateFinIntervention,utilisateur,enfant,nbSession,cai,classe } = intervention

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
        RETURNING *;`

    log.d('::update - requete', { requete })
    return pgPool.query(requete, [strId,
        nbEnfants,
        piscine.id,
        dateDebutIntervention,
        dateFinIntervention,
        nbSession,
        cai,
        classe
    ], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de la sauvegarde', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.i('::update - Done')
            // suppression des données utilisateurs et enfants
            return Promise.all([deleteUtilisateursFromIntervention([id]),deleteEnfantsFromIntervention([id])]).then(() => {  
                // MAJ des données utilsiateurs et enfants
                return Promise.all([postUtilisateursForIntervention([utilisateur,id]),postEnfantsForIntervention([enfant,id])]).then(async () => {
                    const user = req.session.user
                    const params = {
                        id: result.rows[0].int_id,
                        user: user
                    }
                    let inter = await getIntervention(params)
                    log.i('::post - Done')
                    return res.status(200).json({ intervention: inter[0] })
                })
            }).catch( error => {
                log.w('::update - erreur lors de la mise à jour des utilisateurs ou des enfants pour une intervention.', error)
                return res.status(400).json('Erreur lors de la mise à jour des utilisateurs ou des enfants pour une intervention')
            })
        }
    })
})

router.post('/', function (req, res) {
    log.i('::post - In')
    const intervention = req.body.intervention
    if ( ! intervention.classe) { intervention.classe = null}

    const requete = `insert into intervention 
                    (pis_id,str_id,int_nombreenfant,int_datedebutintervention,int_datefinintervention,int_nbsession, int_cai, int_age,int_datecreation,int_datemaj) 
                    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10 ) RETURNING int_id AS int_id`;

    return pgPool.query(requete, [intervention.piscine.id,
    intervention.strId,
    intervention.nbEnfants,
    intervention.dateDebutIntervention,
    intervention.dateFinIntervention,
    intervention.nbSession,
    intervention.cai,
    intervention.classe,
    new Date().toISOString(),
    new Date().toISOString()], (err, result) => {
        if (err) {
            log.w('::post - erreur lors de l\'insertion dans la table des interventions', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.d('::post - insert dans intervention Done');
            let int_id = result.rows[0].int_id;
            return Promise.all([postUtilisateursForIntervention([intervention.utilisateur, int_id]),postEnfantsForIntervention([intervention.enfant, int_id])]).then(async () => {
                const user = req.session.user
                const params = {
                    id: result.rows[0].int_id,
                    user: user
                }
                const inter = await getIntervention(params)
                log.i('::post - Done')
                return res.status(200).json({ intervention: inter[0] })
            }).catch( error => {
                log.w('::post - erreur lors des suppresions des utilisateurs ou des enfants pour une intervention.', error)
                return res.status(400).json('Erreur lors des ajouts des utilisateurs ou des enfants pour votre intervention')
            })
        }
    })
})

router.get('/delete/:id', async function (req, res) {
    const id = req.params.id;
    log.i('::delete - In', { id })

    const requete = `DELETE FROM intervention WHERE int_id = $1 RETURNING *;`;

    return pgPool.query(requete, [id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la suppression de l\'intervention ' + id);
        }
        else {
            log.i('::delete - Done')
            // Suppression effectuée avec succès
            return res.status(200).json('Intervention supprimée avec succès.');
        }
    })
})

module.exports = router;
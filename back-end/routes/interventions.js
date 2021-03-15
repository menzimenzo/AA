const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const stringify                                        = require('csv-stringify')
const myPdf = require('../utils/pdf')
var moment = require('moment');
moment().format();

const logger = require('../utils/logger')
const log = logger(module.filename)

const formatIntervention = intervention => {

    var result = {
        id: intervention.int_id,
        utiId: intervention.uti_id,
        cp: intervention.int_com_codepostal,
        commune: {
            com_libellemaj: intervention.int_com_libelle,
            cpi_codeinsee: intervention.int_com_codeinsee,
            dep_num: intervention.int_dep_num,
            reg_num: intervention.int_reg_num
        },
        nbEnfants: intervention.int_nombreenfant,
        dateIntervention: new Date(intervention.int_dateintervention),
        dateCreation: new Date(intervention.int_datecreation),
        dateMaj: intervention.int_datemaj,
        commentaire: intervention.int_commentaire,
        departement:intervention.int_dep_num
    }

    if(intervention.uti_nom){
        result.nom = intervention.uti_prenom + ' ' + intervention.uti_nom
        result.structure = intervention.str_libellecourt
        result.structureId = intervention.str_id
    }

    result.structureCode = intervention.str_libellecourt;
    result.structureLibelle = intervention.str_libelle;
    result.StructureLocaleUtilisateur = intervention.uti_structurelocale;

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
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack})
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

    //const utilisateurId = req.params.utilisateurId; // TODO à récupérer via POST ?
    // Where condition is here for security reasons.

   /* MANTIS 68203 Erreur lors de l'export par un Admin */
   // Modification de la récupération de l'utilisateur courant 
    if(!req.session.user){
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
    if(user.pro_id == 3){
        whereClause += ` and utilisateur.uti_id=${utilisateurId} `
    }
    /* Pour un profil Partenaire, on exporte les interventions de sa structure*/
    if(user.pro_id == 2){
        whereClause += ` and utilisateur.str_id=${user.str_id} `
    }
    // Remplacement Clause Where en remplacant utilisateur par clause dynamique
    const requete =`SELECT * from intervention 
    INNER JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id 
    ${whereClause} 
    INNER JOIN structure ON structure.str_id = utilisateur.str_id 
    order by int_id asc`;
    log.d('::csv - requet', { requete })

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csv - erreur lors de la requête.',err.stack);
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
                log.w('::csv - Intervention inexistante.',err.stack);
                return res.status(400).json({ message: 'Interventions inexistante' });
            }
            stringify(interventions, {
                quoted: '"',
                header: true
            }, (err, csvContent) => {
                if(err){
                    log.w('::csv - Erreur lors callback après stringify.',err.stack);
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
    if(!req.session.user){
        log.w('::get - User manquant.')
        return res.sendStatus(403)
    }
    const id = req.params.id
    const user = req.session.user
    const utilisateurId = user.uti_id

    // Where condition is here for security reasons.
    var whereClause = ""
    if(user.pro_id == 3){
        whereClause += ` and uti_id=${utilisateurId} `
    }

    const requete =`SELECT * from intervention where int_id=${id} ${whereClause} order by int_id asc`;
    log.d('::get - récuperation via la requête.',{ requete })

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur survenue lors de la récupération.',err.stack);
            return res.status(400).json('erreur lors de la récupération de l\'intervention');
        }
        else {
            const intervention = result.rows && result.rows.length && result.rows[0];
            if (!intervention) {
                log.w('::get - Intervention inexistante.')
                return res.status(400).json({ message: 'Intervention inexistante' });
            }
            log.i('::get - Done')
            res.json({ intervention: formatIntervention(intervention) });
        }
    })
});

router.get('/', async function (req, res) {
    log.i('::list - In')
    if(!req.session.user){ 
        log.w('::list - User manquant.')
        return res.sendStatus(403) 
    }

    const user = req.session.user
    const utilisateurId = user.uti_id

    // Get subset of interventions depending on user profile
    var whereClause = ""
    // Utilisateur est partenaire => intervention de la structure
    //if(user.pro_id == 2){
        //whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id where utilisateur.str_id=${user.str_id} `
    //  whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id  `
    // Utilisateur est intervenant => ses interventions
    //} 
    if(user.pro_id == 3){
        whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id where utilisateur.uti_id=${utilisateurId} `
    // Utilisateur Administrateur : 
    } else {
        whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id LEFT JOIN structure ON structure.str_id = utilisateur.str_id `
    }

    const requete = `SELECT * from intervention ${whereClause} order by int_dateintervention desc`;
    log.d('::list - récuperation via la requête.',{ requete })

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list - Erreur survenue lors de la récupération.',err.stack);
            return res.status(400).json('erreur lors de la récupération des interventions');
        }
        else {
            log.i('::list - Done')
            const interventions = result.rows.map(formatIntervention);
            res.json({ interventions });
        }
    })
});

router.put('/:id', async function (req, res) {
    const intervention = req.body.intervention

    const id = req.params.id
    log.i('::update - In', { id })

    let { nbEnfants, commune, dateIntervention, 
        commentaire, cp, utilisateurId,siteintervention,
        nbmoinssix, nbsixhuit, nbneufdix, nbplusdix  } = intervention
/*
    if (nbGarcons == '') { nbGarcons = null }
    if (nbFilles == '') { nbFilles = null }
    if (nbmoinssix == '') { nbmoinssix = null }
    if (nbsixhuit == '') { nbsixhuit = null }
    if (nbneufdix == '') { nbneufdix = null }
    if (nbplusdix == '') { nbplusdix = null }
*/
    //insert dans la table intervention
    const requete = `UPDATE intervention 
        SET cai_id = $1,
        blo_id = $2,
        int_com_codeinsee = $3,
        int_com_codepostal = $4,
        int_com_libelle = $5,
        int_nombreenfant = $6,
        int_dateintervention = $7,
        int_datemaj = now(),
        int_commentaire = $8,
        int_dep_num = $9,
        int_reg_num = $10,
        int_siteintervention = $11
        WHERE int_id = ${id}
        RETURNING *
        ;`    
    
    log.d('::update - requete', { requete })
    pgPool.query(requete, [cai,
        blocId,
        commune.cpi_codeinsee,
        cp,
        commune.com_libellemaj,
        nbEnfants,
        dateIntervention,
        commentaire,
        commune.dep_num,
        commune.reg_num,
        siteintervention], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de la récupération', { requete, erreur: err.stack})
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.i('::update - Done')
            // generation du pdf (synchrone)
            if (blocId == 3 ) {
                myPdf.generate(id,nbEnfants, dateIntervention)  
            }
            return res.status(200).json({ intervention: result.rows.map(formatIntervention)[0] });

        }
    })
})

router.post('/', function (req, res) {
    log.i('::post - In')
    const intervention = req.body.intervention

    let { nbEnfants,  commune, dateIntervention,
         commentaire, cp, utilisateurId, siteintervention,
         nbmoinssix, nbsixhuit, nbneufdix, nbplusdix } = intervention
  /*  
    if (nbGarcons == '') { nbGarcons = null }
    if (nbFilles == '') { nbFilles = null }
    if (nbmoinssix == '') { nbmoinssix = null }
    if (nbsixhuit == '') { nbsixhuit = null }
    if (nbneufdix == '') { nbneufdix = null }
    if (nbplusdix == '') { nbplusdix = null }
*/
    //insert dans la table intervention
    const requete = `insert into intervention 
                    (uti_id,int_com_codeinsee,int_com_codepostal,int_com_libelle,
                        int_nombreenfant,int_dateintervention,
                        int_datecreation,int_datemaj,int_commentaire,
                        int_dep_num,int_reg_num,int_siteintervention) 
                    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12 ) RETURNING *`;
    
    log.d('::post - requete',{ requete });
    pgPool.query(requete, [utilisateurId,commune.cpi_codeinsee,cp,commune.com_libellemaj,
    nbEnfants,dateIntervention,new Date().toISOString(),new Date().toISOString(),commentaire, 
    commune.dep_num, commune.reg_num,siteintervention],(err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.',err.stack);
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.i('::post - Done', { rows: result.rows })
            // generation du pdf (synchrone)
            //if (blocId == 3) {
              myPdf.generate(result.rows.map(formatIntervention)[0].id,nbEnfants,dateIntervention);
            //}
            return res.status(200).json({ intervention: result.rows.map(formatIntervention)[0] });
        }
    })
})

module.exports = router;
const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const stringify = require('csv-stringify')
const myPdf = require('../utils/pdf')
var moment = require('moment');
moment().format();

const logger = require('../utils/logger')
const log = logger(module.filename)

const formatIntervention = intervention => {
    var result = {
        id: intervention.int_id,
        utiId: intervention.uti_id,
        nbEnfants: intervention.int_nombreenfant,
        strId: intervention.str_id,
        pisId: intervention.pis_id,
        piscine: {
            nom: intervention.pis_nom,
            id: intervention.pis_id,
            adresse: intervention.pis_adresse,
            cp :intervention.cp,
            type: intervention.typ_id,
            x: intervention.pis_x,
            y: intervention.pis_y
        },
        strNom: intervention.str_libellecourt,
        //nbNouveauxEnfants: intervention.int_nombreenfant,
        dateIntervention: new Date(intervention.int_dateintervention),
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
    // Modification des profils.
    if ( user.pro_id == 4 || user.pro_id == 3 ) {
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
    if (!req.session.user) {
        log.w('::get - User manquant.')
        return res.sendStatus(403)
    }
    const id = req.params.id
    const user = req.session.user
    const utilisateurId = user.uti_id

    // Where condition is here for security reasons.
    var whereClause = ""
    if (user.rol_id == 3 ||  user.rol_id == 4) {
        whereClause += ` and uti_id=${utilisateurId} `
    }

    const requete = `SELECT int.*,pis.*, str.str_libellecourt from intervention int \
    LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
    LEFT JOIN structure str on str.str_id = int.str_id \
    where int.int_id=${id} ${whereClause} order by int_id asc`;
    log.d('::get - récuperation via la requête.', { requete })

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur survenue lors de la récupération.', err.stack);
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
    if (!req.session.user) {
        log.w('::list - User manquant.')
        return res.sendStatus(403)
    }

    const user = req.session.user
    const utilisateurId = user.uti_id
    var whereClause = ""
    // Utilisateur est partenaire => intervention de la structure
    //if(user.pro_id == 2){
    //whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id where utilisateur.str_id=${user.str_id} `
    //  whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id  `
    // Utilisateur est intervenant => ses interventions
    //} 
<<<<<<< HEAD
    if (user.rol_id == 3) {
        whereClause += `LEFT JOIN uti_int ui ON int.int_id = ui.int_id  \
         LEFT JOIN utilisateur uti on uti.uti_id = ui.uti_id \
||||||| parent of 72c54ca... MAJ Roles et création des routes
    if (user.rol_id == 3) {
        whereClause += `LEFT JOIN utilisateur uti ON int.uti_id = uti.uti_id  \
=======
    if (user.rol_id == 3 || user.rol_id == 4) {
        whereClause += `LEFT JOIN utilisateur uti ON int.uti_id = uti.uti_id  \
>>>>>>> 72c54ca... MAJ Roles et création des routes
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id
         where uti.uti_id=${utilisateurId}`
        // Utilisateur Administrateur : 
    } else {
        // whereClause += `LEFT JOIN utilisateur ON intervention.uti_id = utilisateur.uti_id LEFT JOIN structure ON structure.str_id = utilisateur.str_id `
        // Laurent : Pour le moment on met la même chose pour les admin pour éviter que ça plante.
        whereClause += `LEFT JOIN utilisateur uti ON int.uti_id = uti.uti_id  \
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id
         where uti.uti_id=${utilisateurId}`
    }

    const requete = `SELECT int.*, pis.*, str.str_libellecourt from intervention int ${whereClause} order by int.int_dateintervention desc`;
    log.d('::list - récuperation via la requête.', { requete })

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list - Erreur survenue lors de la récupération.', err.stack);
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
                log.w('::update - erreur lors de la récupération', { requete, erreur: err.stack })
                return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
            }
            else {
                log.i('::update - Done')
                // generation du pdf (synchrone)
                if (blocId == 3) {
                    myPdf.generate(id, nbEnfants, dateIntervention)
                }
                return res.status(200).json({ intervention: result.rows.map(formatIntervention)[0] });

            }
        })
})

router.post('/', function (req, res) {
    log.i('::post - In')
    const intervention = req.body.intervention
    console.log(intervention)

    //insert dans la table intervention
    const requete = `insert into intervention 
                    (pis_id,str_id,uti_id, int_nombreenfant,int_dateintervention,int_datecreation,int_datemaj) 
                    values($1,$2,$3,$4,$5,$6,$7 ) RETURNING *`;

    log.d('::post - requete', { requete });
    pgPool.query(requete, [intervention.piscine.id, intervention.strId, intervention.maitreNageurId, intervention.nbEnfants,
    intervention.dateIntervention, new Date().toISOString(), new Date().toISOString()], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.', err.stack);
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.i('::post - Done', { rows: result.rows })
            // generation du pdf (synchrone)
            //if (blocId == 3) {
            //  myPdf.generate(result.rows.map(formatIntervention)[0].id,nbEnfants,dateIntervention);
            //}

            // requete de selection pour que l'objet retourné par le POST soit au même format que le GET
            const requete2 = `SELECT int.*, pis.*, str.str_libellecourt from intervention int \
                            LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
                            LEFT JOIN structure str on str.str_id = int.str_id
                            where int.int_id=${result.rows[0].int_id}`;

            log.d('::get - requete', { requete2 });
            pgPool.query(requete2, [], (err2, result2) => {
                if (err2) {
                    log.w('::select - Erreur lors de la requête.', err2.stack);
                    return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
                }
                else {
                    log.i('::select - Done', { rows: result2.rows })
                    return res.status(200).json({ intervention: result2.rows.map(formatIntervention)[0] });
                }
            })
        }
    })
})

module.exports = router;
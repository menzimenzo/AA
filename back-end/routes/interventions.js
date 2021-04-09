const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const stringify = require('csv-stringify')
const myPdf = require('../utils/pdf')
const { getIntervention } = require('../controllers');
const { getUtilisateursFromIntervention } = require('../controllers');
//const formatIntervention = require('../utils/utils')
var moment = require('moment');
moment().format();

const logger = require('../utils/logger');

const log = logger(module.filename)

const formatIntervention = intervention => {
    var result = {
        id: intervention.int_id,
        nbEnfants: intervention.int_nombreenfant,
        strId: intervention.str_id,
        pisId: intervention.pis_id,
        piscine: {
            nom: intervention.pis_nom,
            id: intervention.pis_id,
            adresse: intervention.pis_adresse,
            cp: intervention.cp,
            type: intervention.typ_id,
            x: intervention.pis_x,
            y: intervention.pis_y
        },
        strNom: intervention.str_libellecourt,
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
    /* if (!req.session.user) {
         log.w('::get - User manquant.')
         return res.sendStatus(403)
     }
     const utilisateurId = user.uti_id
 
     // Where condition is here for security reasons.
     var whereClause = ""
     if (user.rol_id == 3 || user.rol_id == 4) {
         whereClause += ` and uti.uti_id=${utilisateurId} `
     }
 
     const requete = `SELECT int.*,pis.*, str.str_libellecourt from intervention int \
     LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
     LEFT JOIN structure str on str.str_id = int.str_id \
     LEFT JOIN uti_int ui on ui.int_id = int.int_id \
     LEFT JOIN utilisateur uti on ui.uti_id = uti.uti_id \
     where int.int_id=${id} ${whereClause} order by int_id asc`;
     log.d('::get - récuperation via la requête.', { requete });
 
     (async () => {
         try {
             let result = await pgPool.query(requete)
             let intervention = result.rows.map(formatIntervention);
             for (const [key, int] of Object.entries(intervention)) {
                 log.i('::get2 - In' + key)
                 let secondeRequete = `SELECT uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom, uti.uti_mail AS mail
                  from utilisateur uti \
                 LEFT JOIN uti_int ui on uti.uti_id = ui.uti_id \
                 LEFT JOIN intervention int on int.int_id = ui.int_id \
                 WHERE int.int_id = ${int.id}`
 
                 let result2 = await pgPool.query(secondeRequete)
                 log.i('::get2 - Done')
                 intervention[key].utilisateur = result2.rows;
             }
             console.log(intervention[0])
             res.json({ intervention: intervention[0] });
             //res.json({ intervention });
         }
         catch (err) {
             throw err
         }
     })().catch(err => {
         log.w('::get - Erreur survenue lors de la récupération', err.stack)
         return res.status(400).json('erreur lors de la récupération de l\'intervention ' + id)
     }
     )*/
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

    const requete = `SELECT int.*, pis.*, str.str_libellecourt from intervention int ${whereClause} order by int.int_dateintervention desc`;
    log.d('::list - récuperation via la requête.', { requete });

    (async () => {
        try {
            let result = await pgPool.query(requete)
            let interventions = result.rows.map(formatIntervention);

            for (const [key, intervention] of Object.entries(interventions)) {
                await Promise.all([getUtilisateursFromIntervention(intervention.id)]).then(values => {
                    interventions[key].utilisateur = values[0];
                    //log.d(interventions[key])
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
    console.log(intervention)
    let { strId, nbEnfants, piscine, dateIntervention,
        utilisateur } = intervention

    //insert dans la table intervention
    const requete = `UPDATE intervention 
        SET str_id= $1,
        int_nombreenfant= $2,
        pis_id = $3,
        int_dateintervention = $4,
        int_datemaj = now()
        WHERE int_id = ${id}
        RETURNING *
        ;`

    log.d('::update - requete', { requete })
    pgPool.query(requete, [strId,
        nbEnfants,
        piscine.id,
        dateIntervention
    ], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de la sauvegarde', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            log.i('::update - Done')
            // generation du pdf (synchrone)

            console.log(result.rows.map(formatIntervention)[0])
            //return res.status(200).json({ intervention: result.rows.map(formatIntervention)[0] });
            const params = {
                id: id,
                user: user
            }
            let inter = getIntervention(params)
            return res.status(200).json({ intervention: inter });

        }
    })
})

router.post('/', async function (req, res) {
    log.i('::post - In')
    const intervention = req.body.intervention


    //insert dans la table intervention
    const requete = `insert into intervention 
                    (pis_id,str_id,int_nombreenfant,int_dateintervention,int_datecreation,int_datemaj) 
                    values($1,$2,$3,$4,$5,$6 ) RETURNING int_id AS int_id`;


    log.d('::post - requete', { requete });


    await pgPool.query(requete, [intervention.piscine.id,
    intervention.strId,
    intervention.nbEnfants,
    intervention.dateIntervention,
    new Date().toISOString(),
    new Date().toISOString()], (err, result) => {
        if (err) {
            log.w('::post - erreur lors de l\'insertion dans la table des interventions', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de l\'intervention');
        }
        else {
            intervention.utilisateur.forEach(us => {
                const insert = `insert into uti_int(uti_id,int_id) values ($1,${result.rows[0].int_id})`
                //console.log('REQ:'+insert+ 'US : '+us.id)
                pgPool.query(insert, [us.id])
                console.log('fin insertion users')
                return result.rows[0].int_id
            })
            const user = req.session.user
            const params = {
                id: result.rows[0].int_id,
                user: user
            }
            let inter = getIntervention(params)
            res.status(200).json({ intervention: inter })
        }
    })
})

/*const select = `SELECT int.*,pis.*, str.str_libellecourt from intervention int \
LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
LEFT JOIN structure str on str.str_id = int.str_id \
LEFT JOIN uti_int ui on ui.int_id = int.int_id \
LEFT JOIN utilisateur uti on ui.uti_id = uti.uti_id \
where int.int_id=${result.rows[0].int_id} order by int_id asc`;
log.d('::get - récuperation intervention pour formattage via la requête.', { select });

(async () => {
    try {
        let resultat = await pgPool.query(select)
        let intervention = resultat.rows.map(formatIntervention);
        for (const [key, int] of Object.entries(intervention)) {
            log.i('::get2 - In' + key)
            let secondeRequete = `SELECT uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom,uti.uti_mail AS mail
     from utilisateur uti \
    LEFT JOIN uti_int ui on uti.uti_id = ui.uti_id \
    LEFT JOIN intervention int on int.int_id = ui.int_id \
    WHERE int.int_id = ${int.id}`

            let result2 = await pgPool.query(secondeRequete)
            log.i('::get2 - Done')
            intervention[key].utilisateur = result2.rows;
        }
        res.status(200).json({ intervention: intervention[0] });
    }
    catch (err) {
        throw err
    }
})().catch(err => {
    log.w('::get - Erreur survenue lors de la récupération', err.stack)
    return res.status(400).json('erreur lors de la récupération de l\'intervention ' + id)
}
)*/

module.exports = router;
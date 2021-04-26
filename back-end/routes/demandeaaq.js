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


const formatDemandeAAQ = demandeaaq => {
    var result = {
        id: demandeaaq.dem_id,
        formateurid: demandeaaq.dem_uti_formateur_id,
        demandeurid: demandeaaq.dem_uti_demandeur_id,
        tockendemandeaccord: demandeaaq.dem_tockendemandeaccord,
        tockendemanderefus: demandeaaq.dem_tockendemanderefus,
        datedemande: demandeaaq.dem_datedemande,
        daterelance: demandeaaq.dem_daterelance,
        nbrelance: demandeaaq.dem_nbrelance,
        dateaccord: demandeaaq.dem_dateaccord,
        daterefus: demandeaaq.dem_daterefus,
        motifrefus: demandeaaq.dem_motifrefus,
        dmsid: demandeaaq.dem_dms_id
    }
    return result
}

const formatreversDemandeAAQ = demandeaaq => {
    var result = {
        dem_id: demandeaaq.id,
        dem_uti_formateur_id : demandeaaq.formateurid,
        dem_uti_demandeur_id : demandeaaq.demandeurid,
        dem_tockendemandeaccord : demandeaaq.tockendemandeaccord,
        dem_tockendemanderefus : demandeaaq.tockendemanderefus,
        dem_datedemande : demandeaaq.datedemande,
        dem_daterelance : demandeaaq.daterelance,
        dem_nbrelance : demandeaaq.nbrelance,
        dem_dateaccord : demandeaaq.dateaccord,
        dem_daterefus : demandeaaq.daterefus,
        dem_motifrefus : demandeaaq.motifrefus,
        dem_dms_id : demandeaaq.dmsid
    }
    return result
}


router.get('/', function (req, res) {

        // On bloque si on a pas un des deux paramètres
        if (!req.query.formateurid && !req.query.demandeurid) {
            return res.sendStatus(400);
        }

        var whereClause = null 
        var id = null
        if (req.query.demandeurid) {
            id = req.query.demandeurid
            whereClause = 'dem_uti_demandeur_id='
        }
        if (req.query.formateurid) {
            id = req.query.formateurid
            whereClause = 'dem_uti_formateur_id='
        }
        //,  to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, uti.uti_nom formateurNom \
        //
        const requete = `select dem.*,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq,uti.uti_nom, uti.uti_prenom, uti.uti_mail \ 
        from demande_aaq dem \
        inner join utilisateur as uti on uti.uti_id = dem.dem_uti_formateur_id \
        where ${whereClause}${id}`

        log.d(requete)
        // Recherche des communes correspondant au codepostal
        pgPool.query(requete,(err, result) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'erreur sur la requete de recherche demande aaq' });
            }
            else {
                const demandeaaq = result.rows && result.rows[0];
                return res.status(200).json({ demandeaaq });
            }
        });
        
    });

router.post('/', function (req, res) {
    const { demandeurId, formateurId } = req.body

   // gérération des tocken de refus et d'accord pour l'envoie par mail.
    var tockendemanderefus = null
    var tockendemandeaccord = null
    const now = new Date()
    const datecreation = now.getFullYear() + "-" + eval(now.getMonth() + 1) + "-" + now.getDate()
    log.d("tockendemanderefus:"+tockendemanderefus)
    log.d("tockendemandeaccord:"+tockendemandeaccord)
    const requete = `INSERT INTO demande_aaq (dem_uti_demandeur_id,dem_uti_formateur_id,dem_tockendemandeaccord,dem_tockendemanderefus,dem_datedemande,dem_dms_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    log.d('::post - requete', { requete });
    pgPool.query(requete, [demandeurId, formateurId, tockendemandeaccord, tockendemanderefus, datecreation, 1 ], 
        (err, result) => {  
            if (err) {
                log.w('::post - Erreur lors de la requête.', err.stack);
                return res.status(400).json('erreur lors de la sauvegarde de la la demande au formateur');
            }
            else {
                log.d("result.rows : " + result.rows)
                log.i('::post - Done', result);
                const demandeclient = formatreversDemandeAAQ( result.rows[0])
                return res.status(200).json({ maDemande: demandeclient });
            }
        })
});

router.post('/delete/', async function (req, res) {
    const maDemande = req.body.demandeaaq
    const requete = `DELETE FROM  demandeaaq 
            WHERE dem_id = $1 
            RETURNING *
            ;`;

    pgPool.query(requete, [maDemande.dem_id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression de la demande.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la suppression de la demande AAQ ' + id);
        }
        else {
            log.i('::delete - Done')
            // Suppression effectuée avec succès
            return res.status(200).json(result.rows[0]);

        }
    })
})



router.put('/accord/:id', async function (req, res) {
    const maDemande = req.body.demandeaaq

    const id = req.params.id
    log.i('::update - In', { id })

    
    let { dmsid} = demandeaaq

    // Mise à jour de l'intervention en accord par le formateur
    const requete = `UPDATE demande_aaq 
        SET dem_tockendemandeaccord = null,
        dem_tockendemanderefus = null,
        dem_motifrefus = null,
        dem_daterefus = now(),
        dem_dateaccord = now(),
        dmsid = 2
        WHERE dem_id = ${id}
        RETURNING *
        ;`

    log.d('::update - requete', { requete })
    pgPool.query(requete, [id], (err, result) => {
            if (err) {
                log.w('::update - erreur lors de la sauvegarde accord demande_aqq', { requete, erreur: err.stack })
                return res.status(400).json('erreur lors de la sauvegarde de  accord demande_aqq');
            }
            else {
                log.i('::update - Done')
                return res.status(200).json({ demandeaaq: formatDemandeAAQ(result.rows[0]) });
            }
        })
})


router.put('/refus/:id', async function (req, res) {
    const maDemande = req.body.demandeaaq

    const id = req.params.id
    log.i('::update - In', { id })

    
    let {motifrefus,dmsid} = demandeaaq

    //Mise à jour de la demande en refusée
    const requete = `UPDATE demande_aaq 
        SET dem_tockendemandeaccord = null,
        dem_tockendemanderefus = null,
        dem_dateaccord = null,
        dem_motifrefus = ${maDemande.motifrefus},
        dem_daterefus = now(),
        dmsid = 3
        WHERE dem_id = ${id}
        RETURNING *
        ;`

    log.d('::update - requete', { requete })
    pgPool.query(requete, [id], (err, result) => {
            if (err) {
                log.w('::update - erreur lors de la sauvegarde accord demande_aqq', { requete, erreur: err.stack })
                return res.status(400).json('erreur lors de la sauvegarde de  accord demande_aqq');
            }
            else {
                log.i('::update - Done')
                return res.status(200).json({ demandeaaq: formatDemandeAAQ(result.rows[0]) });
            }
        })
})


router.get('/accord/:tockenaccord/demande/:id', async function(req, res) {
    const id = req.params.id
    const tockenaccord = req.params.tockenaccord
    
    log.i('::enable-mail - In', { id })
    if(!id) {
        return res.status(400).json('Aucun ID fournit pour  identifier l\'utilisateur.');
    }

    const userQuery = await pgPool.query(`SELECT * FROM utilisateur WHERE uti_id='${id}'`).catch(err => {
        log.w(err)
        throw err
    })
    const user= userQuery.rowCount === 1 && userQuery.rows[0]

    if(!user) {
        return res.status(404).json({message: "L'utilisateur n'existe pas."});        
    }

    log.d('::enable-mail - user found', { user })
    if(user.uti_pwd === pwd && !user.pwd_validated) {
        const requete = `UPDATE utilisateur 
            SET pwd_validated = $1
            WHERE uti_id = $2
            RETURNING *
            ;`    
        pgPool.query(requete,[true, id], (err, result) => {
            if (err) {
                log.w('::enable-mail - erreur lors de l\'update', {requete, erreur: err.stack});
                return res.status(400).json('erreur lors de la sauvegarde de l\'utilisateur');
            }
            else {
                log.i('::enable-mail - Done, pwd has been validated.')
                req.session.user = result.rows[0]
                req.accessToken = result.rows[0].uti_pwd;
                req.session.accessToken = result.rows[0].uti_pwd;
                return res.status(200).json({ user: formatUtilisateur(result.rows[0])});
            }
        })
    } else {
        log.w('::enable-mail - erreur concernant le user à valider.')
        return res.status(400).json('L\'utilisateur a déjà validé son mot de passe ou le mot de passe fournit est incorrecte.');
    }    
})


module.exports = router;
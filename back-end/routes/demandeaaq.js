const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const config =  require( '../config')
const { sendEmail } = require('../utils/mail-service')
const { formatDemandeAAQ } = require('../utils/utils')

const logger = require('../utils/logger');
const log = logger(module.filename)

router.get('/', function (req, res) {
    const { formateurid, demandeurid } = req.query
    log.i('::list - In', { formateurid, demandeurid })    
    if (!formateurid && !demandeurid) {
        log.w('::list - ID manquant')    
        return res.sendStatus(400).json({ message: 'L\'identifiant du formateur et du demandeur sont manquants.' })
    }

    let whereClause = null 
    let id = null
    if (demandeurid) {
        id = demandeurid
        whereClause = 'dem_uti_demandeur_id='
    }
    if (formateurid) {
        id = formateurid
        whereClause = 'dem_uti_formateur_id='
    }
    const requete = `SELECT dem.*,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq,uti.uti_nom, uti.uti_prenom, uti.uti_mail \ 
    FROM demande_aaq dem \
    INNER JOIN utilisateur AS uti ON uti.uti_id = dem.dem_uti_formateur_id \
    where ${whereClause}${id}`

    log.i('::list - requête', { requete })    
    pgPool.query(requete,(err, result) => {
        if (err) {
            log.w('::list - error', err)
            return res.status(400).json({ message: 'erreur sur la requete de recherche demande aaq' });
        }
        else {
            log.i('::list - Done')    
            const demandesAaq = result.rows;
            return res.status(200).json({ demandesAaq });
        }
    });
        
})

router.post('/', function (req, res) {
    const { demandeurId, formateurId, structurerefid } = req.body

   // gérération des tocken de refus et d'accord pour l'envoie par mail.
    let tockenDemandeRefus = null
    let tockenDemandeAccord = null
    const now = new Date()
    const datecreation = now.getFullYear() + "-" + eval(now.getMonth() + 1) + "-" + now.getDate()
    const requete = `INSERT INTO demande_aaq (dem_uti_demandeur_id,dem_uti_formateur_id,dem_sre_id,dem_tockendemandeaccord,dem_tockendemanderefus,dem_datedemande,dem_dms_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    log.d('::post - requete', { requete });
    pgPool.query(requete, [demandeurId, formateurId, structurerefid, tockendemandeaccord, tockendemanderefus, datecreation, 1 ], 
        (err, result) => {  
            if (err) {
                log.w('::post - Erreur lors de la requête.', err.stack);
                return res.status(400).json('erreur lors de la sauvegarde de la la demande au formateur');
            }
            else {
                log.d("result.rows : " + result.rows)
                log.i('::post - Done', result);
                const demandeclient =  formatDemandeAAQ( result.rows[0])
                var nomInstructeur
                var courrielInstructeur
                if (formateurId) {
                    const requete = `select uti_mail,uti_prenom from utilisateur where uti_id = ${formateurId}`

                    log.d(requete)
                    // Recherche de l'instructuer demandé pour la demande aaq
                    pgPool.query(requete,(err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({ message: 'erreur sur la requete de recherche du mail du formateur' });
                        }
                        else 
                        {
                            const formateuraaq = result.rows && result.rows[0];
                            courrielInstructeur = formateuraaq.uti_mail
                            nomInstructeur = " "+formateuraaq.uti_prenom;
                        }
                    })
                }
                if (structurerefid) {
                    const requete = `select sre_courriel from structure_ref where sre_id = ${structurerefid}`
                    log.d(requete)
                    // Recherche de la structure de référence demandé pour la demande aaq
                    pgPool.query(requete,(err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({ message: 'erreur sur la requete de recherche du mail du formateur' });
                        }
                        else 
                        {
                            const structurerefaaq = result.rows && result.rows[0];
                            courrielInstructeur = structurerefaaq.sre_courriel
                            nomInstructeur = ""
                        }
                    })
                }
                sendEmail({
                    to: courrielInstructeur,
                    subject: 'Demande de compte Aisance Aquatique',
                    body: `<p>Bonjour${nomInstructeur},</p>
                        <p>Vous avez une nouvelle demande pour changer le profil d'un utilisateur. <br/><br/>
                        Nous vous invitons à vous rendre sur le site « Aisance Aquatique » pour changer le profil du demandeur.<br/>
                        Rappel du site <a href="${config.franceConnect.FS_URL}">SI Aisance Aquatique.<br/></p>`
                    })
                    
                return res.status(200).json({ maDemande: demandeclient });
            }
        })
})

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

router.put('/accord', async (req,res) => {
    const demandeaaq = req.body && req.body.demandeaaq
    const demandeid = demandeaaq && demandeaaq.dem_id
    const formateurid = demandeaaq && demandeaaq.dem_uti_formateur_id
    log.i('::accords - In', {demandeaaq , formateurid})
    const bddUpdate =  await pgPool.query("UPDATE demande_aaq SET dem_dateaccord = now(), dem_uti_formateur_id = $1, dem_dms_id = 2 \
    WHERE dem_id = $2 RETURNING *", 
    [formateurid, demandeid]).catch(err => {
        log.w('::accords - Erreur pendant l\'update des infos du demandeaaq', err)
        throw err
    })
    const updatedDemandeaaq = bddUpdate.rows && bddUpdate.rows[0]
    log.i('::confirm-profil-infos - Done, renvois du user mis à jour', updatedDemandeaaq)
    return res.send(updatedDemandeaaq)
})

router.put('/refus/:id', async function (req, res) {
    const maDemande = req.body.demandeaaq
    const id = req.params.id
    log.i('::update pour refus - In', { id })    

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
                log.w('::update pour refus - erreur lors de la sauvegarde accord demande_aqq', { requete, erreur: err.stack })
                return res.status(400).json('erreur lors de la sauvegarde de  accord demande_aqq');
            }
            else {
                log.i('::update pour refus - Done')
                return res.status(200).json({ demandeaaq: formatDemandeAAQ(result.rows[0]) });
            }
        })
})

router.get('/accord/:tockenaccord/demande/:id', async function(req, res) {
    const id = req.params.id
    log.i('::enable-mail with tockenaccord - In', { id })
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

    log.d('::enable-mail with tockenaccord - user found', { user })
    const requete = `UPDATE utilisateur 
        SET pwd_validated = $1
        WHERE uti_id = $2
        RETURNING *
        ;`    
    return pgPool.query(requete,[true, id], (err, result) => {
        if (err) {
            log.w('::enable-mail with tockenaccord - erreur lors de l\'update', {requete, erreur: err.stack});
            return res.status(400).json('erreur lors de la sauvegarde de l\'utilisateur');
        }
        else {
            log.i('::enable-mail with tockenaccord - Done, pwd has been validated.')
            req.session.user = result.rows[0]
            req.accessToken = result.rows[0].uti_pwd;
            req.session.accessToken = result.rows[0].uti_pwd;
            return res.status(200).json({ user: formatUtilisateur(result.rows[0])});
        }
    })
})

module.exports = router;
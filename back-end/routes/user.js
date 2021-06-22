const express = require('express');
const router = express.Router();
const stringify = require('csv-stringify')
const pgPool = require('../pgpool').getPool();
var moment = require('moment');
moment().format();

const logger = require('../utils/logger')
const log = logger(module.filename)

const formatUser = user => {

    return {
        id: user.uti_id,
        role: user.rol_id,
        statut: user.stu_id,
        validated: user.uti_validated,
        mail: user.uti_mail,
        nom: user.uti_nom,
        prenom: user.uti_prenom,
        eaps: user.uti_eaps,
        rolLibelle:user.rol_libelle,
        inscription: user.inscription,
        publicontact: user.uti_publicontact,
        mailcontact: user.uti_mailcontact,            
        sitewebcontact: user.uti_sitewebcontact,
        adrcontact: user.uti_adrcontact,
        compadrcontact: user.uti_compadrcontact,
        cpi_codeinsee: user.uti_com_codeinseecontact,
        cp: user.uti_com_cp_contact,
        telephonecontact: user.uti_telephonecontact,
        datedemandeaaq: user.datedemandeaaq,
        structurerefid: user.structurerefid
    }
}


const formatUserCSV = user => {

    return {
        id: user.uti_id,
        role: user.rol_id,
        statut: user.stu_id,
        validated: user.uti_validated,
        mail: user.uti_mail,
        nom: user.uti_nom,
        prenom: user.uti_prenom,
        rolLibelle:user.rol_libelle,
        inscription: user.inscription,
        publicontact: user.uti_publicontact,
        mailcontact: user.uti_mailcontact,            
        sitewebcontact: user.uti_sitewebcontact,
        adrcontact: user.uti_adrcontact,
        compadrcontact: user.uti_compadrcontact,
        cpi_codeinsee: user.uti_com_codeinseecontact,
        cp: user.uti_com_cp_contact,
        telephonecontact: user.uti_telephonecontact,
        structurerefid: user.sre_id
    }
}



// Récupération de la liste des formateurs filtré par rôle
// Essenciellement utilisé pour lister la liste des formateurs
router.get('/liste/:roleid', async function (req, res) {
    log.i('::list-roleid - In')
    var roleid = req.params.roleid
    const utilisateurCourant = req.session.user;
    log.d("RoleId : "+roleid)
    log.d("RoleId utilisateur courant : "+utilisateurCourant.rol_id)
    //log.d('::list-roleid - roleid : ',{ req.roleid})

    if (utilisateurCourant.rol_id == 1 || utilisateurCourant.rol_id == 5) {
        // si on est admin, on affiche tous les utilisateurs
        requete = `SELECT uti.*
        from utilisateur uti 
        where rol_id = ${roleid}
        order by uti_nom, uti_prenom asc`;
    }
    else if (utilisateurCourant.rol_id == 6) {
        // On est utilisateur de structure de référence alors on renvoie tous les utilisateurs de la structure de référence
        // Pour le rol_id = 3 cela correspond à tous les instructeurs de la structure
        requete = `SELECT uti.*
        from utilisateur uti 
        inner join uti_sre uts on uts.uti_id = uti.uti_id and uts.uts_actif = true
            and uts.sre_id in (select utisre.sre_id from uti_sre utisre where utisre.uti_id = ${utilisateurCourant.uti_id}) 
        where uti.rol_id = ${roleid}
        order by uti_nom, uti_prenom asc`;
    }

    log.d('::list-roleid - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list-roleid - erreur lors de la récupération.',err.stack);
            return res.status(400).json('erreur lors de la récupération des utilisateurs par role');
        }
        else {
            log.i('::list-roleid - Done')
            const users = result.rows.map(formatUser);
            res.json({ users });
        }
    })
});

/* route d'extraction de la liste d'utilisateurs pour le CSV */
/* Pas d'argument, on utilise la structure de l'utilisateur en session */
router.get('/csv', async function (req, res) {
    log.i('::csv - In')
    const utilisateurCourant = req.session.user;
    var requete = "";

    log.d('::csv - Profil de l\'utilisateur : ' + req.session.user.rol_id);
    // Je suis utilisateur "Administrateur" ==> Export de la liste des tous les utilisateurs
    if ( utilisateurCourant.rol_id == 1 ) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti_nom As Nom,  rol_libelle as Role, lower(uti_mail) as Courriel,  
        replace(replace(uti_validated::text,'true','Validée'),'false','Non validée') as inscription, replace(replace(uti_publicontact::text,'true','Oui'),'false','Non') AutorisePublicationContact, 
        lower(uti_mailcontact) MailContact, uti_sitewebcontact SiteInternetContact, uti_telephonecontact TelephoneContact, uti_adrcontact AdresseContact,
        uti_compadrcontact ComplementAdresseContact, uti_com_cp_contact CodePostalContact, uti_com_codeinseecontact CodeInseeContact, com_art ArtCommune, com_libelle LibelleCommune, dep_num Departement

        from utilisateur  uti
        join profil rol on rol.rol_id = uti.rol_id 
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    } 

    if ( utilisateurCourant.rol_id == 3) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti_nom As Nom,  rol_libelle as Role, lower(uti_mail) as Courriel,  
        to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq
        from utilisateur  uti
        inner join profil rol on rol.rol_id = uti.rol_id 
        inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and dem.dem_uti_demandeur_id = uti.uti_id
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    }     
    // Je suis utilisateur "Instructeur" ==> Export de la liste des maitres nageurs qui m'ont fait la demande
    if ( utilisateurCourant.rol_id == 6) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti_nom As Nom,  rol_libelle as Role, lower(uti_mail) as Courriel,  
        to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq
        from utilisateur  uti
        inner join profil rol on rol.rol_id = uti.rol_id 
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
                                and dem.dem_sre_id in (select utisre.sre_id from uti_sre where uti_id = ${utilisateurCourant.uti_id}) 
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    } 
    /*
    else
    // TODO : Refaire l'export pour les autre profils
    {
        requete =`SELECT uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti_nom As Nom,  rol_libelle as Role, lower(uti_mail) as Courriel, 
        replace(replace(uti_validated::text,'true','Validée'),'false','Non validée') as inscription , stu.stu_libelle Statut_Utilisateur,
        str.str_libellecourt As Structure, uti.uti_structurelocale As Struture_Locale
        from utilisateur  uti
        join profil rol on rol.rol_id = uti.rol_id and rol.rol_id <> 1
        join statut_utilisateur  stu on stu.stu_id = uti.stu_id
        where uti.str_id=${utilisateurCourant.str_id} order by 3,4 asc`;
    }
*/
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csv - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json('erreur lors de la récupération des utilisateurs');
        }
        else {
            const users = result.rows;//.map(formatUser);
            if (!users || !users.length) {
                log.w('::csv - Utilisateurs inexistants.')
                return res.status(400).json({ message: 'Utilisateurs inexistants' });
            }
            stringify(users, {
                quoted: '"',
                header: true
            }, (err, csvContent) => {
                if(err){
                    log.w('::csv - erreur',err)
                    return res.status(500)
                } else {
                    log.i('::csv - Done')
                    return res.send(csvContent)
                }
            })            
            //res.json({ users });
        }
    })
});

router.get('/encadrant', async function (req, res) {
    log.i('::encadrant - In')
    const utilisateurCourant = req.session.user;

    const requete =`SELECT uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom,uti.uti_mail AS mail,
        uti.uti_validated, stu.stu_libelle
        from utilisateur uti
        join statut_utilisateur stu on stu.stu_id = uti.stu_id
        where stu.stu_id = 1 
        AND uti.uti_validated = true 
        AND uti.rol_id in (3,4)
        order by 3,4 asc`;
    
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::encadrant - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json('erreur lors de la récupération des encadrants');
        }
        else {
            const encadrants = result.rows;
            log.i('::encadrant - Done')
            res.json({ encadrants });
        }
    })
});

router.get('/:id', async function (req, res) {
    const id = req.params.id;
    log.i('::get - In', { id })
    const utilisateurCourant = req.session.user
    if ( utilisateurCourant.rol_id == 1 || utilisateurCourant.rol_id == 3) {
        // si on est admin, on affiche l'utilisateur
        requete = `SELECT uti.*,uti_sre.sre_id structurerefid,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription, rol.rol_libelle from utilisateur uti 
        join profil rol on rol.rol_id = uti.rol_id
        left join uti_sre on uti_sre.uti_id = uti.uti_id and uti_sre.uts_actif = true
        where uti.uti_id=${id} order by uti.uti_id asc`;

    log.d('::get - select un USER, requête = '+requete)
    pgPool.query(requete, (err, result) => {
        if (err) { 
            log.w('::get - Erreur lors de la requête', err.stack)
            return res.status(400).json('erreur lors de la récupération de l\'utilisateur');
        }
        else {
            const user = result.rows && result.rows.length && result.rows[0];
            if (!user) {
                log.w('::get - Utilisateur inexistant')
                return res.status(400).json({ message: 'Utilisateur inexistant' });
            }
            log.d('::get - Done')
            res.json({ user: formatUser(user) });
        }
    })

}});

router.get('/', async function (req, res) {
    log.i('::list - In')
    const utilisateurCourant = req.session.user
    //const utilisateurId = 1; // TODO à récupérer via GET ?
    if ( utilisateurCourant.rol_id == 1) {
        // si on est admin, on affiche tous les utilisateurs
        requete = `SELECT uti.*, pro.rol_libelle,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription
        from utilisateur uti 
        left join uti_str ust on ust.uti_id = uti.uti_id
        left join structure str on str.str_id = ust.str_id 
        join profil pro on pro.rol_id = uti.rol_id
        order by uti_id asc`;
    }
    // Je suis utilisateur "gestionnaire de struture de référence" ==> on affiche les demandes de ma structure
    else if ( utilisateurCourant.rol_id == 6) 
    {
            requete =`SELECT  uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq
            from utilisateur  uti
            inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
                                    and dem.dem_sre_id in (select utisre.sre_id from uti_sre utisre where utisre.uti_id = ${utilisateurCourant.uti_id}) 
            inner join profil pro on pro.rol_id = uti.rol_id
                                    order by 3,4 asc`;

    } 
    else
    {
            // si on est formateur, on affiche seulements les utilisateurs qui on une demande en cours
            // Sauf les Admin créés sur structure
            requete = `SELECT uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq
            from utilisateur uti 
            inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and uti.uti_id = dem_uti_demandeur_id
            join profil pro on pro.rol_id = uti.rol_id
            order by uti_id asc`;
    }
    log.d('::list - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list - erreur lors de la récupération.',err.stack);
            return res.status(400).json('erreur lors de la récupération des utilisateurs');
        }
        else {
            log.i('::list - Done')
            const users = result.rows.map(formatUser);
            res.json({ users });
        }
    })
});

router.put('/:id', async function (req, res) {
    const user = req.body.utilisateurSelectionne
    const id = req.params.id
    log.i('::update - In', { id })
    let { nom, prenom, mail, role, validated, statut,eaps,publicontact,mailcontact,sitewebcontact,adrcontact,compadrcontact,cpi_codeinsee,cp,telephonecontact,structurerefid } = user




    if (role==3) {

        const requeteStructure = `SELECT sre_id, uts_actif FROM uti_sre WHERE uti_id = ${id} and sre_id = ${structurerefid}`
        log.d(requeteStructure)
        const userQuery = await pgPool.query(requeteStructure).catch(err => {
            log.w(err)
            throw err
        })
        if(userQuery.rowCount == 0) {
            const requeteCreUtiStr = `INSERT INTO uti_sre (uti_id,sre_id,uts_actif) VALUES (${id}, ${structurerefid}, true) RETURNING *`

            // Aucune structure ne correspond à celle demandée
            log.d('Aucune structure correspondante pour cet utilisateur on créé le lien.')
            log.d(requeteCreUtiStr)
            const { rows } =  pgPool.query(requeteCreUtiStr).catch(err => {
                console.log(err)
                throw err
              })

        }

        // On passe à inactif toutes les structures autres que celle sélectionnée
        // On passe à actif la structure sélectionnée
        const requeteMajUtiStr = `UPDATE uti_sre SET uts_actif = (sre_id=${structurerefid}) WHERE uti_id = ${id} RETURNING *`
        // Aucune structure ne correspond à celle demandée
        log.d(requeteMajUtiStr)

        const { rows } = await pgPool.query(requeteMajUtiStr).catch(err => {
            console.log(err)
            throw err
        })
       
    }





    // Mise à jour de l'utilisateur
    const requete = `UPDATE utilisateur 
    SET uti_nom = $1,
    uti_prenom = $2,
    uti_mail = lower($3),
    uti_validated = $4,
    rol_id = $5,
    stu_id = $6,
    uti_eaps= $7,
    uti_publicontact = $8,
    uti_mailcontact = $9,
    uti_sitewebcontact = $10,
    uti_adrcontact = $11,
    uti_compadrcontact = $12,
    uti_com_codeinseecontact = $13,
    uti_com_cp_contact = $14,
    uti_telephonecontact = $15
    WHERE uti_id = ${id}
    RETURNING *
    ;`
    pgPool.query(requete,[nom,
        prenom,
        mail,
        validated,
        role,
        statut,
        eaps,
        publicontact,
        mailcontact,
        sitewebcontact,
        adrcontact,
        compadrcontact,
        cpi_codeinsee,
        cp,
        telephonecontact], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de l\'update', {requete, erreur: err.stack});
            return res.status(400).json('erreur lors de la sauvegarde de l\'utilisateur');
        }
        else {
            log.i('::update - Done')
            // Si c'est un rôle Instructeur qui est mise à jour alors
            // On vérifie si c'est la même structure de référence
            // Si c'est la Même : RAS
            // Si elle est différente alors, il faut la remplacer.
            

            return res.status(200).json({ user: formatUser(result.rows[0])});
        }
    })
})

module.exports = router;
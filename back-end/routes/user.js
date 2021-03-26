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
        datedemandeaaq: user.datedemandeaaq
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
        telephonecontact: user.uti_telephonecontact 
    }
}



// Récupération de la liste des formateurs filtré par rôle
// Essenciellement utilisé pour lister la liste des formateurs
router.get('/liste/:roleid', async function (req, res) {
    log.i('::list-roleid - In')
    var roleid = req.params.roleid
    //log.d('::list-roleid - roleid : ',{ req.roleid})

    // si on est admin, on affiche tous les utilisateurs
    requete = `SELECT uti.*
    from utilisateur uti 
    where rol_id = ${roleid}
    order by uti_nom, uti_prenom asc`;

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
    // Je suis utilisateur "Formateur" ==> Export de la liste des maitres nageurs qui m'ont fait la demande
    if ( utilisateurCourant.rol_id == 3 ) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti_nom As Nom,  rol_libelle as Role, lower(uti_mail) as Courriel,  
        to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq

        from utilisateur  uti
        inner join profil rol on rol.rol_id = uti.rol_id 
        inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and dem.dem_uti_demandeur_id = uti.uti_id
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    } 
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
    if ( utilisateurCourant.rol_id == 1) {
        // si on est admin, on affiche l'utilisateur
        requete = `SELECT uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription, rol.rol_libelle from utilisateur uti 
        join profil pro on pro.rol_id = uti.rol_id
        where uti_id=${id} order by uti_id asc`;

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
    
    if ( utilisateurCourant.rol_id == 1) {
        // si on est admin, on affiche tous les utilisateurs
        requete = `SELECT uti.*, pro.rol_libelle,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription
        from utilisateur uti 
        left join uti_str ust on ust.uti_id = uti.uti_id
        left join structure str on str.str_id = ust.str_id 
        join profil pro on pro.rol_id = uti.rol_id
        order by uti_id asc`;
    }
    else 
    {
        // si on est formateur, on affiche seulements les utilisateurs qui on une demande en cours
        // Sauf les Admin créés sur structure
        requete = `SELECT uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq
        from utilisateur uti 
        join uti_str ust on ust.uti_id = uti.uti_id
        join structure str on str.str_id = ust.str_id 
        join profil pro on pro.rol_id = uti.rol_id and pro.rol_id <> 1
        where uti.str_id=${utilisateurCourant.str_id} order by uti_id asc  `;
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
    let { nom, prenom, mail, role, validated,structure, structureLocale, statut } = user

    //insert dans la table utilisateur
    const requete = `UPDATE utilisateur 
    SET uti_nom = $1,
    uti_prenom = $2,
    uti_mail = lower($3),
    uti_validated = $4,
    rol_id = $5,
    stu_id = $6
    WHERE uti_id = ${id}
    RETURNING *
    ;`
    /*
    const requete = `UPDATE utilisateur 
        SET uti_nom = $1,
        uti_prenom = $2,
        uti_mail = lower($3),
        uti_validated = $4,
        rol_id = $5,
        str_id = $6,
        uti_structurelocale = $7,
        stu_id = $8
        WHERE uti_id = ${id}
        RETURNING *
        ;`    */
    pgPool.query(requete,[nom,
        prenom,
        mail,
        validated,
        role,
        statut], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de l\'update', {requete, erreur: err.stack});
            return res.status(400).json('erreur lors de la sauvegarde de l\'utilisateur');
        }
        else {
            log.i('::update - Done')
            return res.status(200).json({ user: formatUser(result.rows[0])});
        }
    })
})

module.exports = router;
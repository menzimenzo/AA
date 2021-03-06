const express = require('express');
const router = express.Router();
const config     = require('../config');

const pgPool = require('../pgpool').getPool();
const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/change', (req, res) => {
    log.i('::change - In')
    // Fonction permettant de changer les valeurs de la table des paramètre
    // A modifier ensuite faire un paramétrage au niveau Admin pour les utilisateurs sg.social.gouv.fr uniquement
    const v_code = req.query.code
    const v_valeur = req.query.valeur
    // Mise à jour du paramètre en passant http://localhost/backend/api/parametres/change?code='CONNEXION_STRUCTURE'&valeur='1'
    // Mise à jour du paramètre en passant http://localhost/backend/api/parametres/change?code='CONNEXION_FC'&valeur='1'

    const requete = `UPDATE parametres
    SET par_valeur = ${v_valeur}
    WHERE par_code=${v_code}`;

    return pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::change - Erreur survenue lors de la mise à jour.', { requete, err: err.stack })
            return res.status(400).json({message: 'erreur lors de la modification du paramètre ' + req.query.code});
        }
        else {
            log.i('::change - Done')
            // MAJ du paramètre
            return res.status(200).json({message: 'Paramètre modifié avec succès.'});
        }
    })    
});

// Route permettant de récupérer la valeur d'un paramètre dans la table paramètres
// exemple : http://localhost/backend/api/parametres?code=PROTO_APPLI
router.get('/', (req, res) => {
    log.i('::parametres - In')

    //var startTime = new Date();
    var requete = "";
    var parametre = req.query.code

    log.d('::parametres - du paramètre : ' + parametre);

    requete =`SELECT par_valeur 
        from parametres
        where par_code = '${parametre}'`;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::parametres - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json('erreur lors de la récupération du parametre ' + parametre);
        }
        else {
            const resultat = result.rows;
            log.d(resultat)
            if (!resultat || !resultat.length) {
                log.w('::parametre - Résultat vide.')
                return res.status(400).json('Le paramètre demandé n\'existe pas : ' + parametre)
            }
            else
            {
                return res.send(resultat[0]);
            }
        }
    })

    log.i('::parametres - Done')
});

module.exports = router;
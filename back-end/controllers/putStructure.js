const pgPool = require('../pgpool').getPool()
const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    log.i('::put - In')
    const structure = req[0]
    const id = req[1]

    let { str_libelle, str_libelle, str_actif, str_adresse, str_commune, str_type, str_soustype } = structure

    if (str_actif == '') { str_actif = false } else { str_actif = true }

    //insert dans la table intervention
    const requete = `UPDATE structure 
     SET str_libelle = $1,
     str_code = $2,
     str_actif = $3,
     str_adresse = $4,
     str_commune = $5,
     str_type = $6,
     str_soustype = $7
     WHERE str_id = ${id}
     RETURNING *
     ;`
    pgPool.query(requete, [str_libelle, str_code, str_actif, str_adresse, str_commune, str_type, str_soustype], (err, result) => {
        if (err) {
            log.w('::update - Erreur lors de la mise à jour', { requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la sauvegarde de la structure');
        }
        else {
            log.i('::update - Done')
            return result.rows[0];
        }
    })
}
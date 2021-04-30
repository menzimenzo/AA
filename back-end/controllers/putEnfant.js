const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = function (req, res) {
    log.i('::put - In')
    const enfant = req[0]
    const id = req[1]

    //insert dans la table intervention
    const requete = `update enfant set enf_prenom=$1 
        WHERE enf_id = $2
        RETURNING *
        ;`;

    pgPool.query(requete, [enfant.prenom, enfant.enf_id], (err, result) => {
        if (err) {
            log.w('::put - Erreur survenue lors de la mise à jour du prénom.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la mise à jour du prénom de l\'enfant' + enfant.enf_id);
        }
        else {
            log.i('::put - mise à jour table enfant - Done')
            const secondeRequete = `update int_enf set niv_ini=$1,niv_fin=$2 
            WHERE enf_id = $3 and int_id=$4
            RETURNING *
            ;`;
            pgPool.query(secondeRequete, [enfant.niv_ini, enfant.niv_fin, enfant.enf_id, id], (err, result) => {
                if (err) {
                    log.w('::put - Erreur survenue lors de la mise à jour du niveau de l\'enfant.', { requete, err: err.stack })
                    return res.status(400).json('erreur lors de la mise à jour du niveau de l\'enfant' + enfant.enf_id);
                }
                else {
                    log.i('::put - Done')
                }
            })
        }
    })
}

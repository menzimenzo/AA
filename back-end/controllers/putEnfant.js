const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports =  async function (req, res) {
    log.i('::put - In')
    const enfant = req[0]
    const id = req[1]

    //insert dans la table intervention
    const requete = `update enfant set enf_prenom=$1 
        WHERE enf_id = $2
        RETURNING *
        ;`;

    const updateEnf = await pgPool.query(requete, [enfant.prenom, enfant.enf_id]).catch(err=> {
            log.w('::put - Erreur survenue lors de la mise à jour du prénom.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la mise à jour du prénom de l\'enfant' + enfant.enf_id);
    })

        if (updateEnf) {
            log.i('::put - mise à jour table enfant - Done')
            const secondeRequete = `update int_enf set niv_ini=$1,niv_fin=$2 
            WHERE enf_id = $3 and int_id=$4
            RETURNING *
            ;`;
            const updateIntEnf = await pgPool.query(secondeRequete, [enfant.niv_ini, enfant.niv_fin, enfant.enf_id, id]).catch(err => {
                    log.w('::put - Erreur survenue lors de la mise à jour du niveau de l\'enfant.', { requete, err: err.stack })
                    return res.status(400).json('erreur lors de la mise à jour du niveau de l\'enfant' + enfant.enf_id);
            })
            if (updateIntEnf) {
                    log.i('::put - Done') 
                    console.log(updateIntEnf)
                }
        }
   
}

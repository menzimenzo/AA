const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports =  async function (req, res) {
    log.i('::get - In')
    const id = req[0]

    //insert dans la table intervention
    const requete = `select * from enfant WHERE enf_id = $1;`;

    const tutu = await pgPool.query(requete, [id]).catch(err=> {
            log.w('::put - Erreur survenue lors de la récupération de l\'enfant.', { requete, err: err.stack })
            return res.status(400).json('erreur lors de la récupération de l\'enfant' + enfant.enf_id);
    })

        if (tutu) {
            log.i('::get - récupération niveau - Done')
            const secondeRequete = `select niv_fin from int_enf  \
            WHERE enf_id = $1 ORDER BY int_id desc limit 1`;
            const toto = await pgPool.query(secondeRequete, [id]).catch(err => {
                    log.w('::put - Erreur survenue lors de la récupération du niveau de l\'enfant.', { requete, err: err.stack })
                    return res.status(400).json('erreur lors de la récupération du niveau de l\'enfant' + enfant.enf_id);
            })
            if (toto) {
                    log.i('::put - Done') 
                    const enfant = {
                        id: id,
                        prenom: tutu.rows[0].enf_prenom,
                        niv_ini : toto.rows[0].niv_fin,
                        niv_fin : toto.rows[0].niv_fin
                    }
                    return enfant
                       }

        }
   
}

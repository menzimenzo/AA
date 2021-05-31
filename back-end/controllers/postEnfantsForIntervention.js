const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const enfant= req[0]
    const id = req[1]

    log.i('::post - In')
    for (var i = 0; i < enfant.length ; i++) {
        const requete =  `insert into enfant(enf_prenom) values($1) RETURNING enf_id`
        const insertenf = await pgPool.query(requete,[enfant[i].prenom]).catch(err => {
            log.w('::POST - Erreur survenue lors de la l\'insertion dans la table enfant.', { requete, err: err.stack })
            return res.status(400).json('Erreur survenue lors de la l\'insertion dans la table enfant');
        })
        if (insertenf) {
            log.d('::post - insert Enfant '+insertenf.rows[0].enf_id + '- Done');
            const secondeRequete = `insert into int_enf(int_id,enf_id,niv_ini,niv_fin) values ($1,$2,$3,$4)`
            const insertintenf = await pgPool.query(secondeRequete,[id, insertenf.rows[0].enf_id,enfant[i].niv_ini,enfant[i].niv_fin]).catch(err => {
                log.w('::POST - Erreur survenue lors de la l\'insertion dans la table int_enf.', { secondeRequete, err: err.stack })
                return res.status(400).json('Erreur survenue lors de la l\'insertion dans la table int_enf');
            })
            if (insertintenf) {
                log.d('::post - insert Enfant - int N°' + id + ' enfant n°' + insertenf.rows[0].enf_id + ' Done');
            }

        }
    }
    log.i('::post - Done')
}

const pgPool = require('../pgpool').getPool()
const { use } = require('../routes/structures')
const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    log.i('::post - In')
    const structureId = req[0]
    const userId = req[1]

    console.log('user :'+userId)
    console.log('struId :'+structureId)
    const requete = `insert into uti_str 
                    (uti_id,str_id) 
                    values($1,$2) RETURNING *`;

    //console.log({ requete });
    pgPool.query(requete, [userId, structureId], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la création du lien user - structure.', { requete, erreur: err.stack })
            return result.status(400).json('erreur lors de la création du lien user - structure');
        }
        else {
            log.i('::post - Done')
            return result.status(200).json({ structure: (result.rows[0]) });
        }
    })
}
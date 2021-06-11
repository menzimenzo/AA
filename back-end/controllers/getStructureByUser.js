const pgPool = require('../pgpool').getPool()
const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    log.i('::getByUser - In')
    const userId = req[0]
    
    const requete = `SELECT * from Structure stru 
                    join UTI_STR ust on ust.str_id = stru.str_id
                    where ust.uti_id=${userId}`;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { userId, requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la récupération des structures du user');
        }
        else {
            const structures = result.rows;
            if (!structures) {
                log.w('::get - aucune structure')
                return [];
            }
            log.i('::get - Done')
            return structures;
        }
    })
}
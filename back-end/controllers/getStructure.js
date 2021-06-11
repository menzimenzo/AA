const pgPool = require('../pgpool').getPool()
const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    log.i('::get - In')
    const id = req[0]
    
    const requete = `SELECT * from Structure where str_id=${id}`;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { userId, requete, erreur: err.stack })
            return res.status(400).json('erreur lors de la récupération de la structure');
        }
        else {
            const structures = result.rows;
            if (!structures) {
                log.w('::get - Structure inexistante')
                return [];
            }
            log.i('::get - Done')
            return structures;
        }
    })
}
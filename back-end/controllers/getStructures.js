const pgPool = require('../pgpool').getPool()
const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    log.i('::get - In')

    // La méthode get est appelée sans paramètre : On retourne la liste
    pgPool.query(
        `SELECT *, replace(replace(str_actif::text,'true','Oui'),'false','Non') as str_actif_on FROM structure order by str_libelle`,
        function (err, result) {
            if (err) {
                log.w('::list - Erreur lors de la requete', { erreur: err.stack })
            } else {
                log.i('::list - Fin de la transaction structures (sans paramètres)', result.length);
                return result.rows;
            }
        });
}
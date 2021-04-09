const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const id = req
    log.i('In', { id })
    if (!id) {
        log.w('id is missing')
        return res.status(400).json({ message: 'L\'id de l\'intervention est manquant' });
    }

    log.i('::select from utilisateur - In ')
    const requete = `SELECT uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom, uti.uti_mail AS mail \
                    from utilisateur uti \
                    LEFT JOIN uti_int ui on uti.uti_id = ui.uti_id \
                    LEFT JOIN intervention int on int.int_id = ui.int_id \
                    WHERE int.int_id = ${id}`

    log.d('::select from utilisateur - récuperation via la requête.', { requete });
    let result = await pgPool.query(requete)
    log.i('::select from utilisateur - Done')
    return result.rows



}

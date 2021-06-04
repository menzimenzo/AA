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

    log.i('::select from int_enf - In ')
    const requete = `SELECT ien.enf_id AS enf_id, ien.niv_ini AS niv_ini, ien.niv_fin AS niv_fin, \
    enf.enf_prenom AS prenom\
    from int_enf ien \
    LEFT JOIN enfant enf on enf.enf_id = ien.enf_id \
    LEFT JOIN intervention int on int.int_id = ien.int_id \
    WHERE ien.int_id = ${id}`
    log.d('::select from int_enf - récuperation via la requête.', { requete });
    let result = await pgPool.query(requete)
    log.i('::select from int_enf - Done')
    return result.rows
}

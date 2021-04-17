const pgPool = require('../pgpool').getPool()
const { formatIntervention } = require('../utils/utils')

const logger = require('../utils/logger')
const getUtilisateursFromIntervention = require('./getUtilisateursFromIntervention')
const getEnfantsFromIntervention = require('./getEnfantsFromIntervention')
const log = logger(module.filename)

module.exports = async function (req, res) {

    const { id, user } = req
    log.i('In', { id })
    if (!id) {
        log.w('id is missing')
        return res.status(400).json({ message: 'L\'id de l\'intervention est manquant' });
    }

    if (!user) {
        log.w('user is missing')
        return res.status(400).json({ message: 'L\'utilisateur est manquant' });
    }

    var whereClause = ""
    if (user.role == 3 || user.role == 4) {
        // les formateurs ou maitre nageur AAQ ne voient que leurs interventions
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
         LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id
         where uti.uti_id=${user.uti_id} and int.int_id=${id}`
    } else {
        // Laurent : Pour le moment on met la même chose pour les admin pour éviter que ça plante.
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
        LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
         LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
         LEFT JOIN structure str on str.str_id = int.str_id
         where uti.uti_id=${user.uti_id} and int.int_id=${id}`
    }

    const requete = `SELECT int.*, pis.*, str.str_libellecourt from intervention int ${whereClause}`;
    log.d('::select from intervention - récuperation via la requête.', { requete });

    let intervention = []
    await Promise.all([pgPool.query(requete), getUtilisateursFromIntervention(id), getEnfantsFromIntervention(id)]).then(values => {
        intervention = values[0].rows.map(formatIntervention)
        intervention[0].utilisateur = values[1]
        intervention[0].enfant = values[2]
        log.d(intervention)
    }).catch(reason => {console.log(reason)})
    return intervention
}

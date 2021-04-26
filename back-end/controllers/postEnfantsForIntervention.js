const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const nbEnfants= req[0]
    const id = req[1]

    var insertEnfant =  async (x,i) => {
        const insertenf = `insert into enfant(enf_prenom) values(null) RETURNING enf_id`
        await pgPool.query(insertenf, [])
        .then( async res => {
            log.d('::post - insert Enfant - int N°' + id + ' création enfant n°' + res.rows[0].enf_id + ' Done');
            enf[i]=res.rows[0].enf_id
        }) 
        .catch(err => console.error('Error executing query', err.stack))
        
    }

    var enf = new Array(nbEnfants)
    for (var i = 1; i < nbEnfants; i++) {
        enf.push(i)
    }

    var actions = enf.map(insertEnfant)
    await Promise.all(actions)
    .then( async () => {
        console.log('fin création des enfants')

        var insertIntEnf =  async (enfId) => {
            const insertintenf = `insert into int_enf(int_id,enf_id,niv_ini) values ($1,$2,0)`
            await pgPool.query(insertintenf, [id, enfId])
            .then( async res => {
                log.d('::post - insert int_enf - int N°' + id + ' ajout enfant n°' + enfId + ' Done');
            }) 
            .catch(err => console.error('Error executing query', err.stack))
        }
        var secondeActions = enf.map(insertIntEnf)
        await Promise.all(secondeActions)
            .then(() => {console.log('fin insertion int_enf')})
            .catch(err => console.error('Error executing query', err.stack))
    })
    .catch(err => console.error('Error executing query', err.stack))
}

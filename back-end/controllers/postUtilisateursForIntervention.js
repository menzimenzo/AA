const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async (req, res) => {
    const user = req[0]
    const id = req[1]

    var insert =  async us => {
        const insertUs = `insert into uti_int(uti_id,int_id) values ($1,${id}) returning *`
        await pgPool.query(insertUs, [us.id])
        .then(res => {
            log.d('::post - insert Utilisateur - int N°' + id + ' dans uti_int pour ' + us.id + ' Done');
            console.log(res.rows[0])
        }) 
        .catch(err => console.error('Error executing query', err.stack))
        
    }
    var actions = user.map(insert)
    await Promise.all(actions)
    .then(() => {console.log('fin insertion users')})
    .catch(err => console.error('Error executing query', err.stack))
}

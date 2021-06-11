const pgPool = require('../pgpool').getPool()
const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req,res) {
    log.i('::post - In')
    const structure = req[0]
    console.log(structure)

    const { nom, code, actif, adresse, commune, type, soustype } = structure
    
        // On vérifie si la structure est déjà créé ou non 
    const requete = `SELECT * from Structure where str_code='${code}'`;
    pgPool.query(requete, (err, res) => {
        if (err) {
            log.w('::get - Erreur lors de la requete', { requete, erreur: err.stack })
            return result.status(400).json('erreur lors de la récupération de la structure');
        }
        else {
            const structures = res.rows[0];
            if (!structures) {
                log.d('::get - Structure a créer')
                //return res.status(200).json({ message: 'Structure inexistante' });

                //insert dans la table structure
                const secondeRequete = `insert into structure 
                    (str_libelle,str_code,str_actif,str_adresse,str_commune,str_type,str_soustype ) 
                    values($1,$2,$3,$4,$5,$6,$7 ) RETURNING *`;

                //console.log({ secondeRequete });
                pgPool.query(secondeRequete, [nom, code, actif, adresse, commune, type, soustype], (err, result) => {
                    if (err) {
                        log.w('::update - Erreur lors de la création.', { secondeRequete, erreur: err.stack })
                        return result.status(400).json('erreur lors de la création de la structure');
                    }
                    else {
                        log.i('::post - Done')
                        return result.rows;
                    }
                })
            }
            log.i('::get - Done')
            return structures;
        }
    })

}
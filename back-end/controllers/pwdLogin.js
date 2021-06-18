const pgPool = require('../pgpool').getPool()
const crypto = require('crypto');
const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function(req, res) {
    const { mail, password } = req.body
    log.i('In', { mail })
    if(!mail) {
        log.w('mail is missing')
        return res.status(400).json({ message: 'Le courriel manque à la requête.'});
    }
    if(!password) {
        log.w('password is missing.')
        return res.status(400).json({ message: 'Aucun mot de passe fournit pour identification.'});
    }

    const requete = `SELECT * FROM utilisateur WHERE lower(uti_mail)=lower('${mail}')`;
    const crypted = await crypto.createHash('md5').update(password).digest('hex');

    pgPool.query(requete, (err, result) => {
        if (err) { 
            log.w(err.stack);
            return res.status(400).json('erreur lors de la récupération de l\'utilisateur');
        }
        else {
            log.d('Getting user')
            let user = result.rowCount === 1 && result.rows[0];
            if (!user) {
                log.w('Utilisateur inexistant')
                return res.status(404).json({ message: 'Mail ou mot de passe incorrect' });
            }

            if(user.uti_pwd && user.uti_pwd === crypted) {
                if(!user.uti_eaps && user.profild > 2) {
                    return res.status(200).json({message:'Veuillez terminer votre inscription', redirect:'/connexion/inscription', user: formatUtilisateur(user)})
                }
                if(!user.pwd_validated) {
                    return res.status(400).json({ message: 'En attente de confirmation du mot de passe.' });
                }    

                // cas du partenaire, on ajoute en session la structureId 
                if (user.rol_id == 2) {
                    const structure = `SELECT str_id FROM uti_str WHERE uti_id=${user.uti_id}`;
                    console.log(structure)
                    pgPool.query(structure, (err, result) => {
                        if (err) { 
                            log.w(err.stack);
                            return res.status(400).json('erreur lors de la récupération de l\'utilisateur');
                        }
                        else {
                            log.d('Getting structure')
                            const str = result.rowCount === 1 && result.rows[0].str_id
                            user.structureId = str
                            console.log(user)
                        }
                    })
                }
                req.session.user = user
                req.accessToken = crypted;
                req.session.accessToken = crypted;
                log.i('Done', { user })            
                    return res.json({ user: formatUtilisateur(user) });
                
            } else {
                return res.status(404).json({ message: 'Mail ou mot de passe incorrect' });
            }
        }
    })
}

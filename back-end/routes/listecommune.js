const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)
/*
Test : 
    Sur serveur web backend : 
        http://localhost:3001/listecommune?codepostal=57530
    Via l'exposition du backend par le proxy (nginx)  
        http://localhost/backend/listecommune?codepostal=57530
*/

router.get('/', function (req, res) {
        log.i('::listdepartement - In')
        var v_codepostal;
        v_codepostal = req.query.codepostal;
        // Recherche des communes correspondant au codepostal
        pgPool.query(`select com.*, dep.reg_num
                        from commune com  
                        inner join codepostal_insee  cpi on cpi.cpi_codeinsee = com.cpi_codeinsee 
                        inner join departement dep on com.dep_num = dep.dep_num
                    where cpi.cpi_codepostal = $1`,
            [$1 = v_codepostal],
            (err, result) => {
                if (err) {
                    log.w('::listdepartement - erreur', err)
                    return res.statusCode(400).json({ message: 'erreur sur la requete de listcommune' });
                }
                else {
                    log.i('::listdepartement - done', { count: result.rowCount})
                    const communes = result.rows;
                    console.log(communes)
                    return res.status(200).json({ communes });
                }
            });
    });

module.exports = router;
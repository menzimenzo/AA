const express    = require('express');
const router     = express.Router();
const stream = require('stream');
let   upload     = require('../utils/multer.config.js')
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res, next) {
    log.i('::list - In')
    pgPool.query(
        'SELECT * FROM document',
        function (err, result) {
            if (err) {
                log.w('::list - erreur', err);
                return res.status(400).json({ message: 'erreur lors de la récupération des documents.' });
            } else {
                log.i('::list - Done, fin de la transaction documents', result.length);
                const documents = result && result.rows
                return res.send(documents);
            }
        })
})

router.get('/:docId', function (req, res, next) {
    const id = req.params.docId
    log.i('::get - In', { id })
    pgPool.query(
        `SELECT * FROM document WHERE doc_id = ${id}`,
        function (err, results) {
            if (err || results.rows.length == 0) {
                log.w('::get - erreur',err);
                return res.status(400).json({ message: 'Erreur lor des la récupération du document.' });
            } else {
                log.i('::get - Done, fin de la transaction documents');
                var file = results.rows[0]
                var fileContents = Buffer.from(file.doc_contenu, "base64");
                var readStream = new stream.PassThrough();
                readStream.end(fileContents);
                
                res.set('Content-disposition', 'attachment; filename=' + file.doc_libelle);
                res.set('Content-Type', file.doc_type);
                return readStream.pipe(res);
            }
        })
})

router.delete('/:docId', function (req, res, next) {
    const id = req.params.docId
    log.i('::delete - In', { id });
    pgPool.query(
        `DELETE FROM document WHERE doc_id = ${id}`,
        function (err, results) {
            if (err) {
                log.w('::delete - erreur',err);
                return res.status(400).json({ message: 'Erreur lor des la suppression du document.' });
            } else {
                log.d('::delete - Done')
                return res.send('OK')
            }
        })
})

router.post('/', upload.single("file"), (req, res) => {
    log.i('::post - In')
    const requete = `INSERT INTO document 
    (doc_type, doc_filename, doc_libelle, doc_contenu) 
    VALUES($1,$2,$3,$4)`;
    // Mantis 86371
    // Correction de l'impossibilité de charger un document
    // Oubli du req. devant file lors de l'audit de code.
    // const file = file
    const file = req.file
    const { libelle } = req.body
    return pgPool.query(requete, [file.mimetype, file.originalname, libelle, file.buffer], (err, result) => {
        if (err) {
            log.w('::post - Erreur',{ requete, erreur: err.stack});
            return res.status(400).json({ message: 'erreur lors de la sauvegarde du fichier'});
        }
        else {
            log.i('::post - Done', { rows: result.rows })
            return res.status(200).json({ fichier: result.rows[0] });
        }
    })
})


module.exports = router;
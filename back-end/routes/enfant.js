const express = require('express');
const router = express.Router();
const { putEnfant } = require('../controllers');
//const { deleteEnfant } = require('../controllers');
const { getEnfant } = require('../controllers');


//const formatIntervention = require('../utils/utils')
var moment = require('moment');
moment().format();

const logger = require('../utils/logger');
const log = logger(module.filename)

/*
router.post('/delete/', async function (req, res) {
    const enfId = req.body.enf.enf_id
    const id = req.body.id
    log.i('::delete - In', { id })
    await deleteEnfant([enfId, id]).then(() => {
        log.i('::delete - Done', { id })
        res.send('intervention mise à jour')
    }).catch(() => {console.log('erreur')})

})*/

router.put('/:id', async function (req, res) {
    const enfant = req.body.enf
    const id = req.body.id
   
    log.i('::put - In', { id })   
    await putEnfant([enfant, id]).then(reso=> {
        log.i('::put - Done', { id })   
        return res.status(200).json('ok')
    }).catch(error => {
        log.w('::Mise à jour Enfant - erreur', error)
        return res.status(400).json({message: error.message}); 
    })

})

router.get('/:id', async function (req, res) {
    const id = req.params.id
    log.i('::get - In', { id })   
    const enfant = await getEnfant([id]).catch(error => {
        log.w('::récuperation de l\'enfant - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
    if (enfant ) {
        log.i('::get - Done', { id })   
        return res.status(200).json({ enfant})
    }
    else {
        log.i('::get - Done, rien trouvé', { id })   
        return res.status(204).json('aucun enfant trouvé avec cet identifiant')
    }
})

module.exports = router;
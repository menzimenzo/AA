const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const { putEnfant } = require('../controllers');
//const { deleteEnfant } = require('../controllers');
const { postStructure } = require('../controllers');
const { postUtilisateurForStructure } = require('../controllers');
const { putStructure } = require('../controllers');
const {getStructureByUser } = require('../controllers');
const {getStructure} = require('../controllers');
const {getStructures} = require('../controllers');

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/:id', async function (req, res) {
    const id = req.params.id;
    log.i('::getStructure - In', { userId })
    await getStructure([id]).then(reso=> {
        log.i('::getStructure - Done')   
        return res.status(200).json({structure: reso})
    }).catch(error => {
        log.w('::getStructure - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
   
});

router.get('/user/:userId', async function (req, res) {
    const userId = req.params.userId;
    log.i('::getStructureByUser - In', { userId })
    await getStructureByUser([userId]).then(reso=> {
        log.i('::getStructureByUser - Done')   
        return res.status(200).json({structure: reso})
    }).catch(error => {
        log.w('::getStructureByUser - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
   
});

router.get('/', async function (req, res) {
    log.i('::list - In')
    await getStructures([]).then(reso=> {
        log.i('::getStructures - Done')   
        return res.status(200).json({structure: reso})
    }).catch(error => {
        log.w('::getStructures - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
    
});

router.put('/:id', async function (req, res) {
    const structure = req.body.structure
    const id = req.params.id
    log.i('::update - In', { id })

    await putStructure([structure, id]).then(reso=> {
        log.i('::update - Done')   
        return res.status(200).json({structure: reso})
    }).catch(error => {
        log.w('::update structure - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
    
})

router.post('/:userId', async function (req, res) {
    log.i('::post - In')
    const structure = req.body.structure
    const userId = req.params.userId
    await postUtilisateurForStructure([structure,userId]).then(reso=> {
        log.i('::post - Done')   
        return res.status(200).json('ok')
    }).catch(error => {
        log.w('::Post structure pour utilisateur - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
})

router.post('/', async function (req, res) {
    log.i('::post - In')
    const structure = req.body.structure
    await postStructure([structure]).then(reso=> {
        log.i('::post - Done')   
        return res.status(200).json(reso)
    }).catch(error => {
        log.w('::Post structure - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
})

module.exports = router;
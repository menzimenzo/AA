const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const { putEnfant } = require('../controllers');
const { getIntervention } = require('../controllers');

//const formatIntervention = require('../utils/utils')
var moment = require('moment');
moment().format();

const logger = require('../utils/logger');


const log = logger(module.filename)



router.put('/:id', async function (req, res) {
    const enfant = req.body.enf
    const id = req.body.id
    const user = req.session.user
    const params = {
        id: id,
        user: user
    }
    await Promise.all([putEnfant([enfant,id])]).then(async () => {
        inter = await getIntervention(params)
    return res.status('200').json({ intervention: inter[0] })
    })
    
})

module.exports = router;
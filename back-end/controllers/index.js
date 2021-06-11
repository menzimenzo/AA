module.exports = {
    oauthCallback: require('./oauthCallback'),
    pwdLogin: require('./pwdLogin'),
    generateForgotPasswordEncryption: require('./generateForgotPasswordEncryption'),
    getIntervention: require('./getIntervention'),
    
    getUtilisateursFromIntervention: require('./getUtilisateursFromIntervention'),
    postUtilisateursForIntervention: require('./postUtilisateursForIntervention'),
    deleteUtilisateursFromIntervention: require('./deleteUtilisateursFromIntervention'),

    getEnfantsFromIntervention: require('./getEnfantsFromIntervention'),
    postEnfantsForIntervention: require('./postEnfantsForIntervention'),
    putEnfant: require('./putEnfant'),
    deleteEnfant: require('./deleteEnfant'),
    deleteEnfantsFromIntervention: require('./deleteEnfantsFromIntervention'),
    getEnfant: require('./getEnfant'),
    postStructure: require('./postStructure'),
    postUtilisateurForStructure: require('./postUtilisateurForStructure'),
    putStructure: require('./putStructure'),
    getStructureByUser: require('./getStructureByUser'),
    getStructure: require('./getStructure'),
    getStructures: require('./getStructures')
}

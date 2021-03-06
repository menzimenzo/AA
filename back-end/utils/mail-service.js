const axios = require('axios')
const config = require('../config')
const MAIL_URL = config.MAIL_URL
const SENDER_EMAIL = config.SENDER_EMAIL
const sendNotificationUrl = MAIL_URL + '/notification/sendEmail'

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = {
    sendEmail: function(payload){
        log.i('sendStatusNotification - In')
        payload.from = SENDER_EMAIL
        payload.replyTo = SENDER_EMAIL
        return  axios.post(sendNotificationUrl,  payload).then(() => {
            log.i('sendStatusNotification - Done', {payload})
        })
        .catch(err => {
            log.w('sendStatusNotification', err)
        })
    },
    sendValidationMail: ({ url, email, siteName, pwd, id }) => {
        log.i('sendValidationMail - In', { mail_url: sendNotificationUrl, email, url, siteName, pwd, id })
        if (!email || !url) {
            const message = `Le paramètre ${email ? 'email' : 'url'} manque à la requête`
            log.w(`sendValidationMail - ${message}`)
            throw new Error(message)
        }

        // Add / at the end if not present
        if (url && url.substr(-1) !== '/') {
            url = url + '/'
        }

        log.d('sendValidationMail - sending validation mail')
        const params = {
            from: SENDER_EMAIL,
            replyTo: SENDER_EMAIL,
            to: email,
            subject: `Validez votre email, site prévention des noyades,  recensement des maitres nageurs`,
            body: `
            <p>Bonjour,</p>

            <p>Vous recevez ce mail car vous vous êtes inscrit sur le site prévention des noyades maitres-nageurs</p>

            <p>Afin de bénéficier de toutes les fonctionnalités, veuillez valider votre email en cliquant sur le lien suivant:</p>

            <p><a href="${config.franceConnect.FS_URL}/validate/${pwd}?id=${id}">J'active mon compte.</a></p>
            `
        }
        log.d('sendValidationMail post email', { sendNotificationUrl, params })

        return axios.post(sendNotificationUrl, params)
            .then(() => {
                log.i('sendValidationMail - Done')
            })
            .catch(error => log.w('sendValidationMail - error on sending mail',{ error, method: 'sendValidationMail' }))
    },
    sendResetPasswordMail:({ mail, cryptedi, cryptedp }) => {
        log.i('sendResetPasswordMail - In', { mail, cryptedi, cryptedp })
        if (!mail) {
            const message = "L'email manque à la requête."
            log.w(`sendResetPasswordMail - ${message}`)
            throw new Error(message)
        }

        // Add / at the end if not present
        if (config.FRONT_DOMAIN && config.FRONT_DOMAIN.substr(-1) !== '/') {
            config.FRONT_DOMAIN = config.FRONT_DOMAIN + '/'
        }

        log.d('sendResetPasswordMail - sending reinitialisation mail')
        const params = {
            from: SENDER_EMAIL,
            replyTo: SENDER_EMAIL,
            to: mail,
            subject: `Réinitialiser votre mot de passe pour le site Aisance Aquatique"`,
            body: `
            <p>Bonjour,</p>

            <p>Vous recevez ce mail car vous avez effectué une demande de réinitialisation de mot de passe sur le site Aisance Aquatique</p>

            <p>Veuillez entamer la procédure en cliquant sur le lien suivant:</p>

            <p><a href="${config.franceConnect.FS_URL}/mot-de-passe-oublie/reset?old=${cryptedp}&key=${cryptedi}">Je réinitialise mon mot de passe.</a></p>
            `
        }
        log.d('sendResetPasswordMail post email', { sendNotificationUrl, params })

        return axios.post(sendNotificationUrl, params)
            .then(() => {
                log.i('sendResetPasswordMail - Done')
            })
            .catch(error => log.w('sendResetPasswordMail - error on sending mail',{ error, method: 'sendValidationMail' }))
    },
    // Fonction de formatage et d'envoi du Mail
    formatAndSendMail: (idUtilisateurCourant, IdUtilisateurIntervention, nomUtilisateurCourant, mailUtilisateurCourant, nbIntervention, interventionACompleter, interventionAVerifier, corpsMail) => {
        log.i('formatAndSendMail - In')
        var objetMail = ''
        var EnteteMail  = ''
        objetMail = `[AAQ] Intervention`
        var EnteteMail 
        EnteteMail = `Bonjour ` + nomUtilisateurCourant + `<br/><br/>`
        EnteteMail = EnteteMail + `Vous êtes intervenu(e) sur le site du programme « Aisance Aquatique » pour la déclaration`
        // Ajout du "s" s'il y a plusieurs internentions
        if (nbIntervention > 1) {
            objetMail = objetMail + `s à `
            EnteteMail = EnteteMail + ` d’interventions<br/>`
        }
        else {
            objetMail = objetMail + ` à `
            EnteteMail = EnteteMail + ` d’une intervention<br/>`
        }
        if (interventionACompleter == true) {
            objetMail = objetMail + `compléter`
            if (interventionAVerifier == true) {
                objetMail = objetMail + `/`
            }
        } 
        if (interventionAVerifier == true) {
            objetMail = objetMail + `vérifier`
        }
        EnteteMail = EnteteMail + `Afin de disposer d’indicateurs sur le public formé, nous vous invitons à vérifier/compléter vos données sur https://aisanceaquatique.fr/intervenant` 

        corpsMail = EnteteMail + `<br/><br/>` + corpsMail
        corpsMail = corpsMail + `<br/>`
        corpsMail = corpsMail + `Cordialement,<br/><br/>`
        corpsMail = corpsMail + `L’équipe « Aisance Aquatique »`
        log.i('formatAndSendMail - done, EMail to  : ' + mailUtilisateurCourant)

        return sendEmail({
            to: mailUtilisateurCourant,
            subject: objetMail,
            body: corpsMail
        })
    }
}

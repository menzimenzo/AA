import logger from '~/plugins/logger'
const log = logger('middleware:checkAuth')

// const accueilRoutes = ['/accueil']
// const adminRoutes = ['/admin']
// const partenaireRoutes = ['/partenaire']
// const fournisseurRoutes = ['/fournisseur']
// const structurerefRoutes = ['/structureref']
const logedOutRoutes = ['/']
const interventionsRoutes = ['/interventions']

export default async function({ env, route, store, req, res, redirect, app, isServer }) {
    log.i('In')
    if (
        route.path.indexOf('/connexion/login') === 0 ||
        route.path.indexOf('/connexion/logout') === 0 || 
        route.path.indexOf('/register') === 0 || 
        route.path.indexOf('/validate') === 0 || 
        route.path.indexOf('/mot-de-passe-oublie') === 0) {
            log.d('Road does not need to be checked')
            return
    }
    
    // Aucune utilisateur connecté, on redirige vers la route root
    if(!store.state.utilisateurCourant || !store.state.utilisateurCourant.id){
        log.d('Aucun utilisateur connecté.')        
        if(logedOutRoutes.indexOf(route.path) < 0){
            return redirect('/')
        }
    } else {
        // Utilisateur est bloqué - Normalement ça n'arrive plus aujourd'hui le statutId n'est plus utilisé
        // Peut-être à remettre dans une version future. On garde le code
        if(store.state.utilisateurCourant.statutId == 2 && route.path != '/connexion/locked' ){
            log.d('utilisateur verrouillé.')
            return redirect('/connexion/locked')
        }

        // Utilisateur n'a pas validé son inscription
        // L'utilisation est redirigé vers l'écran d'inscription pour vérifier ses informations.
        if(!store.state.utilisateurCourant.validated && route.path != '/connexion/inscription' ){
            log.d('user has no validation.')                                
            return redirect('/connexion/inscription')
        }
        // Cas du clic sur le logo Ministère taggué "retour à l'Accueil"
        // Ici la route demandée est / on redirige vers /interventions pour
        if(logedOutRoutes.indexOf(route.path) > -1){
            // Admin on redirige vers l'écran Admin
            if (store.state.utilisateurCourant.profilId == 1) {
                return redirect('/admin')
            }
            // Ici traiter le cas du profil "Structure"
            // TODO

            // Formateur ou MN AAQ On redirige vers interventions
            if (store.state.utilisateurCourant.profilId == 3 || store.state.utilisateurCourant.profilId == 4 || store.state.utilisateurCourant.profilId == 6) {
                return redirect(interventionsRoutes)
            }
            // Maitre nageur de base sans autorisation, on redirige vers la page d'accueil MN
            if (store.state.utilisateurCourant.profilId == 5) {
                return redirect('/accueil')
            }
        }
    }
}

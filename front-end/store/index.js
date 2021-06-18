import Vue from 'vue'
import { get } from 'lodash'
import { parseErrorMessage, formatEmail } from '~/lib/utils'
import logger from '~/plugins/logger'
const log = logger('store:index')

export const state = () => ({
  interventions: [],
  interventionCourrante: {},
  utilisateurCourant: null,
  mesPiscines: null,
  maPiscine: {},
  utilisateurSelectionne: [],
  users: [],
  structures: [],
  documents: [],
  statStructure: [],
  enfants: [],
  statStructure: []
});

export const mutations = {
  CLEAR(state) {
    log.i('mutations::demande/CLEAR')
    const initial = defaultState()
    Object.keys(initial).forEach(k => {
      state[k] = initial[k]
    })
  },
  SET(state, { key, value }) {
    log.i(`mutations::SET:${key}`, { value, key })
    const splitted = key && key.split('.')
    const lastKey = splitted.pop()
    let origin = state
    splitted.forEach(p => {
      // Si origin est vide et n'est pas un Boolean alors définir origin comme Object vide
      if (!origin[p] && typeof origin[p] !== 'boolean') Vue.set(origin, p, {})
      origin = origin[p]
    })
    Vue.set(origin, lastKey, value)
  },
  UNSET(state, { key }) {
    log.i(`mutations::UNSET:${key}`)
    const splitted = key.split('.')
    const lastKey = splitted.pop()
    let origin = state
    splitted.forEach(p => {
      // Si origin est vide et n'est pas un Boolean alors définir origin comme Object vide
      if (!origin[p] && typeof origin[p] !== 'boolean') Vue.set(origin, p, {})
      origin = origin[p]
    })
    Vue.set(origin, lastKey, null)
  },
  set_statStructure(state, statStructure) {
    log.i(`mutations::set_statStructure`)
    state.statStructure = statStructure;
  },
  set_interventionCourrantes(state, interventions) {
    log.i(`mutations::set_interventionCourrantes`)
    state.interventions = interventions;
  },
  set_interventionCourrante(state, intervention) {
    log.i(`mutations::set_interventionCourrante`, { intervention })
    state.interventionCourrante = intervention;
  },
  put_intervention(state, { intervention, index }) {
    log.i(`mutations::put_interventionCourrante`, { intervention })
    Vue.set(state.interventions, index, intervention);
  },
  add_intervention(state, intervention) {
    log.i(`mutations::add_interventionCourrante`, { intervention })
    state.interventions.push(intervention);
  },
  clean_interventions(state) {
    log.i(`mutations::clean_interventionCourrante`)
    state.interventions = [];
  },
  reset_interventions(state) {
    log.i(`mutations::reset_interventionCourrante`)
    state.interventionCourrante = {};
  },
  select_intervention(state, index) {
    log.i(`mutations::select_intervention`)
    state.intervention = state.interventions[index];
  },
  set_utilisateurCourant(state, utilisateur) {
    log.i("::mutations::set_utilisateurCourant - In");
    state.utilisateurCourant = utilisateur;
  },
  set_utilisateurSelectionne(state, utilisateur) {
    log.i(`mutations::set_utilisateurSelectionne`)
    state.utilisateurSelectionne = utilisateur;
  },
  put_user(state, { utilisateurSelectionne, index }) {
    log.i(`mutations::put_user`)
    Vue.set(state.utilisateurSelectionne, index, utilisateurSelectionne);
  },
  clean_utilisateurCourant(state) {
    log.i(`mutations::clean_utilisateurCourant`)
    state.utilisateurCourant = null;
  },
  set_users(state, users){
    log.i(`mutations::set_users`)
    state.users = users
  },
  add_piscine(state, piscine) {
    log.i(`mutations::add_piscine`, { piscine })
    state.interventions.push(piscine);
  },
  set_mesPiscines(state, piscine) {
    log.i("::mutations::set_mesPiscines - In");
    state.mesPiscines = piscine;
  },
  set_maPiscine(state, piscine) {
    log.i("::mutations::set_maPiscine - In");
    state.maPiscine = piscine;
  },
  clean_mesPiscines(state) {
    log.i(`mutations::clean_mesPiscines`)
    state.mesPiscines = null;
  },
  set_enfants(state,enfant) {
    log.i(`mutations::set_enfants`, { enfant })
    state.enfants = enfant
  },
  add_enfant(state, enfant) {
    log.i(`mutations::add_enfant`, { enfant })
    state.enfants.push(enfant);
  },
  splice_enfant(state,index) {
    log.i(`mutations::splice_enfant`)
    if ( index > -1) {
      state.enfants.splice(index,1);
    }
    else {
      state.enfants.splice(-1);
    }
  },
  put_enfant(state, {enfant,index}) {
    log.i(`mutations::put_enfant`, { enfant })
    Vue.set(state.enfants, index, enfant);
  },
  clean_enfants(state) {
    log.i(`mutations::clean_enfants`)
    state.enfants = [];
  },
  put_user(state, {user, index}){
    log.i(`mutations::put_user`)
    Vue.set(state.users, index, user)
  },
  set_structures(state, structures){
    log.i(`mutations::set_structures`)
    state.structures = structures
  },
  set_documents(state, documents){
    log.i(`mutations::set_documents`)    
    state.documents = documents
  },
  UPDATE_ARRAY_ELM(state, { key, value }) {
    log.i('mutations::index/UPDATE_ARRAY_ELM', { key, value })
    const data = _.get(state, key)
    const index = data.findIndex(d => d.id === value.id)
    if (index === -1) {
        log.w('mutations::index/UPDATE_ARRAY_ELM', 'Élément non présent dans la liste')
        data.push(value)
    }
    Vue.set(data, index, value)
  },
  CLEAN(state, { key, isArray=false }) {
    log.i(`mutations::CLEAN:`, { key, isArray })
    return state[key] = isArray ? [] : null
  },
  // reset_interventions(state) {
  //   log.i(`mutations::reset_interventionCourrante`)
  //   state.interventionCourrante = {};
  // },
  // select_intervention(state, index) {
  //   log.i(`mutations::select_intervention`)
  //   state.intervention = state.interventions[index];
  // }
};

export const actions = {
  nuxtServerInit({ commit }, { req, route }) {
    // Transition states
    log.i('actions::nuxtServerInit - Loading user')
    if (route.path.indexOf('/connexion/logout') === 0) {
      return
    }
    return this.$axios.$get(process.env.PROXY_URL + '/backend/api/connexion/user').then(utilisateur => {
      log.i('actions::nuxtServerInit - Done')
      return commit('SET', { key: 'utilisateurCourant', value: utilisateur})
    }).catch((err) => {
      log.w('actions::nuxtServerInit - Error - nuxtServerInit', err.stack)
    })
  },
  get_interventions({ commit, state }) {
    log.i("actions::get_interventions - In");
    const url = process.env.API_URL + "/interventions";
    return this.$axios.$get(url)
      .then(response => {
        response.interventions.forEach(intervention => {
          intervention.dateCreation = new Date(intervention.dateCreation)
        })
        log.i("actions::get_interventions - Done");
        return commit("SET", { key: 'interventions', value: response.interventions });
      })
      .catch(error => {
        log.w("actions::Une erreur est survenue lors de la récupération des interventions", error);
        commit('CLEAN', { key: 'interventions', isArray: true })
      })
  },
  get_intervention({ commit, state }, idIntervention) {
    log.i("actions::get_intervention - In");  
    const url = process.env.API_URL + "/interventions/" + idIntervention;
    return this.$axios.$get(url)
      .then(response => {
        response.intervention.dateCreation = new Date(response.intervention.dateCreation)
        commit("set_interventionCourrante", response.intervention);
        log.i("actions::get_intervention - done", { intervention: response.intervention });
        return commit("SET", { key: 'set_interventionCourrante', value: response.intervention });
      })
      .catch(error => {
        log.w("actions::get_intervention - erreur", error);
      })
  },
  post_intervention({ commit, state }, intervention) {
    log.i("actions::post_intervention - In", { intervention });  
    intervention.utilisateurId = state.utilisateurCourant.id
    const url = process.env.API_URL + "/interventions";
    
    return this.$axios.$post(url, { intervention }).then(({ intervention }) => {
      commit('UPDATE_ARRAY_ELM', { key: 'interventions', value: intervention })
      return intervention
    })
    .catch(error => {
      log.w("actions::post_intervention - erreur", error);
    })
  },
  put_intervention({ commit, state }, intervention) {
    log.i("actions::put_intervention - In", { intervention })
    const url = process.env.API_URL + "/interventions/" + intervention.id
    intervention.utilisateurId = state.utilisateurCourant.id
    return this.$axios.$put(url, { intervention }).then(({ intervention }) => {
      commit('UPDATE_ARRAY_ELM', { key: 'interventions', value: intervention })
      return intervention
    })
    .catch(error => {
      log.w("actions::put_intervention - erreur", error);
    })
  },
  async get_mesPiscines({ commit, state }) {
    const url = process.env.API_URL + "/piscine/user/" + state.utilisateurCourant.id;
    log.i("get_mesPiscines - In", { url });
    return this.$axios.$get(url)
      .then(response => {
        commit("set_mesPiscines", response.mesPiscines);
        log.i("fetched mesPiscines - Done", {
        //  mesPiscines: this.mesPiscines
        });
        // this.interventions = response.interventions
      })
      .catch(error => {
        log.w(
          "Une erreur est survenue lors de la récupération des piscines de l'utilisateur " + state.utilisateurCourant.id,
          error
        );
        commit('CLEAN', { key: 'mesPiscines' })
      });
  },
  async get_maPiscine({ commit, state },id) {
    const url = process.env.API_URL + "/piscine/" + id;
    log.i("get_maPiscine - In", { url });
    return await this.$axios
      .$get(url)
      .then(response => {
        commit("set_maPiscine", response.maPiscine);
        log.i("fetched maPiscine - Done", {
        });
      })
      .catch(error => {
        log.w(
          "Une erreur est survenue lors de la récupération d'une piscine de l'utilisateur " + state.utilisateurCourant.id,
          error
        );
        commit("clean_mesPiscines");
      });
  },
  async post_maPiscine({ commit, state }, maPiscine) {
    maPiscine.utilisateurId = state.utilisateurCourant.id
    const url = process.env.API_URL + "/piscine/"
    return await this.$axios.$post(url, { maPiscine }).then(({ maPiscine }) => {
      commit('add_piscine', { maPiscine })
    })
  },
  set_utilisateur({ commit }, utilisateur) {
    return commit("SET", { key: 'utilisateurCourant', value: utilisateur });
  },
  get_users({ commit, state }) {
    log.i("actions::get_users - In");  
    const url = process.env.API_URL + "/user/";
    return this.$axios.$get(url)
      .then(response => {
        commit("SET", { key: 'users', value: response.users });
        return { users: response.users }
      })
      .catch(error => {
        log.w("actions::get_users - erreur", error);
      });
  },
  get_user({ commit,state }, idUtilisateur) {
    log.i("actions::get_user - In");  
    const url = process.env.API_URL + "/user/" + idUtilisateur;
    return this.$axios.$get(url)
      .then(response => {
        log.i("actions::get_user - Done");  
        return commit("SET", { key: 'utilisateurSelectionne', value: response.user });
      })
      .catch(error => {
        log.w("actions::get_user - In", error);
      });
  },
  put_user({ commit, state }, utilisateurSelectionne) {
    log.i("actions::put_user - In");  
    const url = process.env.API_URL + "/user/" + utilisateurSelectionne.id;
    return this.$axios.$put(url, { utilisateurSelectionne })
      .then(({user}) => {
        log.d("actions::put_user - user updated")
        const url = process.env.API_URL + "/user/" + user.id;
        log.d("actions::put_user - get all info about updated user", { url });          
        return this.$axios.$get(url)
          .then(({user}) => {
            log.i("actions::put_user - Done", { user });
            return commit('UPDATE_ARRAY_ELM', { key: 'users', value: user })
          })
      })
      .catch(error => {
        log.w("actions::put_user - erreur", { error });
        return error
      });
  },
  logout({ commit }) {
    return commit("SET", { key: 'utilisateurCourant', value: null });
  },
  async get_structureByUser({ commit,state }, userId) {
    log.i("actions::get_structure - In", { userId });  
    const url = process.env.API_URL + "/structures/user/" + userId;
    return await this.$axios
      .$get(url)
      .then(response => {
        commit("set_structures", response.structures);
        console.log("actions::get_structure - done");  
      })
      .catch(error => {
        log.w("actions::get_structure - erreur", { error });  
      });
  },
  async post_structure({ commit, state }, [structure,userId]) {
    const url  = process.env.API_URL + "/structures";
    log.i("actions::post_structure - In", { url });  
    return await this.$axios.$post(url, { structure, userId }).then(({ structure }) => {
      log.i("actions::post_structure - done");  
      commit('UPDATE_ARRAY_ELM', { key: 'structures', value: structure })
      return structure
    });
  },
  get_documents({ commit }) {
    const url = process.env.API_URL + '/documents'
    log.i("actions::get_documents - In", { url });  
    return this.$axios.get(url).then(response => {
      var documents = response.data
      documents.forEach(doc => {
        delete doc.doc_contenu
      })
      log.i("actions::get_documents - done");
      return commit('SET', { key: 'documents' , value: documents})
    }).catch(err => {
      log.w("actions::get_documents - error", { err });  
    })
    
  },
  login({ commit }, { mail, password }) {
    log.i('actions::login - In', mail)
    const url = process.env.API_URL + "/connexion/pwd-login"
    return this.$axios.$post(url, { mail, password })
      .then(res => {
        const { user, redirect, message } = res
        log.d('login - response from server', user)
        if (!user || !user.id) {
          log.w('login - authserver, user not found')
          throw new Error('Email ou mot de passe incorrect.')
        } else if (redirect) {
          log.i('login - Done but redirect', { user, redirect })
          this.$toast.info(message)
          commit('SET', { key: 'utilisateurCourant', value: user})
          return this.$router.push(redirect)
        } else {
          log.i('login - Done', { user })
          commit('SET', { key: 'utilisateurCourant', value: user })
          return this.$toast.success(`Bienvenue ${user.prenom}`)
        }
      })
      .catch(err => {
        log.w('login - error', err)
        const message = parseErrorMessage(get(err, 'response.data.message') || err.message)
        this.$toast.error(message)
        throw new Error(message)
      })
  },
  register({ commit }, params) {
    params.user.mail = formatEmail(params.user.mail)
    const { mail, password, confirm } = params.user
    const connexionType = params.connexionType
    log.i('actions::register - In', mail, password, confirm)
    let user = null
    let path = null

    return this.$axios.$post(`${process.env.API_URL}/connexion/create-account-pwd`, { password, mail, confirm, connexionType })
      .then(apiRes => {
        user = apiRes.user
        if(apiRes && apiRes.confirmInscription) {
          log.d('actions::register - User not recorded with FC')
          path= '/connexion/inscription'
          commit('SET', { key: 'utilisateurCourant', value: user})
        } else {
          log.d('actions::register - User already use FC')
          // Route pour les Maîtres nagueurs MN
          //path = '/interventions'
          path = '/login'
          this.$toast.info(`Un email de confirmation d'inscription vous a été envoyé. Veuillez cliquer sur le lien contenu dans ce mail.`)
        }
        return this.$router.push({ path })
      })
      .catch((err) => {
        log.w('actions::register', err)
        const message = parseErrorMessage(get(err, 'response.data.message')) || err.message
        this.$toast.error(message)
        throw new Error(message)
      })
  },
  forgot_password({ state }, { mail }) {
      log.i('actions::forgot_password - Init', { mail })
      return this.$axios.$post(`${process.env.API_URL}/connexion/forgot-password/${formatEmail(mail)}`)
        .then(res => {
          log.i('actions::forgot_password - Done', res)
        })
        .catch(err => {
          log.w('actions::forgot_password', err)
          const message = parseErrorMessage(get(err, 'response.data.message'))
          throw new Error(message)
        })
  },
  reset_password({ state }, { id, old, password, confirm }) {
    log.i('actions::reset_password - in ', { id, old, password, confirm })
    return this.$axios.$post(`${process.env.API_URL}/connexion/reset-password/`,{ id, old, password, confirm })
      .then(res => {
        log.i('actions::forgot_password - Done', res)
      })
      .catch(err => {
        log.w('actions::forgot_password', err)
        const message = parseErrorMessage(get(err, 'response.data.message'))
        throw new Error(message)
      })
  },
  set_state_element({ commit }, {key,value }) {
    log.i('actions::set_state_element - In',{key , value} )
    return commit('SET', { key, value })
  }
};

export const getters = {
  primaryColor: () => "#4546A1"
}

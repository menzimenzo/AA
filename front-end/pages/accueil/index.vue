<template>
  <b-container class="accueil">
    <b-row class="mt-1" >
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col  class="col-12 col-md-8" v-if="!loading">
        <b-card class="mb-3" v-if="!maDemande">
          <b-form>
            <p>Vous êtes connecté avec un rôle "Maître Nageur"</p>
            <p>Vous suivez ou avez suivi une formation pour les encadrants de l’ Aisance Aquatique :</p>
            <p>Vous avez la possibilité de valoriser cette formation, en recevant le label « Maitre-nageur AAQ ».<br>
            Pour ce faire, précisez la structure ou l’instructeur AAQ qui vous forme ou vous a formé.</p>
            <b-form-group label-for="lststructureref" required >
              <b-form-select 
                v-model="structurerefid"
                name="lststructureref"
                aria-describedby="lststructurerefFeedback">
                <option :value="null">-- Choix de la structure de référence --</option>
                <option
                  v-for="structureref in listestructureref"
                  :key="structureref.id"
                  :value="structureref.id"
                >{{ structureref.libellecourt }} | {{ structureref.courriel }}</option>
              </b-form-select>
              <b-button variant="success" v-on:click="validerStrutureRef()">Valider</b-button>
            </b-form-group>   
            <p class="mb-4">OU</p>
            <b-form-group label-for="lstformateur" required>
              <b-form-select 
                v-model="formateurid"
                name="lstformateur"
                aria-describedby="lstformateurFeedback">
                <option :value="null">-- Choix de l’instructeur --</option>
                <option
                  v-for="formateur in listeformateur"
                  :key="formateur.id"
                  :value="formateur.id"
                >{{ formateur.nom }} {{ formateur.prenom }} | {{ formateur.mail }}</option>
              </b-form-select>
              <b-button variant="success" v-on:click="validerFormateur()">Valider</b-button>
            </b-form-group>    
          </b-form>
        </b-card>            
        <b-card class="mb-3" v-else>
          <p>Vous êtes connecté avec un rôle "Maître Nageur"</p>
          <p>Vous avez une demande en cours pour passer en "Maître Nageur Aisance Aquatique".<br>
          Demande effectuée le {{ this.maDemande.datedemandeaaq}} auprès de {{ this.maDemande.sre_libellecourt}} {{ this.maDemande.uti_prenom}} {{ this.maDemande.uti_nom}} ({{this.maDemande.sre_courriel}} {{ this.maDemande.uti_mail}})</p>
        </b-card>            
      </b-col>
      <b-col class="col-12 col-md-8" v-else>
        Chargement en cours ... veuillez patienter
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from "vuex";

import logger from '~/plugins/logger'
const log = logger('pages:accueil')

export default {
  data() {
    return {
      loading: false,
      formateurid: null,
      structurerefid: null,
      maDemande: null,        
      listeformateur: [
        {
          text: "Veuillez sélectionner un formateur",
          value: null,
          id: null,
          nom: null,
          prenom: null,
          mail: null
        },
      ],
      listestructureref: [
        {
          text: "Veuillez sélectionner une structure de référence",
          value: null,
          id: null,
          libellecourt: null,
          courriel: null
        },
      ]
    };
  },
  computed: mapState(["utilisateurCourant", "demandeaaq" ]),
  methods: {
    rechercheformateur: function() {
      log.i('rechercheformateur - In')
      const url = process.env.API_URL + "/user/liste/3"
      return this.$axios.$get(url)
        .then(response => {
          log.i('rechercheformateur - Done')
          return this.listeformateur = response.users;
        })
        .catch(error => {
          log.w('rechercheformateur - ', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des formateurs")
        });
    },      
    recherchestructureref: function() {
      log.i('recherchestructureref - In')
      const url = process.env.API_URL + "/structureref/liste/"
      return this.$axios.$get(url)
        .then(response => {
          log.i('recherchestructureref - Done')
          return this.listestructureref = response.structureref;
        })
        .catch(error => {
          log.w('recherchestructureref - ', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des structures de référence")
        });
    },      
    chargedemande: function() {
      const url = process.env.API_URL + "/demandeaaq?demandeurid="+this.utilisateurCourant.id
      log.i('chargeDemande - In', { url })
      return this.$axios.$get(url)
        .then( response => {
          const demandesAaq = response && response.demandesAaq 
          if(demandesAaq && demandesAaq.length === 1) {
            log.i('chargeDemande - Une demande est en cours')
            return this.maDemande = demandesAaq[0];
          } else if(demandesAaq && demandesAaq.length > 1){
            log.w('chargeDemande - Plusieurs demandes sont en cours')
            return this.$toast.error('Il semblerait que vous ayez plusieurs demandes en cours, veuillez contacter l\'assistance.')      
          } else {
            log.d('chargeDemande - aucune demande en cours.')
          }
        })
        .catch(error => {
          log.w('chargeDemande - Une erreur est survenue lors de la récupération de la demande', error)
          return this.$toast.error('Une erreur est survenue lors de la récupération de la demande.')      
        })
    },
    validerFormateur: function() {
      log.i('validerFormateur - In', this.formateurid)
      if (this.formateurid) {
        const url = process.env.API_URL + '/demandeaaq/'
        const body = {
          formateurId: this.formateurid,
          demandeurId: this.utilisateurCourant.id
        }
        return this.$axios.$post(url, body)
          .then(({ maDemande }) => {
            log.i('validerFormateur - Done', { maDemande })
            this.maDemande = maDemande
            this.$toast.success('Votre demande a été envoyée.')
            return this.chargedemande()
          })
          .catch(error => {
            log.w('validerFormateur - Error', error)
            return this.$toast.error('Une erreur est survenue lors du dépot de la demande')
          })      
      }
    },
    validerStrutureRef: function() {
      log.i('validerStrutureRef - In', this.structurerefid)
      if (this.structurerefid) {
        const url = process.env.API_URL + '/demandeaaq/'
        const body = {
          structurerefid: this.structurerefid,
          demandeurId: this.utilisateurCourant.id
        }
        return this.$axios.$post(url, body)
          .then(({ maDemande }) => {
            log.i('validerStrutureRef - Done', { maDemande })
            this.maDemande = maDemande
            this.$toast.success('Votre demande a été envoyée.')
            return this.chargedemande()
          })
          .catch(error => {
            log.w('validerStrutureRef - Error', error)
            return this.$toast.error('Une erreur est survenue lors du dépot de la demande')
          })     
      }
    }
  },
  async created() {
  if (this.utilisateurCourant.profilId != 2) {
    log.i('created - In')
    this.loading = true;
    // Chargement de la liste des formateurs
    await this.rechercheformateur()   
    // Chargement de la liste des structures de référence
    await this.recherchestructureref()   
    // Chargement de la demande
    await this.chargedemande() 
    this.loading = false;
    }
  }
};
</script>

<style scoped>
select {
  width: 80%;
}
</style>
<template>
  <b-container class="accueil">
    <b-row style="margin-top:1%">
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col  class="col-12 col-md-8" v-if="!loading">
        <b-card class="mb-3" v-if="!maDemande">
          <p>Vous êtes connecté avec un rôle "Maître Nageur"<br>
          Vous suivez ou avez suivi une formation pour les encadrants de l’ Aisance Aquatique :</p>
          <p>Vous avez la possibilité de valoriser cette formation,<br>
          en recevant le label « Maitre-nageur AAQ ».</p>
          <p>Pour ce faire, précisez l’instructeur AAQ qui vous forme ou vous a formé</p>
          <b-form>
            <b-form-group 
                label-for="lstformateur" 
                required
                >
                <b-form-select 
                  class="liste-deroulante"
                  v-model="formateurid"
                  name="lstformateur"
                  aria-describedby="lstformateurFeedback">       
                  <option :value="null">-- Choix de l’instructeur --</option>
                  <option v-for="formateur in listeformateur"
                    :key="formateur.id"
                    :value="formateur.id"
                  >{{ formateur.nom }} {{ formateur.prenom }} | {{ formateur.mail }}</option>
                </b-form-select>
                <b-button variant="success" v-on:click="postDemandeAaq" class="ml-2">Valider</b-button>
              </b-form-group>    
          </b-form>
        </b-card>            
        <b-card class="mb-3" v-else>
          <p>Vous êtes connecté avec un rôle "Maître Nageur"<br>
          Vous avez une demande en cours pour passer en "Maître Nageur Aisance Aquatique".</p>
          <p>Demande effectuée {{ maDemande.datedemandeaaq ? `le ${maDemande.datedemandeaaq}` : ''}} auprès de {{ maDemande.uti_prenom}} {{ maDemande.uti_nom}} ({{ maDemande.uti_mail}})</p>
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

    };
  },
  computed: mapState(["utilisateurCourant", "demandeaaq" ]),
  methods: {
    getFormateurs: function() {
      log.i('getFormateurs - In')
      const url = process.env.API_URL + "/user/liste/3"
      return this.$axios.$get(url)
        .then(response => {
          const formateurs = response && response.users
          log.i('getFormateurs - Done', formateurs.length)
          return this.listeformateur = formateurs;
        })
        .catch(error => {
          log.w('getFormateurs - Error', error)
          return this.$toast.error('Une erreur est survenue lors de la récupération des formateurs.')
        });
    },
    chargeDemande: function() {
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
    postDemandeAaq: function() {
      log.i('postDemandeAaq - In', this.formateurid)
      if (!this.formateurid) {
        return this.$toast.error('Veuillez sélectionner un formateur dans la liste déroulante.')
      }

      const url = process.env.API_URL + '/demandeaaq/'
      const body = {
        formateurId: this.formateurid,
        demandeurId: this.utilisateurCourant.id
      }

      log.d('postDemandeAaq - Post', { url, body })
      return this.$axios.$post(url, body)
        .then(demande => {
          log.d('postDemandeAaq - Server responded')
          this.$toast.success('Votre demande a été soumise.')   
          return this.maDemande = demande;
        }).catch(error => {
          log.w('postDemandeAaq - Server responded', error)
          return this.$toast.error('Une erreur est survenue lors du dépot de votre demande.')
        })
    }
  },
  async created() {
    log.i('created - In')
    this.loading = true;
    await this.getFormateurs()   
    await this.chargeDemande() 
    this.loading = false;
    log.i('created - Done')
  }
};
</script>


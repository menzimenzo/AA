<template>
  <b-container class="accueil">
    <b-row style="margin-top:1%">
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col  class="col-12 col-md-8" v-if="!loading">
        <b-card class="mb-3" v-if="!maDemande">
          <b-form>
            Vous êtes connecté avec un rôle "Maître Nageur"<br><br>
            Vous suivez ou avez suivi une formation pour les encadrants de l’ Aisance Aquatique :<br><br>
            Vous avez la possibilité de valoriser cette formation,<br>
            en recevant le label « Maitre-nageur AAQ ».<br><br>
            Pour ce faire, précisez la structure ou l’instructeur AAQ qui vous forme ou vous a formé<br>
            <b-form-group 
                label-for="lststructureref" 
                require
                >
                  <b-form-select 
                    class="liste-deroulante"
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
            OU<br><br>

            <b-form-group 
                label-for="lstformateur" 
                require
                >
                  <b-form-select 
                    class="liste-deroulante"
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
          <b-form> 
            
            Vous êtes connecté avec un rôle "Maître Nageur"<br><br>
            Vous avez une demande en cours pour passer en "Maître Nageur Aisance Aquatique".
            Demande effectuée le {{ this.maDemande.datedemandeaaq}} auprès de {{ this.maDemande.sre_libellecourt}} {{ this.maDemande.uti_prenom}} {{ this.maDemande.uti_nom}} ({{this.maDemande.sre_courriel}} {{ this.maDemande.uti_mail}})<br><br>
          </b-form>
          <!-- // TODO Implémentation du bouton Annuler la demande à faire
               // Ajouter le statut "Annulé"
            <b-button variant="danger" v-on:click="annulerDemande()">Annuler ma demande</b-button>
          -->
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
        ],
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
    rechercheformateur: function() {
      console.info("Recherche des formateurs");
      // Lance la recherche sur la liste des formateurs 
      const url = process.env.API_URL + "/user/liste/3"
      console.info(url);
      return this.$axios
        .$get(url)
        .then(response => {
          this.listeformateur = response.users;
          console.info("rechercheformateur : this.listeformateur " + this.listeformateur );
        })
        .catch(error => {
          console.error(
            "Une erreur est survenue lors de la récupération des formateurs",
            error
          );
        });
    },      
    recherchestructureref: function() {
      console.info("Recherche des structures de référence");
      // Lance la recherche sur la liste des formateurs 
      const url = process.env.API_URL + "/structureref/liste/"
      console.info(url);
      return this.$axios
        .$get(url)
        .then(response => {
          this.listestructureref = response.structureref;
          console.info("recherche structureref : this.listestructureref " + this.listestructureref );
        })
        .catch(error => {
          console.error(
            "Une erreur est survenue lors de la récupération des structures de référence",
            error
          );
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
        .catch(err => {
          console.log(JSON.stringify(err));
          this.$toasted.error("Erreur lors du téléchargement: " + err.message);
        });
      },
    validerFormateur: function() {
      console.log('Formateur choisi' + this.formateurid)
      if (this.formateurid) {
        const url = process.env.API_URL + '/demandeaaq/'
        const body = {
          formateurId: this.formateurid,
          demandeurId: this.utilisateurCourant.id
        }
        return this.$axios.$post(url, body)
          .then(async response => {
              this.$toast.success('Votre demande a été envoyée.')
              
          if (response && response.maDemande) {
            this.maDemande = response.maDemande;
            //console.log("Une créée: " + this.maDemande.demandeurId)
            // J'ai fait l'inverse de ce que Glenn a dit, je refais un appel serveur
            // TODO : Récupérer les valeur du Post ... et non refaire un appel serveur
            this.chargedemande()

          }
          }).catch(error => {
            console.log(error)
            this.$toast.error(error)
          })      
      }
    },
    validerStrutureRef: function() {
      console.log('Structure de référence choisie' + this.structurerefid)
      if (this.structurerefid) {
        const url = process.env.API_URL + '/demandeaaq/'
        const body = {
          structurerefid: this.structurerefid,
          demandeurId: this.utilisateurCourant.id
        }
        return this.$axios.$post(url, body)
          .then(async response => {
              this.$toast.success('Votre demande a été envoyée à la structure')
              
          if (response && response.maDemande) {
            this.maDemande = response.maDemande;
            //console.log("Une créée: " + this.maDemande.demandeurId)
            // J'ai fait l'inverse de ce que Glenn a dit, je refais un appel serveur
            // TODO : Récupérer les valeur du Post ... et non refaire un appel serveur
            this.chargedemande()

          }
          }).catch(error => {
            console.log(error)
            this.$toast.error(error)
          })      
      }
    }
  },
  async created() {
   log.i('created - In')
   this.loading = true;
   // Chargement de la liste des formateurs
   await this.rechercheformateur()   
   // Chargement de la liste des structures de référence
   await this.recherchestructureref()   
   // Chargement de la demande
   await  this.chargedemande() 
   this.loading = false;
  }
};
</script>


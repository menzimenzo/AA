<template>
  <b-container class="accueil">
        <b-row style="
    margin-top:1%">
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>

      </b-col>
      <b-col  class="col-12 col-md-8" v-if="!loading">
        <b-card class="mb-3" v-if="!maDemande">
          <b-form>          
            Vous êtes connecté avec un rôle "Maître Nageur"<br><br>
            Vous suivez ou avez suivi une formation Aisance Aquatique :<br><br>
            Précisez le formateur ayant dispensé la formation :<br>
            <b-form-group 
                label-for="lstformateur" 
                require
                >
                  <b-form-select 
                    class="liste-deroulante"
                    v-model="formateurid"
                    name="lstformateur"
                    aria-describedby="lstformateurFeedback">
                  
                    <option :value="null">-- Choix du formateur --</option>
                    <option
                      v-for="formateur in listeformateur"
                      :key="formateur.id"
                      :value="formateur.id"
                    >{{ formateur.nom }} {{ formateur.prenom }} | {{ formateur.mail }}</option>
                  </b-form-select>
                <b-button variant="success" v-on:click="validerFormateur()">Valider</b-button>
              </b-form-group>    
          </b-form>s
        </b-card>            
        <b-card class="mb-3" v-else>
          <b-form> 
            
            Vous êtes connecté avec un rôle "Maître Nageur"<br><br>
            Vous avez une demande en cours pour passer en "Maître Nageur Aisance Aquatique".
            Demande effectuée le {{ this.maDemande.datedemandeaaq}} auprès de {{ this.maDemande.uti_prenom}} {{ this.maDemande.uti_nom}} ({{ this.maDemande.uti_mail}})<br><br>
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
//import Intervention from "~/components/Intervention.vue";
import { mapState } from "vuex";
import moment from "moment";
//import Editable from "~/components/editable/index.vue";

/*
var loadFormDemandeaaq = function(demandeaaq) {
  let formDemandeaaq = JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          id: null,
          formateurid: null,
          demandeurid: null,
          tockendemandeaccord: "",
          tockendemanderefus: "",
          datedemande: null,
          daterelance: null,
          nbrelance: null,
          dateaccord: null,
          daterefus: null,
          motifrefus: null,
          dmsid: null
        },
        demandeaaq
      )
    )
  );
  //let datedemande = moment(demandeaaq.datedemande);
  //formDemandeaaq.datedemande = datedemande.format("YYYY-MM-DD");

  return formDemandeaaq;
};
*/
export default {
  components: {
    //Editable,
    /*user */
    /*demandeaaq*/
    //fileUpload
  },
  data() {
    return {
      loading: false,
      formateurid: null,
      iddemande: null,
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
  watch: {

    "formateurid"() {
      console.info("Saisie Formateur (id) : " + this.formateurid);
    }

  },
  computed: mapState([
    "utilisateurCourant",
    "demandeaaq"
  ]),
  methods: 
  {
  rechercheformateur: function() 
    {
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
  chargedemande: function() {
      console.log("Charge demande AAQ");
      // Lance la recherche sur la liste des formateurs 
      const url = process.env.API_URL + "/demandeaaq?demandeurid=" + this.utilisateurCourant.id
      console.info(url);
      return this.$axios
        .$get(url)
        .then( response => {
          if(response && response.demandeaaq) {
            console.log("Une demande en cours: " + response.demandeaaq.dem_id)
            this.maDemande = response.demandeaaq;
          }
          else
          {
            console.log("Aucune demande en cours")
          }
        })
        .catch(error => {
          console.error(
            "Une erreur est survenue lors de la récupération des formateurs",
            error
          );
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
    }
  },
  //
  //  CHARGEMENT ASYNCHRONE DES INTERVENTIONS
  //
  async created() {
   this.loading = true;
    // Chargement de la liste des formateurs
   await this.rechercheformateur()   
   await  this.chargedemande() 
   this.loading = false;
  }
};
</script>

<style>
.accordionBtn {
  text-align: left;
}

.accordionBtn:focus {
  box-shadow: none;
}

.accordion-chevron {
  position: relative;
  top: 5px;

  -webkit-transition: 0.4s ease-in-out;
  -moz-transition: 0.4s ease-in-out;
  -o-transition: 0.4s ease-in-out;
  transition: 0.4s ease-in-out;
  color: #252195;
}

a:not(.collapsed) .accordion-chevron {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
  -moz-transform: rotate(90deg);
}

.InfoMN {
  cursor: default;
  padding-left: 1vw;
  width: 50em;
  padding-right: 1vw;
  border-block-color: rgb(0, 0, 0);
  font-size: 100%;
  font-family: sans-serif ;
  text-align: left;
  background-color: #ffffff;
  color:rgb(0, 0, 0)
}

</style>

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
//import Editable from "~/components/editable/index.vue";

import moment from "moment";

export default {
  components: {
    
    
  },
  data() {
    return {
      loading: false,
      formateurid: null,
      structurerefid: null,
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
      listestructureref: [
          {
            text: "Veuillez sélectionner une structure de référence",
            value: null,
            id: null,
            libellecourt: null,
            courriel: null
          },
        ],
    };
  },
  watch: {
    interventions: function() {
      this.loading = true;
      if (this.utilisateurCourant.profilId == 2) {
       //console.info('suppression interventions hors structure_id : '+this.utilisateurCourant.structureId)
       //console.info('nb inter avant: '+ this.interventions.length)
        this.interventionsToDisplay = this.interventions.filter(x => {
          var isMatch = true;
          isMatch =
            isMatch &&
            (String(x.structureId) == this.utilisateurCourant.structureId ||
              String(x.utiId) == this.utilisateurCourant.id);
          return isMatch;
        });
        //console.info('nb inter apres filtrage structure: '+ this.interventionsToDisplay.length)
      } else {
        this.interventionsToDisplay = this.interventions;
      }
      this.loading = false;
    }
  },
  computed: mapState([
    "interventions",
    "interventionCourrante",
    "utilisateurCourant",
    "documents"
  ]),
  methods: {
    //
    //  fonction de recupération des infos d'une intervention par id
    //
    editIntervention: function(idIntervention) {
      return this.$store
        .dispatch("get_intervention", idIntervention)
        .then(() => {
          this.$modal.show("editIntervention");
        })
        .catch(error => {
          console.error(
            "Une erreur est survenue lors de la récupération du détail de l'intervention",
            error
          );
        });
      },
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

    recherchestructureref: function() 
    {
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
        .catch(err => {
          console.log(JSON.stringify(err));
          this.$toasted.error("Erreur lors du téléchargement: " + err.message);
        });
    },
    clearIntervention() {
      this.$store.commit("reset_interventions");
    },
    exportCsv() {
      this.$axios({
        url:
          process.env.API_URL +
          "/interventions/csv/" +
          this.utilisateurCourant.id,
        // url: apiUrl + '/droits/' + 17,
        method: "GET",
        responseType: "blob"
      })
        .then(response => {
          // https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
          // Crée un objet blob avec le contenue du CSV et un lien associé
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // Crée un lien caché pour télécharger le fichier
          const link = document.createElement("a");
          link.href = url;
          const fileName = "Aisance Aquatique - Interventions.csv";
          link.setAttribute("download", fileName);
          // Télécharge le fichier
          link.click();
          link.remove();
          console.log("Done - Download", { fileName });
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
  //
  //  CHARGEMENT ASYNCHRONE DES INTERVENTIONS
  //
  async mounted() {
    //await Promise.all([
    //  this.$store.dispatch("get_interventions"),
    //  this.$store.dispatch("get_documents")
    //]);
    //console.info("mounted", { interventions: this.interventions});
    // on supprime les interventions ne relevant pas de la structure si prod_id = 2 (partenaire)
    /*if (this.utilisateurCourant.profilId == 2) {
      console.info('2 - suppression interventions hors structure_id : '+this.utilisateurCourant.structureId)
      console.info('2 - nb inter avant: '+ this.interventions.length)
      this.interventionsToDisplay = this.interventions.filter(x => {
        var isMatch = true;
        isMatch =
          isMatch &&
          String(x.structureId) == this.utilisateurCourant.structureId;
        return isMatch;
      });
      console.info('2 - nb inter apres filtrage structure: '+ this.interventionsToDisplay.length)
    } else {
      this.interventionsToDisplay = this.interventions;
    }*/
    this.loading = false;
  },
  async created() {
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

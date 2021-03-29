<template>
  <b-container class="accueil">
        <b-row style="
    margin-top:1%">
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>

      </b-col>
      <b-col   class="col-4 col-md-8" >
        <b-row >
          <p class="InfoMN" ><b>Vous êtes connecté avec un rôle "Formateur Aisance Aquatique"</b><br><br>
          Cette page est en cours de construction<br></p>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
//import Intervention from "~/components/Intervention.vue";
import { mapState } from "vuex";
//import Editable from "~/components/editable/index.vue";

export default {
  components: {
    
    
  },
  data() {
    return {
      loading: true,
      interventionsToDisplay: null,
      headers: [
        {
          path: "id",
          title: "N° d'intervention",
          type: "text",
          sortable: true
        },
        { path: "blocId", title: "Bloc", type: "text", sortable: true },
        {
          path: "commune.com_libellemaj",
          title: "Commune",
          type: "text",
          sortable: true
        },
        {
          path: "dateIntervention",
          title: "Date d'intervention",
          type: "date",
          sortable: true,
          filter: "date"
        },
        {
          path: "dateCreation",
          title: "Création",
          type: "date",
          sortable: true,
          filter: "timestamp"
        },
        {
          path: "dateMaj",
          title: "Modification",
          type: "date",
          sortable: true,
          filter: "timestamp"
        },
        {
          path: "nbEnfants",
          title: "Nombre d'enfants",
          type: "text",
          sortable: true
        },
        {
          path: "__slot:actions",
          title: "Actions",
          type: "__slot:actions",
          sortable: false
        }
      ]
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
    deleteIntervention: function(idIntervention) {
      console.info("Suppression d'une intervention : " + idIntervention);
      //this.$dialog.confirm({ text: 'Confirmez-vous la suppression définitive d\'intervention', title: 'Suppression'});
      if (confirm("Confirmez-vous la suppression définitive d'intervention")) {
        this.loading = true;
        const url =
          process.env.API_URL + "/interventions/delete/" + idIntervention;
        console.info(url);
        return this.$axios
          .$get(url)
          .then(response => {
            this.$store.dispatch("get_interventions");
            //this.resetform();
            this.clearIntervention();
            this.$toast.success(
              `Intervention #${idIntervention} a bien été supprimée`,
              {}
            );
          })
          .catch(error => {
            console.error(
              "Une erreur est survenue lors de la suppresion de l'intervention",
              error
            );
          });
        this.loading = false;
      }
    },
    downloadPdf: function(id) {
      this.$axios({
        url: process.env.API_URL + "/pdf/" + id,
        method: "GET",
        responseType: "blob" // important
      }).then(response => {
        // Crée un objet blob avec le contenue du CSV et un lien associé
        const url = window.URL.createObjectURL(new Blob([response.data]));
        // Crée un lien caché pour télécharger le fichier
        const link = document.createElement("a");
        link.href = url;
        var idformate = "";
        var nbzero;
        idformate = id.toString();
        for (nbzero = 0; nbzero < 7 - id.toString().length; nbzero++) {
          idformate = "0" + idformate;
        }
        idformate = "SRAV_Attestation-" + idformate;
        console.log(idformate);
        link.setAttribute("download", `${idformate}.pdf`); //or any other extension
        document.body.appendChild(link);
        // Télécharge le fichier
        link.click();
        link.remove();
      });
    },
    downloadDoc: function(doc) {
      this.$axios({
        url: process.env.API_URL + "/documents/" + doc.doc_id,
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
          const fileName = doc.doc_filename;
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
          const fileName = "Savoir Rouler - Interventions.csv";
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

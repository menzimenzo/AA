<template>
  <b-container class="interventionModal">
    <b-row>
      <b-col
        cols="12"
        v-if="intervention && intervention.id"
        class="text-center"
      >
        <h2 class="mb-3 interventionTitle">
          Intervention n°{{ intervention.id }} du
          {{ intervention.dateIntervention | date }} à
          {{ intervention.pisNom }}
        </h2>
      </b-col>
    </b-row>
    <b-row>
      <div class="input-group-display">
        <span>structure pour laquelle j'interviens * :</span>
        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.strId"
          :options="listebloc"
        />
      </div>
    </b-row>
    <br />
    <b-row>
      <div
        class="input-group-display"
        v-if="this.$store.state.utilisateurCourant.roleId == 5"
      >
        <span>Personne ayant réalisé l'intervention * :</span>

        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.maitreNageur"
        >
          <option
            v-for="maitreNageur in this.listeMaitreNageur"
            :key="maitreNageur.id"
            :value="maitreNageur"
          >
            {{ maitreNageur.nom }}
          </option>
        </b-form-select>
        <br />
      </div>
    </b-row>

    <b-row>
      <div class="input-group-display">
        <span>Date d'intervention * :</span>
        <b-form-input
          maxlength="10"
          v-model="formIntervention.dateIntervention"
          type="date"
          class="text-date date-input-width"
        ></b-form-input>
      </div>
    </b-row>
    <br />
    <b-row>
      <div class="input-group-display">
        <span>Lieu d'intervention * :</span>
        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.piscine.id"
        >
          <option :value="null">-- Choix de la Piscine --</option>
          <option
            v-for="piscine in this.$store.state.mesPiscines"
            :key="piscine.id"
            :value="piscine.id"
          >
            {{ piscine.nom }}
          </option>
        </b-form-select>
      </div>
    </b-row>
    <br />
    <b-row>
      <b-col>
        <div class="input-group-display">
          <span>Nombre d'enfants * :</span>
          <b-form-input
            v-model="formIntervention.nbEnfants"
            type="number"
            min="0"
            class="text-cinq-car"
          ></b-form-input>
        </div>
      </b-col>
      <b-col>
        <div class="input-group-display">
          <span>dont nouveaux enfants * :</span>
          <b-form-input
            v-model="formIntervention.nbNouveauxEnfants"
            type="number"
            min="0"
            class="text-cinq-car"
          ></b-form-input>
        </div>
      </b-col>
    </b-row>
    <br />
    <br />
    <div id="error" v-if="erreurformulaire.length == 1">
      <b-row>
        Veuillez renseigner le champ :
        <ul>
          <li v-for="erreur in erreurformulaire" :key="erreur">{{ erreur }}</li>
        </ul>
      </b-row>
    </div>
    <div id="error" v-if="erreurformulaire.length > 1">
      <b-row>
        Veuillez renseigner les champs suivants :
        <ul>
          <li v-for="erreur in erreurformulaire" :key="erreur">{{ erreur }}</li>
        </ul>
      </b-row>
    </div>
    <b-row>
      <p class="modal-btns">
        <b-button
          v-on:click="
            resetform();
            $modal.hide('editIntervention');
          "
          v-if="intervention.id"
          title="Réinitialiser le formulaire"
          >Annuler</b-button
        >
        <b-button
          v-on:click="resetform()"
          v-if="!intervention.id"
          title="Réinitialiser le formulaire"
          >Réinitialiser le formulaire</b-button
        >
        <b-button variant="success" v-on:click="checkform"
          >Enregistrer</b-button
        >
      </p>
    </b-row>
  </b-container>
</template>
<script>
import Vue from "vue";
import moment from "moment";

var loadFormIntervention = function (intervention) {
  console.log('Avant loadFormIntervention')
  console.log(intervention)
  let formIntervention = JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          structureId: null,
          piscine: {},
          maitreNageur: {},
          dateIntervention: null,
          nbEnfants: "",
          nbNouveauxEnfants: "",
          listeEnfants: [],
        },
        intervention
      )
    )
  );
  let dateIntervention = moment(intervention.dateIntervention);
  formIntervention.dateIntervention = dateIntervention.format("YYYY-MM-DD");
  console.log('Après loadFormIntervention')
  console.log(formIntervention.piscine) 
  return formIntervention;
};

export default {
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  /*computed: {
    showAttestation() {
      return (
        this.intervention &&
        this.intervention.id &&
        this.intervention.blocId === "3"
      );
    },
  },*/
  data() {
    return {
      erreurformulaire: [],
      listeMaitreNageur: {
        1: {
          nom: "carcel",
          id: 11,
        },
        2: {
          nom: "dupond",
          id: 10,
        },
      },
      formIntervention: loadFormIntervention(this.intervention),
      //<aria-label="texte de l'infobulle">
      // v-b-popover.hover="'I am popover content!'"

      listebloc: [
        { text: "-- Choix du type de bloc --", value: null },
        { text: "Bloc 1 : Savoir pédaler", value: "1" },
        { text: "Bloc 2 : Savoir circuler", value: "2" },
        { text: "Bloc 3 : Savoir rouler", value: "3" },
      ],
      selectedCommune: null,
      // Nécessaire pour le fonctionnement des popovers quand plusieurs composants intervention sont sur la page
      randomId: "popover-" + Math.floor(Math.random() * 100000),
    };
  },
  methods: {
    showPDF: function (id) {
      console.info("showPDF");
      this.$axios({
        url: process.env.API_URL + "/pdf/" + id,
        method: "GET",
        responseType: "blob", // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        var idformate = "";
        var nbzero;
        idformate = id.toString();
        for (nbzero = 0; nbzero < 7 - id.toString().length; nbzero++) {
          idformate = "0" + idformate;
        }
        idformate = "AAQ_Attestation-" + idformate;
        console.log("intervention : " + idformate);
        link.setAttribute("download", `${idformate}.pdf`); //or any other extension
        document.body.appendChild(link);
        link.click();
      });
    },

    resetform: function () {
      this.erreurformulaire = [];
      const action = "reset_interventions";
      console.info({ action });
      //this.formIntervention.maitreNageur = this.$store.state.utilisateurCourant;
      return this.$store.commit(action);
    },

    checkform: function () {
      console.info("Validation du formulaire");
      this.erreurformulaire = [];
      var formOK = true;

      // s le profil est différent de partenaire, on force le maitre nageur avec l'utilisateur courant
      if (this.$store.state.utilisateurCourant.roleId != 5) {
        console.log("utilisateur de type structure");
        this.formIntervention.maitreNageur = this.$store.state.utilisateurCourant;
      }

      if (!this.formIntervention.strId) {
        this.erreurformulaire.push("La structure");
        formOK = false;
      }
      if (!this.formIntervention.piscine) {
        this.erreurformulaire.push("Le lieu d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.dateIntervention) {
        this.erreurformulaire.push("La date d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.nbEnfants) {
        this.erreurformulaire.push("Le nombre d'enfants total");
        formOK = false;
      }
      if (!this.formIntervention.nbNouveauxEnfants) {
        this.erreurformulaire.push("Le nombre de nouveaux enfants");
        formOK = false;
      }

      if (!formOK) {
        console.info("Formulaire invalide", this.erreurformulaire);
        return;
      }

      const url = process.env.API_URL + "/interventions";
      const intervention = {
        id: this.formIntervention.id,
        strId: this.formIntervention.strId,
        maitreNageurId: this.formIntervention.maitreNageur.id,
        dateIntervention: this.formIntervention.dateIntervention,
        piscine: this.formIntervention.piscine,
        nbEnfants: this.formIntervention.nbEnfants,
        nbNouveauEnfants: this.formIntervention.nbNouveauxEnfants,
      };

      const action = intervention.id ? "put_intervention" : "post_intervention";
      console.info({ intervention, action });
      return this.$store
        .dispatch(action, intervention)
        .then(async (serverIntervention) => {
          console.info(serverIntervention);
          var action = [];
          /*if (intervention.blocId == "3") {
            action.push({
              text: "Télécharger l'attestation",
              onClick: (e, toastObject) => {
                this.showPDF(serverIntervention.id);
              },
              class: "toastLink",
            });
          }*/
          console.log(serverIntervention);
          var interventionLabel = serverIntervention.id
            ? "#" + serverIntervention.id
            : "";
          this.$toast.success(`Intervention ${interventionLabel} enregistrée`, {
            action,
          });
          this.resetform();
          this.$modal.hide("editIntervention");
        })
        .catch((error) => {
          console.error(
            "Une erreur est survenue lors de la sauvegarde de l'intervention",
            error
          );
        });
    },
  },
  watch: {
    intervention(intervention) {  
      let formIntervention = JSON.parse(
        JSON.stringify(
          Object.assign(
            {
              structureId: "",
              piscine: {},
              maitreNageur: {},
              dateIntervention: null,
              nbEnfants: "",
              nbNouveauxEnfants: "",
              listeEnfants: [],
            },
            intervention
          )
        )
      );
      formIntervention.dateIntervention = new Date(
        formIntervention.dateIntervention
      );
      Vue.set(this, "formIntervention", loadFormIntervention(intervention));
    },
    "formIntervention.cp"(cp) {
      this.recherchecommune();
    },
    selectedCommune() {
      this.formIntervention.commune = this.listecommune.find((commune) => {
        return commune.cpi_codeinsee == this.selectedCommune;
      });
    },
  },
  async mounted() {
    // gestion de la liste des maitres nageurs
    if (this.$store.state.utilisateurCourant.roleId == 5) {
      console.log("utilisateur de type structure");
      // TO DO recupérér la liste des maitres nageurs de ma structure
      this.listeMaitreNageur = this.$store.state.utilisateurCourant;
    }
  },
};
</script>

<style>
.interventionModal {
  padding: 30px;
}
.modal-btns {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.interventionTitle {
  color: #252195;
}
.input-group-display {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.input-group-display span {
  margin-top: 5px;
}
ul {
  list-style-type: none;
}
.date-input-width {
  width: 190px;
}
</style>

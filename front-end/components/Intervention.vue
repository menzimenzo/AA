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
      <div class="mb-3">
        Liste des intervenants présents durant l'intervention
      </div>
    </b-row>
    <b-row>
          <editable
            :columns="headersEncadrants"
            :data="formIntervention.utilisateur"
            :removable="false"
            :creable="false"
            :editable="false"
            :noDataLabel="''"
            tableMaxHeight="none"
        >
        <template slot-scope="props" slot="actions">
          <b-btn
            @click="deleteMN(props.data)"
            size="sm"
            class="mr-1"
            variant="primary"
          >
            <i class="material-icons">delete</i>
          </b-btn>
        </template>
      </editable>
    </b-row>
    <b-row>
      <div class="mb-3">
        <b-form inline>
          <label for="nameFilter"
            >Saissisez le début du nom d'un intervenant pour l'ajouter :</label
          >
          <b-input
            class="ml-2"
            id="nameFilter"
            v-model="nameFilter"
            placeholder="Dupond"
          />
        </b-form>
         <editable
            :columns="headersEncadrants"
            :data="filteredMN"
            :removable="false"
            :creable="false"
            :editable="false"
            :noDataLabel="''"
            tableMaxHeight="none"
        >
        <template slot-scope="props" slot="actions">
          <b-btn
            @click="addMN(props.data)"
            size="sm"
            class="mr-1"
            variant="primary"
          >
            <i class="material-icons">add</i>
          </b-btn>
        </template>
      </editable>
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
import { mapState } from "vuex";
import moment from "moment";
import Editable from "~/components/editable/index.vue";

var loadFormIntervention = function (intervention) {
  let formIntervention = JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          structureId: null,
          piscine: {},
          dateIntervention: null,
          nbEnfants: "",
          nbNouveauxEnfants: "",
          utilisateur: [],
        },
        intervention
      )
    )
  );
  let dateIntervention = moment(intervention.dateIntervention);
  formIntervention.dateIntervention = dateIntervention.format("YYYY-MM-DD");
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
  computed: {
    filteredMN: function () {
      if (this.nameFilter.length > 2) {
        return this.listeMaitreNageur.filter((mn) => {
          // Suppression des interventions sans commentaire
          let isMatch = mn.nom;
          if (this.nameFilter.length > 2) {
            isMatch =
              isMatch &&
              mn.nom.toLowerCase().indexOf(this.nameFilter.toLowerCase()) > -1;
          }
          return isMatch;
        });
      } else {
        return [];
      }
    },
  },
  components: {
    Editable,
  },
  data() {
    return {
      erreurformulaire: [],
      headersEncadrants: [
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "mail", title: "Courriel", type: "text", sortable: true },
        {
          path: "__slot:actions",
          title: "Actions",
          type: "__slot:actions",
          sortable: false,
        },
      ],
      listeMaitreNageur: [],
      nameFilter: "",
      formIntervention: loadFormIntervention(this.intervention),
      listebloc: [
        { text: "-- Choix du type de bloc --", value: null },
        { text: "Bloc 1 : Savoir pédaler", value: "1" },
        { text: "Bloc 2 : Savoir circuler", value: "2" },
        { text: "Bloc 3 : Savoir rouler", value: "3" },
      ],
      // Nécessaire pour le fonctionnement des popovers quand plusieurs composants intervention sont sur la page
      randomId: "popover-" + Math.floor(Math.random() * 100000),
    };
  },
  methods: {
    addMN: function (mn) {
      let absent = true;
      for (const [key, user] of Object.entries(
        this.formIntervention.utilisateur
      )) {
        if (user.id == mn.id) {
          absent = false;
        }
      }
      if (absent) {
        this.formIntervention.utilisateur.push(mn);
        this.$toast.success(`l'intervenant ${mn.nom} est ajouté à la liste`);
      } else {
        this.$toast.error(
          `l'intervenant ${mn.nom} est déjà présent dans la liste`
        );
      }
      this.nameFilter = "";
    },
    deleteMN: function (mn) {
      for (const [key, user] of Object.entries(
        this.formIntervention.utilisateur
      )) {
        if (user.id == mn.id) {
          this.formIntervention.utilisateur.splice(key, 1);
        }
      }
    },
    resetform: function () {
      this.erreurformulaire = [];
      const action = "reset_interventions";
      console.info({ action });
      return this.$store.commit(action);
    },
    checkform: function () {
      console.info("Validation du formulaire");
      this.erreurformulaire = [];
      var formOK = true;

      if (
        !this.formIntervention.utilisateur ||
        this.formIntervention.length == 0
      ) {
        this.erreurformulaire.push("Les intervenants");
        formOK = false;
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
        dateIntervention: this.formIntervention.dateIntervention,
        piscine: this.formIntervention.piscine,
        nbEnfants: this.formIntervention.nbEnfants,
        nbNouveauEnfants: this.formIntervention.nbNouveauxEnfants,
        utilisateur: this.formIntervention.utilisateur,
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
      console.log('avant')
      console.log(intervention)
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
              utilisateur: [],
            },
            intervention
          )
        )
      );
      formIntervention.dateIntervention = new Date(
        formIntervention.dateIntervention
      );
      console.log('apres')
      console.log(formIntervention)
      Vue.set(this, "formIntervention", loadFormIntervention(intervention));
    },
    "formIntervention.cp"(cp) {
      this.recherchecommune();
    },
  },
  async mounted() {
    // si le user courant est de profil 3 ou 4 on l'ajoute et que l'intervention courrante est nulle
    /*if (
      (this.$store.state.utilisateurCourant.profilId == 3 ||
        this.$store.state.utilisateurCourant.profilId == 4) &&
      !this.$store.state.interventionCourrante.id
    ) {
      this.formIntervention.utilisateur.push(
        this.$store.state.utilisateurCourant
      );

    }*/
    const url = process.env.API_URL + "/user/encadrant";
    console.info(url);
    await this.$axios({
      url: url,
      method: "GET",
    })
      .then((response) => {
        this.listeMaitreNageur = response.data.encadrants;
      })
      .catch((err) => {
        console.log("Erreur lors du téléchargement: " + err.message);
      });
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

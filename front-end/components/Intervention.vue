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
          {{ intervention.dateDebutIntervention | date }} au
          {{ intervention.dateFinIntervention | date }}
        </h2>
      </b-col>
    </b-row>
    <b-row>
      <div class="mb-3">
        Liste des intervenants présents durant l'intervention
      </div>
    </b-row>
    <b-row>
      <b-col cols="10">
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
        <b-btn
          @click="editIntervenant(null)"
          class="btn btn-primary btn-lg btn-block"
        >
          <i class="material-icons">add</i>
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <br />
      <br />
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
    <b-row>
      <br />
      <br />
    </b-row>
    <b-row>
      <div class="input-group-display">
        <b-col cols="10">
          <span>Lieu d'intervention * :</span>
          <b-form-select
            class="liste-deroulante"
            v-model="formIntervention.piscine"
          >
            <option :value="null">-- Choix de la Piscine --</option>
            <option
              v-for="piscine in this.$store.state.mesPiscines"
              :key="piscine.id"
              :value="piscine"
            >
              {{ piscine.nom }}
            </option>
          </b-form-select>
        </b-col>
        <b-col cols="2">
          <b-btn @click="addPiscine()" class="btn btn-primary btn-lg btn-block">
            <i class="material-icons">add</i>
          </b-btn>
        </b-col>
      </div>
    </b-row>
    <div v-if="formIntervention.piscine">
      Nom : {{ formIntervention.piscine.nom }} <br />
      Type : {{ formIntervention.piscine.type }} <br />
      Adresse : {{ formIntervention.piscine.adresse }}
      {{ formIntervention.piscine.cp }}
    </div>
    <b-row>
      <br />
      <br />
    </b-row>
    <b-row>
      <span>Période d'intervention * :</span>
    </b-row>
    <b-row>
      <div class="input-group-display">
        <span> Du :&nbsp;</span>
        <b-form-input
          maxlength="10"
          v-model="formIntervention.dateDebutIntervention"
          type="date"
          class="text-date date-input-width"
        ></b-form-input>
        <span>&nbsp; Au :&nbsp;</span>
        <b-form-input
          maxlength="10"
          v-model="formIntervention.dateFinIntervention"
          type="date"
          class="text-date date-input-width"
        ></b-form-input>
        <span>&nbsp;nombre de sessions :&nbsp;</span>
        <b-form-input
          maxlength="2"
          v-model="formIntervention.nbSession"
          type="number"
          class="text-date date-input-width"
        ></b-form-input>
      </div>
    </b-row>
    <b-row>
      <br />
      <br />
    </b-row>
    <b-row>
      <div class="input-group-display">
        <span> Cadre d'intervention :&nbsp;</span>

        <i class="material-icons" :id="randomId" style="cursor: pointer"
          >info</i
        >
        :
        <b-popover :target="randomId" triggers="hover focus">
          <b>Péri-scolaire</b> : concerne les activités organisées durant les
          jours d’école ainsi que le mercredi, qu’il y ait ou non école le
          matin.
          <br />
          <b>Extra-scolaire</b> : concerne les accueils organisés les samedis
          sans école, les dimanches et pendant les congés scolaires.
        </b-popover>
        <b-form-group class="ml-3">
          <b-form-radio-group
            v-model="formIntervention.cai"
            :options="listecadreintervention"
            plain
            name="plainStacked"
          />
        </b-form-group>
      </div>
    </b-row>
    <b-row>
      <div class="input-group-display" v-if="formIntervention.cai == 1">
        <span>Classe concernée * :</span>
        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.classe"
        >
          <option :value="null">-- Choix de la classe --</option>
          <option
            v-for="classe in listeclasse"
            :key="classe.text"
            :value="classe.value"
          >
            {{ classe.text }}
          </option>
        </b-form-select>
      </div>
    </b-row>
    <b-row>
      <br />
      <br />
    </b-row>
    <b-row>
      <div class="input-group-display">
        <span>Nombre d'enfants * :&nbsp;</span>
        <b-form-input
          v-model="formIntervention.nbEnfants"
          type="number"
          min="0"
          class="text-cinq-car"
        ></b-form-input>
      </div>
    </b-row>
    <br />
    <br />

    <b-row>
      <span>Liste des {{ formIntervention.nbEnfants }} enfants * :</span>
    </b-row>
    <b-row>
      <div class="input-group-display">
        <editable
          :columns="headersEnfants"
          :data="this.$store.state.enfants"
          :removable="true"
          :creable="false"
          :editable="true"
          :noDataLabel="''"
          :edit-by-line="true"
          tableMaxHeight="none"
          @update="updateEnfant"
          @remove="removeEnfant"
        >
          <template slot-scope="" slot="actions">
            <b-btn
              @click="searchEnfant(1)"
              size="sm"
              class="mr-1"
              variant="primary"
            >
              <i class="material-icons">edit</i>
            </b-btn>
          </template>
        </editable>
      </div>
    </b-row>

    <div id="error" v-if="erreurformulaire.length == 1">
      <b-row>
        Veuillez renseigner le champ :
        <ul>
          <li v-for="erreur in erreurformulaire" :key="erreur">
            {{ erreur }}
          </li>
        </ul>
      </b-row>
    </div>
    <div id="error" v-if="erreurformulaire.length > 1">
      <b-row>
        Veuillez renseigner les champs suivants :
        <ul>
          <li v-for="erreur in erreurformulaire" :key="erreur">
            {{ erreur }}
          </li>
        </ul>
      </b-row>
    </div>

    <b-row>
      <p class="modal-btns">
        <b-button
          v-on:click="resetform()"
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
    <modal
      name="editIntervenant"
      height="auto"
      width="1100px"
      :scrollabe="true"
    >
      <Intervenant :intervention="this.formIntervention" />
    </modal>
    <modal name="newPiscine" height="auto" width="1100px" :scrollabe="true">
      <Piscine :intervention="this.formIntervention" />
    </modal>

    <modal name="saisieIndex" height="auto" width="400px" :scrollabe="true">
      <Saisieindex :intervention="this.formIntervention" />
    </modal>
  </b-container>
</template>
<script>
import Vue from "vue";
import moment from "moment";
import Editable from "~/components/editable/index.vue";
import Intervenant from "~/components/Intervenant.vue";
import Piscine from "~/components/piscine.vue";
import Saisieindex from "~/components/saisieindex.vue";

const listeniveau = [
  { lib: "Sans commpétence", value: 0 },
  { lib: "Palier 1", value: "1" },
  { lib: "Palier 2", value: "2" },
  { lib: "Palier 3 ", value: "3" },
];

var loadFormIntervention = function (intervention) {
  let formIntervention = JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          structureId: null,
          piscine: null,
          dateDebutIntervention: null,
          dateFinIntervention: null,
          nbSession: "",
          cai: "",
          classe: "",
          nbEnfants: "",
          enfant: [],
          utilisateur: [],
        },
        intervention
      )
    )
  );
  let dateDebutIntervention = moment(intervention.dateDebutIntervention);
  formIntervention.dateDebutIntervention = dateDebutIntervention.format(
    "YYYY-MM-DD"
  );
  let dateFinIntervention = moment(intervention.dateFinIntervention);
  formIntervention.dateFinIntervention = dateFinIntervention.format(
    "YYYY-MM-DD"
  );
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
  components: {
    Editable,
    Intervenant,
    Piscine,
    Saisieindex,
  },
  data() {
    return {
      newIntervention: true,
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
      formIntervention: loadFormIntervention(this.intervention),
      listebloc: [
        { text: "-- Choix du type de bloc --", value: null },
        { text: "Bloc 1 : Savoir pédaler", value: "1" },
        { text: "Bloc 2 : Savoir circuler", value: "2" },
        { text: "Bloc 3 : Savoir rouler", value: "3" },
      ],
      listecadreintervention: [
        { text: `Scolaire`, value: "1" },
        { text: `Péri-scolaire`, value: "2" },
        { text: `Extra-scolaire`, value: "3" },
        { text: `Privé`, value: "4" },
      ],
      listeclasse: [
        { text: `Petite section`, value: "3" },
        { text: `Moyenne section`, value: "4" },
        { text: `Grande section`, value: "5" },
        { text: `Cours préparatoire`, value: "6" },
      ],
      headersEnfants: [
        {
          path: "__slot:actions",
          title: "Recherche",
          type: "__slot:actions",
          sortable: false,
          editable: true,
        },
        {
          path: "enf_id",
          title: "Identifiant",
          type: "text",
          sortable: true,
          editable: false,
        },
        {
          path: "prenom",
          title: "Prénom",
          type: "text",
          sortable: true,
          editable: true,
        },
        {
          path: "niv_ini",
          title: "niveau initial",
          type: "select",
          options: listeniveau,
          sortable: true,
          editable: true,
        },
        {
          path: "niv_fin",
          title: "niveau final atteint",
          type: "select",
          options: listeniveau,
          sortable: true,
          editable: true,
        },
      ],
      listeniveau: [
        { lib: "Sans commpétence", value: 0 },
        { lib: "Palier 1", value: "1" },
        { lib: "Palier 2", value: "2" },
        { lib: "Palier 3 ", value: "3" },
      ],
      // Nécessaire pour le fonctionnement des popovers quand plusieurs composants intervention sont sur la page
      randomId: "popover-" + Math.floor(Math.random() * 100000),
    };
  },
  /* computed: {
    tableauEnfant() {
      if (
        this.formIntervention &&
        this.formIntervention.nbEnfants > 0 &&
        !this.tab
      ) {
        let tab = [];
        for (let i = 0; i < this.formIntervention.nbEnfants; i++) {
          tab.push({
            enf_id: null,
            prenom: null,
            niv_ini: 0,
            niv_fin: 0,
          });
        }
        return tab;
      } else {
        return [];
      }
    },
  },*/
  methods: {
    removeEnfant: function () {
      console.log("aaaaaaaaaa");
    },
    updateEnfant: function (evenement) {
      //console.log(this.tableauEnfant)
      const param = {
        enfant: evenement.item,
        index: evenement.index
      }
      this.$store.commit("put_enfant",param)
      //this.tableauEnfant[evenement.index] = evenement.item;
      //Vue.set(this.tableauEnfant, evenement.index, evenement.item);
      //console.log(this.tableauEnfant)
    },
    searchEnfant: function (param) {
      console.log(param);
      this.$modal.show("saisieIndex");
    },
    addPiscine: function () {
      this.$modal.show("newPiscine");
    },
    editIntervenant: function () {
      this.$modal.show("editIntervenant");
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
      this.$store.commit(action);

      if (this.intervention.id) {
        this.$modal.hide("editIntervention");
      }
    },
    checkform: function () {
      console.info("Validation du formulaire");
      this.erreurformulaire = [];
      var formOK = true;

      if (
        !this.formIntervention.utilisateur ||
        this.formIntervention.utilisateur.length == 0
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
      if (!this.formIntervention.dateDebutIntervention) {
        this.erreurformulaire.push("La date de début d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.dateFinIntervention) {
        this.erreurformulaire.push("La date de fin d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.nbSession) {
        this.erreurformulaire.push("Le nombre de session de l'intervention");
        formOK = false;
      }
      if (!this.formIntervention.nbEnfants) {
        this.erreurformulaire.push("Le nombre d'enfants");
        formOK = false;
      }
      if (!formOK) {
        console.info("Formulaire invalide", this.erreurformulaire);
        return;
      }
      //console.log(this.formIntervention)
      const url = process.env.API_URL + "/interventions";
      const intervention = {
        id: this.formIntervention.id,
        strId: this.formIntervention.strId,
        dateDebutIntervention: this.formIntervention.dateDebutIntervention,
        dateFinIntervention: this.formIntervention.dateFinIntervention,
        nbSession: this.formIntervention.nbSession,
        piscine: this.formIntervention.piscine,
        nbEnfants: this.$store.state.enfants.length,
        cai: this.formIntervention.cai,
        classe: this.formIntervention.classe,
        utilisateur: this.formIntervention.utilisateur,
        enfant: this.$store.state.enfants,
      };

      const action = intervention.id ? "put_intervention" : "post_intervention";
      console.info({ intervention, action });
      return this.$store
        .dispatch(action, intervention)
        .then(async (serverIntervention) => {
          console.info(serverIntervention);
          var action = [];
          if (intervention.blocId == "3") {
            action.push({
              text: "Télécharger l'attestation",
              onClick: (e, toastObject) => {
                this.showPDF(serverIntervention.id);
              },
              class: "toastLink",
            });
          }
          var interventionLabel = serverIntervention.id
            ? "#" + serverIntervention.id
            : "";
          this.$toast.success(`Intervention ${interventionLabel} enregistrée`, {
            action,
          });
          this.$store.dispatch("get_intervention", serverIntervention.id);
          //this.$modal.hide("editIntervention");
        })
        .catch((error) => {
          console.error(
            "Une erreur est survenue lors de la sauvegarde de l'intervention",
            error
          );
          this.$toast.error(
            `Erreur lors de la sauvegarde de l'intervention ${interventionLabel}`
          );
        });
    },
  },
  watch: {
    intervention(intervention) {
      /* let formIntervention = JSON.parse(
        JSON.stringify(
          Object.assign(
            {
              structureId: null,
              piscine: null,
              dateDebutIntervention: null,
              dateFinIntervention: null,
              nbSession: "",
              cadreIntervention: "",
              classe: "",
              nbEnfants: "",
              enfant: [],
              utilisateur: [],
            },
            intervention
          )
        )
      );
      formIntervention.dateDebutIntervention = new Date(
        formIntervention.dateDebutIntervention
      );
      formIntervention.dateFinIntervention = new Date(
        formIntervention.dateFinIntervention
      );*/
      Vue.set(this, "formIntervention", loadFormIntervention(intervention));
      //console.log(this.formIntervention)
    },
    "formIntervention.nbEnfants"() {
      console.log("watch")
      let enfant = {
        id: null,
        prenom: null,
        niv_ini: 0,
        niv_fin: 0,
      };
      if (this.$store.state.enfants.length == 0 )
        for (let i = 0; i < this.formIntervention.nbEnfants; i++) {
          this.$store.commit("add_enfant", enfant);
        }
      else {
        if ( this.formIntervention.nbEnfants < this.$store.state.enfants.length ) {
          const nbLgnes = this.$store.state.enfants.length - this.formIntervention.nbEnfants
          let msg = ""
          if (nbLgnes == 1 ) {
            msg ="Vous allez effacer la dernière ligne saisie. Êtes vous sûr ?"
          }
          else {
            msg = "Vous allez effacer les "+nbLgnes+ " dernières lignes saisies. Êtes vous sûr ?"
          }
          if (confirm(msg))
          {
            for (let i = 0; i < nbLgnes; i++) {
            this.$store.commit("splice_enfant");
            }
          }
          else {
            this.formIntervention.nbEnfants = this.$store.state.enfants.length
          }
        }
        else{
          for (let i = 0; i < this.formIntervention.nbEnfants - this.$store.state.enfants.length +1; i++) {
          this.$store.commit("add_enfant", enfant);
        }
        }
      }
      
    },
  },
  async mounted() {
    // si le user courant est de profil 3 ou 4 et que l'intervention courrante est nulle on l'ajoute
    if (
      (this.$store.state.utilisateurCourant.profilId == 3 ||
        this.$store.state.utilisateurCourant.profilId == 4) &&
      !this.$store.state.interventionCourrante.id
    ) {
      this.formIntervention.utilisateur.push(
        this.$store.state.utilisateurCourant
      );
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

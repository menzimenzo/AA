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
          {{ intervention.dateFinIntervention  | date}}
        </h2>
      </b-col>
    </b-row>
 
      <b-row>
        <span>Liste des enfants * :</span>
      </b-row>
      <b-row> 
        <div class="input-group-display">
        <editable
          :columns="headersEnfants"
          :data="intervention.enfant"
          :removable="true"
          :creable="false"
          :editable="true"
          :noDataLabel="''"
          :edit-by-line="true"
          tableMaxHeight="none"
        >
          <template slot-scope="props" slot="actions">
            <b-btn
              @click="editEnfant(props.data)"
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

    <b-row>
      <p class="modal-btns">
        <b-button
          v-on:click="
            $modal.hide('editIntervention');
          "
          v-if="intervention.id"
          title="Réinitialiser le formulaire"
          >Précédent</b-button
        >
       
      </p>
    </b-row>
   <modal
      name="editEnfant"
      height="auto"
      width="1100px"
      :scrollabe="true"
    >
      <Enfant :enfant="this.enfantToDisplay" :intervention="intervention"/>
    </modal>
  </b-container>
</template>
<script>
import Vue from "vue";
import moment from "moment";
import Editable from "~/components/editable/index.vue";
import Enfant from "~/components/enfant.vue";

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
    Enfant
  },
  data() {
    return {
      step: null,
      enfantToDisplay:null,
      erreurformulaire: [],
      headersEnfants: [
        { path: "enf_id", title: "Identifiant", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "niv_ini", title: "niveau initial", type: "text", sortable: true },
        { path: "niv_fin", title: "niveau final atteint", type: "text", sortable: true },
        {
          path: "__slot:actions",
          title: "Actions",
          type: "__slot:actions",
          sortable: false,
        },
      ],
      
      formIntervention: loadFormIntervention(this.intervention),
      // Nécessaire pour le fonctionnement des popovers quand plusieurs composants intervention sont sur la page
      randomId: "popover-" + Math.floor(Math.random() * 100000),
    };
  },
  methods: {
    editEnfant: function (enfant) {
      this.enfantToDisplay=enfant
      this.$modal.show('editEnfant')
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
      
      const url = process.env.API_URL + "/interventions";
      const intervention = {
        id: this.formIntervention.id,
        strId: this.formIntervention.strId,
        dateDebutIntervention: this.formIntervention.dateDebutIntervention,
        dateFinIntervention: this.formIntervention.dateFinIntervention,
        nbSession: this.formIntervention.nbSession,
        piscine: this.formIntervention.piscine,
        nbEnfants: this.formIntervention.nbEnfants,
        cai: this.formIntervention.cai,
        classe: this.formIntervention.classe,
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
          //this.resetform();
          this.newIntervention= false;
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
      console.log('watch')
      let formIntervention = JSON.parse(
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
      );
      Vue.set(this, "formIntervention", loadFormIntervention(intervention));
    },

  }
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

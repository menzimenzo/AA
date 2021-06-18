<template>
  <b-container class="interventionModal">
    <b-col cols="12" class="text-center">
      <h2 class="mb-3 interventionTitle">
        Sélection d'une piscine
        <br />
      </h2>
    </b-col>

    <div class="mb-3 mt-3">
      Code Postal :
      <b-form-input
        aria-describedby="inputFormatterHelp"
        v-model="cp"
        type="text"
      ></b-form-input>
    </div>

    <b-form-group label="Piscine">
      <b-form-select class="liste-deroulante" v-model="selectedPiscine">
        <option :value="null">-- Choix de la Piscine --</option>
        <option
          v-for="piscine in listepiscine"
          :key="piscine.id"
          :value="piscine"
        >
          {{ piscine.nom }}
        </option>
      </b-form-select>
    </b-form-group>
    &nbsp;
    <div v-if="selectedPiscine">
      Adresse : {{ this.selectedPiscine.adresse }}
    </div>
    <b-row> </b-row>
    <b-row> </b-row>
    <b-row>
      <p class="modal-btns">
        <b-button v-on:click="cancel">Annuler</b-button>
        <b-button variant="success" v-on:click="addPiscine">Ajouter</b-button>
      </p>
    </b-row>
  </b-container>
</template>
<script>
import Vue from "vue";

export default {
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dansInt: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      cp: null,
      selectedPiscine: null,
      listepiscine: null,
    };
  },
  watch: {
    cp() {
      //console.info("Saisie CP");
      this.recherchepiscine();
    },
  },
  methods: {
    recherchepiscine: function () {
      if (this.cp.length === 5) {
        console.info("Recherche de la piscine");
        // Le code postal fait bien 5 caractères
        const url = process.env.API_URL + "/piscine?codepostal=" + this.cp;
        //console.info(url);
        return this.$axios
          .$get(url)
          .then((response) => {
            this.listepiscine = response.piscines;
          })
          .catch((error) => {
            console.error(
              "Une erreur est survenue lors de la récupération des piscines",
              error
            );
          });
      } else {
        // On vide la liste car le code postal a changé
        this.piscine = ["Veuillez saisir un code postal"];
        return Promise.resolve(null);
      }
    },
    addPiscine: function () {
      if (this.selectedPiscine) {
        
        return this.$store
          .dispatch("post_maPiscine", this.selectedPiscine)
          .then((piscine) => {
            this.$store.dispatch("get_mesPiscines");
            this.$store.dispatch("get_maPiscine",this.selectedPiscine.id);
            this.$toast.success(
              `${this.selectedPiscine.nom} ajoutée aux piscines favorites`,
              []
            );

            if (this.dansInt) {
              console.log('juste avant')
              console.log(this.$store.state.maPiscine)
              this.intervention.piscine = this.$store.state.maPiscine
              this.$modal.hide("editPiscine");
            } else {
              console.log('dans else')
              this.$modal.hide("newPiscine");
            }
          })
          .catch((error) => {
            console.error(
              "Une erreur est survenue lors de l'ajout de la piscine",
              error
            );
            this.$toast.error(
              `${this.selectedPiscine.nom} n'a pas pu être ajoutée aux piscines favorites`,
              []
            );
            this.$store.dispatch("get_mesPiscines");
            if (this.dansInt) {
              this.$modal.hide("newPiscine");
            } else {
              this.$modal.hide("editPiscine");
            }
          });
      } else {
        this.$toast.error(`veuillez sélectionner une piscine`, []);
      }
    },
    cancel: function () {
      if (this.dansInt) {
        this.$modal.hide("editPiscine");
      } else {
        this.$modal.hide("newPiscine");
      }
    },
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
</style>

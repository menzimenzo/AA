<template>
  <b-container class="interventionModal">
    <b-row>
    <div class="mb-3 mt-3">
     Identifiant:
      <b-form-input
        aria-describedby="inputFormatterHelp"
        v-model="index"
        type="number"
      ></b-form-input>
    </div>
    </b-row>
    <br>
    <b-row>
      <p class="modal-btns">
        <b-button
          v-on:click="cancel()"
          title="Réinitialiser le formulaire"
          >Annuler</b-button
        >
       
        <b-button variant="success" v-on:click="searchEnfant()"
          >Enregistrer</b-button
        >
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
  },
  data() {
    return {
      index: null,
    };
  },
  methods: {
    cancel: function () {
        this.$modal.hide("saisieIndex");

  },
  searchEnfant: function () {
        const url = process.env.API_URL + "/enfant/" + this.index;
        //console.info(url);
        return this.$axios
          .$get(url)
          .then((response) => {
            console.log(response)
            Vue.set(this.tableauEnfant, 0, response);
            this.$modal.hide("saisieIndex")         
          })
          .catch((error) => {
            console.error(
              "Une erreur est survenue lors de la récupération des données de l\'enfant",
              error
            );
          });
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
</style>

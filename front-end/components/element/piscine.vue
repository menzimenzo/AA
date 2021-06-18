<template>
  <b-container class="piscineModal p-5">
    <b-col cols="12" class="text-center">
      <h2 class="mb-3">Sélection d'une piscine</h2>
    </b-col>
    <b-row>
      <b-col cols="12">
        <b-form-group class="mb-3 mt-3" label="Code Postal :">
          <b-form-input
            aria-describedby="inputFormatterHelp"
            v-model="cp"
            type="text"/>
        </b-form-group>
        <b-form-group label="Piscine :">
          <b-form-select class="" v-model="selectedPiscine">
            <option :value="null">-- Choix de la Piscine --</option>
            <option
              v-for="piscine in listepiscine"
              :key="piscine.id"
              :value="piscine">
              {{ piscine.nom }}
            </option>
          </b-form-select>
        </b-form-group>
        <div v-if="selectedPiscine">
          <span>Adresse : {{ this.selectedPiscine.adresse }}</span>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3" offset="9">
        <b-button v-on:click="cancel">Annuler</b-button>
        <b-button variant="success" v-on:click="addPiscine">Ajouter</b-button>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>

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
      this.recherchepiscine();
    },
  },
  methods: {
    recherchepiscine: function () {
      if (this.cp.length === 5) {
        console.info("Recherche de la piscine");
        // Le code postal fait bien 5 caractères
        const url = process.env.API_URL + "/piscine?codepostal=" + this.cp;
        return this.$axios.$get(url)
          .then((response) => {
            return this.listepiscine = response.piscines;
          })
          .catch((error) => {
            console.error("Une erreur est survenue lors de la récupération des piscines", error)
            return this.$toast.error("Une erreur est survenue lors de la récupération des piscines")
          });
      } else {
        // On vide la liste car le code postal a changé
        this.piscine = ["Veuillez saisir un code postal"];
        return Promise.resolve(null);
      }
    },
    addPiscine: function () {
      if (this.selectedPiscine) {
        return this.$store.dispatch("post_maPiscine", this.selectedPiscine)
          .then(async (piscine) => {
            await this.$store.dispatch("get_mesPiscines");
            await this.$store.dispatch("get_maPiscine",this.selectedPiscine.id);
            this.$toast.success(`${this.selectedPiscine.nom} ajoutée aux piscines favorites`)
            if (this.dansInt) {      
              this.intervention.piscine = this.$store.state.maPiscine
            } 
            this.$modal.hide("editPiscine");
          })
          .catch((error) => {
            console.error("Une erreur est survenue lors de l'ajout de la piscine", error)
            return this.$toast.error(`${this.selectedPiscine.nom} n'a pas pu être ajoutée aux piscines favorites`)
          });
      } else {
        return this.$toast.error(`veuillez sélectionner une piscine`)
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

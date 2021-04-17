<template>
  <b-container class="interventionModal">
    <b-col cols="12" class="text-center">
      <h2 class="mb-3 interventionTitle">
        Ajout d'un intervenant
        <br>
         <br>
      </h2>
    </b-col>
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
  </b-container>
</template>
<script>
import Vue from "vue";
import Editable from "~/components/editable/index.vue";

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
    };
  },
  methods: {
    addMN: function (mn) {
      let absent = true;
      for (const [key, user] of Object.entries(this.intervention.utilisateur)) {
        if (user.id == mn.id) {
          absent = false;
        }
      }
      if (absent) {
        this.intervention.utilisateur.push(mn);
        this.$toast.success(`l'intervenant ${mn.nom} est ajouté à la liste`);
      } else {
        this.$toast.error(
          `l'intervenant ${mn.nom} est déjà présent dans la liste`
        );
      }
      this.nameFilter = "";
      this.$modal.hide("editIntervenant")
    }
  },
  async mounted() {
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

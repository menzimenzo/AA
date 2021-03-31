<template>
  <b-container class="interventions">
    <b-row>
      <b-col cols="12">
        <!--  ACCORDEON -- GESTION USER  -->
        <b-card no-body class="mb-3">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-form-row>
              <b-col>
                <!-- IMAGE RAYEE BANNER INTERVENTION -->
                <b-img
                  fluid
                  :src="require('assets/banner_ray_red.png')"
                  blank-color="rgba(0,0,0,0.5)"
                />
                <b-btn
                  class="accordionBtn"
                  block
                  href="#"
                  v-b-toggle.accordion1
                  variant="Dark link"
                >
                  <h4>
                    <i class="material-icons accordion-chevron">chevron_right</i>
                    <i class="material-icons ml-2 mr-2">people</i>
                    Gestion des comptes utilisateurs
                  </h4>
                </b-btn>
              </b-col>
            </b-form-row>
          </b-card-header>
          <b-collapse id="accordion1" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-btn @click="exportUsersCsv()" class="mb-2" variant="primary">
                <i class="material-icons" style="font-size: 18px; top: 4px;">import_export</i> Export CSV
              </b-btn>
              <div class="mb-3">
                <b-form inline>
                  <label for="nomFilter">Nom:</label>
                  <b-input class="ml-2" id="nomFilter" v-model="nomFilter" placeholder="Nom" />
                  <label class="ml-3" for="prenomFilter">Prénom:</label>
                  <b-input
                    class="ml-2"
                    id="prenomFilter"
                    v-model="prenomFilter"
                    placeholder="Prénom"
                  />
                  <label class="ml-3" for="inscriptionFilter">Validité Inscription :</label>
                  <b-form-select
                    class="ml-3"
                    v-model="inscriptionFilter"
                    :options="listeValidInscrip"
                  />
                </b-form>
              </div>
              <editable
                :columns="headers"
                :data="filteredUtilisateurs"
                :removable="false"
                :creable="false"
                :editable="false"
                :noDataLabel="''"
                tableMaxHeight="none"
                :loading="loading"
                v-if="filteredUtilisateurs.length > 0"
                :defaultSortField="{ key: 'nom', order: 'asc' }"
              >
                <template slot-scope="props" slot="actions">
                  <b-btn @click="editUser(props.data.id)" size="sm" class="mr-1" variant="primary">
                    <i class="material-icons">edit</i>

                  </b-btn>
                </template>
              </editable>
            </b-card-body>
          </b-collapse>
        </b-card>
        <!-- ACCORDEON -- DOCUMENTS PUBLIES -->
        <b-card no-body class="mb-3">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-form-row>
              <b-col>
                <!-- IMAGE RAYEE BANNER INTERVENTION -->
                <b-img :src="require('assets/banner_ray_red.png')" blank-color="rgba(0,0,0,1)" />
                <b-btn
                  class="accordionBtn"
                  block
                  href="#"
                  v-b-toggle.accordion4
                  variant="Dark link"
                >
                  <h4>
                    <i class="material-icons accordion-chevron">chevron_right</i>
                    <i class="material-icons ml-2 mr-2">cloud_upload</i>
                    Publication des documents
                  </h4>
                </b-btn>
              </b-col>
            </b-form-row>
          </b-card-header>
          <b-collapse id="accordion4" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <file-upload />
            </b-card-body>
          </b-collapse>
        </b-card>
      </b-col>
    </b-row>
    <modal name="editUser" height="auto" width="900px" :scrollabe="true">
      <user />
    </modal>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import Editable from "~/components/editable/index.vue";
import user from "~/components/user.vue";
import fileUpload from "~/components/fileUpload.vue";

export default {
  components: {
    Editable,
    user,
    fileUpload
  },
  data() {
    return {
      loading: true,
      headers: [
        { path: "id", title: "N° d'utilisateur", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "rolLibelle", title: "Rôle", type: "text", sortable: true },
        {
          path: "inscription",
          title: "Inscription",
          type: "text",
          sortable: true
        },
      ],
      headersCommentaires: [
        { path: "nom", title: "Intervenant", type: "text", sortable: true },
        {
          path: "commune.com_libellemaj",
          title: "Lieu",
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
          path: "commentaire",
          title: "Commentaires",
          type: "text",
          sortable: true
        }
      ],
      nameFilter: "",
      placeFilter: "",
      nomFilter: "",
      prenomFilter: "",
      inscriptionFilter: "",
      profilFilter: "",
      statusFilter: "",
      structureFilter: "",
      listeValidInscrip: [
        { text: "Validée", value: "Validée" },
        { text: "Non validée", value: "Non validée" },
        { text: "Tous", value: "Tous" }
      ],
      listeprofil: [
        { text: "Administrateur", value: "Administrateur" },
        { text: "Partenaire", value: "Partenaire" },
        { text: "Intervenant", value: "Intervenant" },
        { text: "Tous", value: "Tous" }
      ],
      liststatus: [
        { text: "Actif", value: "Actif" },
        { text: "Bloqué", value: "Actif" },
        { text: "Tous", value: "Tous" }
      ]
    };
  },

  methods: {
    editUser: function(id) {
      return this.$store.dispatch("get_user", id)
        .then(() => {
          this.$modal.show("editUser");
        })
        .catch(error => {
          console.error(
            "Une erreur est survenue lors de la récupération du détail de l'user",
            error
          );
        });
    },
    editStruct: function(id) {
      if (id === null) {
        this.$store.commit("clean_structureSelectionnee");
        this.$modal.show("editStruct");
      } else {
        return this.$store.dispatch("get_structure", id)
          .then(() => {
            this.$modal.show("editStruct");
          })
          .catch(error => {
            console.error(
              "Une erreur est survenue lors de la récupération du détail de la structure",
              error
            );
          });
      }
    },
    exportUsersCsv() {
      this.$axios({
        url: process.env.API_URL + "/user/csv", // + this.utilisateurCourant.id,
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
          const fileName = "Aisance Aquatique - Utilisateurs.csv";
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
  },
  //
  //  CHARGEMENT ASYNCHRONE DES USERS, STRUCTURES ET INTERVENTIONS
  //
  computed: {
    ...mapState(["interventions", "users", "structures", "statStructure"]),
    filteredUtilisateurs: function() {
      return this.users.filter(user => {
        var isMatch = true;
        console.log(this.nomFilter);
        if (this.nomFilter != "") {
          isMatch =
            isMatch &&
            user.nom.toLowerCase().indexOf(this.nomFilter.toLowerCase()) > -1;
        }
        if (this.prenomFilter != "") {
          isMatch =
            isMatch &&
            user.prenom.toLowerCase().indexOf(this.prenomFilter.toLowerCase()) >
              -1;
        }
        if (
          this.inscriptionFilter != "Tous" &&
          this.inscriptionFilter != undefined &&
          this.inscriptionFilter != ""
        ) {
          isMatch =
            isMatch && user.inscription.indexOf(this.inscriptionFilter) > -1;
        }
        return isMatch;
      });
    },

  },
  async mounted() {
    this.loading = true;
    await Promise.all([
      this.$store.dispatch("get_users").catch(error => {
        console.error(
          "Une erreur est survenue lors de la récupération des users",
          error
        );
      })/*,      
      this.$store.dispatch("get_structures").catch(error => {
        console.error(
          "Une erreur est survenue lors de la récupération des structures",
          error
        );
      }),
      this.$store.dispatch("get_interventions"),*/
    ]);

    this.loading = false;
  }
};
</script>

<style>
</style>


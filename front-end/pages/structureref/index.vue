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
                  :src="require('assets/banner_ray_blue.png')"
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
                    Liste des comptes "Aisance Aquatique" à valider ({{ this.nbdemandeaaq }})
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
                  <label class="ml-3" for="inscriptionFilter">Rôle :</label>
                  <b-form-select
                    class="ml-3"
                    v-model="roleFilter"
                    :options="listeRole"
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
                  <b-btn @click="editUser(props.data.item.id)" size="sm" class="mr-1" variant="primary">
                    <i class="material-icons">edit</i>
                  </b-btn>
                </template>
              </editable>
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

export default {
  components: {
    Editable,
    user/*,
    demandeaaq*/
  },
  data() {
    return {
      loading: true,
      headers: [
        { path: "id", title: "N° d'utilisateur", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "rolLibelle", title: "Rôle", type: "text", sortable: true },
        { path: "datedemandeaaq", title: "Date demande", type: "text", sortable: true },
//        { path: "inscription", title: "Inscription",type: "text",sortable: true },
        { path: "__slot:actions", title: "Actions",type: "__slot:actions",sortable: false}
      ],
      nameFilter: "",
      placeFilter: "",
      nomFilter: "",
      prenomFilter: "",
      inscriptionFilter: "",
      // Par défaut le filtre est positionné sur Maître Nageur car
      // cela correspond aux demandes à traiter
      roleFilter:"MaitreNageur",
      datedemandeaaq:"",
      profilFilter: "",
      statusFilter: "",
      structureFilter: "",
      listeValidInscrip: [
        { text: "Validée", value: "Validée" },
        { text: "Non validée", value: "Non validée" },
        { text: "Tous", value: "Tous" }
      ],
      liststatus: [
        { text: "Actif", value: "Actif" },
        { text: "Bloqué", value: "Actif" },
        { text: "Tous", value: "Tous" }
      ],
      listeRole: [
        { text: "Maitre Nageur AAQ", value: "MaitreNageurAAQ" },
        { text: "Maitre Nageur", value: "MaitreNageur" },
        { text: "Tous", value: "Tous" }
      ],
      nbdemandeaaq: 0
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
    accepterDemande: function(id) {
      console.log("id:"+id)
      /*
      this.$axios({
        url: process.env.API_URL + "/demandeaaq/validation?id="+id,
        // url: apiUrl + '/droits/' + 17,
        method: "PUT",
        responseType: "blob"
      })
      */

    },
    refuseDemande: function(id) {
      console.log("id:"+id)
      /*
      this.$axios({
        url: process.env.API_URL + "/demandeaaq/validation?id="+id,
        // url: apiUrl + '/droits/' + 17,
        method: "PUT",
        responseType: "blob"
      })
      */

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
        //console.log(this.nomFilter);
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
          this.roleFilter != "Tous" &&
          this.roleFilter != undefined &&
          this.roleFilter != ""
        ) {
            if (user.rolLibelle == this.roleFilter) {
              isMatch = isMatch && true
            //isMatch =
            //isMatch && user.rolLibelle.indexOf(this.roleFilter) > -1;
            }
            else
            {
              isMatch = isMatch && false

            }
        }
        /*
        if (
          this.inscriptionFilter != "Tous" &&
          this.inscriptionFilter != undefined &&
          this.inscriptionFilter != ""
        ) {
          isMatch =
            isMatch && user.inscription.indexOf(this.inscriptionFilter) > -1;
        }
        */

       console.log(isMatch)
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
      })
    ]);
/*
    await Promise.all([
      this.$store.dispatch("get_demandeaaq").catch(error => {
        console.error(
          "Une erreur est survenue lors de la récupération des users",
          error
        );
      })
    ]);
*/
    this.nbdemandeaaq = this.filteredUtilisateurs.length;
    this.loading = false;
  }
};
</script>

<style>
</style>


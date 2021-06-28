<template>
  <b-container class="formateurs">
    <b-row>
      <b-col cols="12">
        <h2>
          <i class="material-icons ml-2 mr-2 h2">people</i>
          Liste des comptes "Aisance Aquatique" à valider ({{ this.nbdemandeaaq }})
        </h2>
      </b-col>
    </b-row>
    <b-row class="mb-3">
      <b-col cols="12">
        <b-btn @click="exportUsersCsv()" class="mb-2" variant="primary">
          <i class="material-icons" style="font-size: 18px; top: 4px;">import_export</i> Export CSV de toutes les demandes
        </b-btn>
        <div class="mb-3">
          <b-form inline>
            <label for="nomFilter">Nom:</label>
            <b-input 
              class="ml-2"
              id="nomFilter" 
              v-model="nomFilter" 
              placeholder="Nom" />
            <label class="ml-3" for="prenomFilter">Prénom:</label>
            <b-input
              class="ml-2"
              id="prenomFilter"
              v-model="prenomFilter"
              placeholder="Prénom"
            />
            <label class="ml-3">Rôle :</label>
            <b-form-select
              class="ml-3"
              v-model="roleFilter"
              :options="listeRole"
            />
          </b-form>
        </div>
        <editable
          v-if="filteredUtilisateurs.length > 0"
          :columns="headers"
          :data="filteredUtilisateurs"
          :removable="false"
          :creable="false"
          :editable="false"
          :loading="loading"
          :defaultSortField="{ key: 'nom', order: 'asc' }"
        >
          <template slot-scope="props" slot="actions">
            <b-btn @click="editUser(props.data.item.id)" size="sm" class="mr-1" variant="primary">
              <i class="material-icons">edit</i>
            </b-btn>
          </template>
        </editable>
        <p v-else>
          Aucun résultat correspondant à votre recherche.
        </p>
      </b-col>
    </b-row>
    <modal name="editUser" height="auto" width="900px" :scrollabe="true">
      <user />
    </modal>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import exportUsersCsv from '~/lib/mixins/exportUsersCsv'

import Editable from "~/components/editable/index.vue";
import user from "~/components/user.vue";

import logger from '~/plugins/logger'
const log = logger('pages:formateur')

export default {
  components: {
    Editable,
    user
  },
  mixins: [exportUsersCsv],
  data() {
    return {
      loading: true,
      headers: [
        { path: "id", title: "N° d'utilisateur", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "rolLibelle", title: "Rôle", type: "text", sortable: true },
        { path: "datedemandeaaq", title: "Date demande", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions",type: "__slot:actions",sortable: false}
      ],
      nomFilter: "",
      prenomFilter: "",
      // Par défaut le filtre es positionné sur role "Maitre Nageur" car ce sont ces comptes qui sont à valider par l'instructeur
      roleFilter:"MaitreNageur",
      listeRole: [
        { text: "Maitre Nageur AAQ", value: "MaitreNageurAAQ" },
        { text: "Maitre Nageur", value: "MaitreNageur" },
        { text: "Tous", value: "Tous" }
      ],
      nbdemandeaaq: 0
    };
  },
  computed: {
    ...mapState(["users"]),
    filteredUtilisateurs: function() {
      log.i('filteredUtilisateurs - In')
      return this.users.filter(user => {
        let isMatch = true
        if (this.nomFilter != "") {
          isMatch = isMatch && user.nom.toLowerCase().indexOf(this.nomFilter.toLowerCase()) > -1
        }
        if (this.prenomFilter != "") {
          isMatch = isMatch && user.prenom.toLowerCase().indexOf(this.prenomFilter.toLowerCase()) > -1
        }
        if (this.roleFilter != "Tous") {
          isMatch = isMatch && (user.rolLibelle == this.roleFilter)
        }
        log.d('filteredUtilisateurs - Done', { isMatch })
        return isMatch;
      });
    }
  },
  async mounted() {
    this.loading = true;
    await this.$store.dispatch("get_users")
      .catch(error => {
          log.w("mounted - Une erreur est survenue lors de la récupération des utilisateurs", error)
          return this.$toast.error('Une erreur est survenue lors de la récupération des utilisateurs')
      })
    this.nbdemandeaaq = this.filteredUtilisateurs.length;
    this.loading = false;
  },
  methods: {
    editUser: function(id) {
      log.i('getUser - In')
      return this.$store.dispatch("get_user", id)
        .then(() => {
          log.i('getUser - Done')
          return this.$modal.show("editUser");
        })
        .catch(error => {
          log.w('getUser - Une erreur est survenue lors de la récupération du détail de l\'utilisateur', { error })
          return this.$toast.error('Une erreur est survenue lors de la récupération du détail de l\'utilisateur')
        })
    }
  }
}
</script>

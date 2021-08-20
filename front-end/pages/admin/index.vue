<template>
  <b-container fluid class="admin">
    <b-row>
      <b-col cols="3">
        <Menu @displayDashboard="displayDashboard" />
      </b-col>
      <b-col cols="9" class="custom-box">
        <b-collapse id="liste-compte-aaq" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-btn @click="exportUsersCsv()" class="mb-2" variant="primary">
              <i class="material-icons" style="font-size: 18px; top: 4px;">import_export</i> Export CSV de tous les utilisateurs
            </b-btn>
            <div class="mb-3">
              <b-form inline>
                <label for="nomFilter">Nom:</label>
                <b-input class="ml-2" id="nomFilter" v-model="nomFilter" placeholder="Nom" />
                <label class="ml-3" for="prenomFilter">Prénom:</label>
                <b-input class="ml-2" id="prenomFilter" v-model="prenomFilter" placeholder="Prénom"/>
                <label class="ml-3" for="inscriptionFilter">Validité Inscription :</label>
                <b-form-select
                  class="ml-3"
                  v-model="inscriptionFilter"
                  :options="listeValidInscrip"
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
              :defaultSortField="{ key: 'nom', order: 'asc' }">
              <template slot-scope="props" slot="actions">
                <b-btn @click="getUser(props.data.item.id)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">edit</i>
                </b-btn>
              </template>
            </editable>
            <p v-else>
              Aucun résultat correspondant à votre recherche.
            </p>
          </b-card-body>
        </b-collapse>
        <b-collapse id="tableaux-de-bord" accordion="my-accordion" role="tabpanel">
          <b-card-body v-if="!loading">
              <h5>
                <i class="material-icons ml-2 mr-1">attribution</i> Nombre de demandes MNS AAQ non traitées<br>
              </h5>
              <table class="table table-striped">
                <thead  >
                  <tr >
                    <th scope="col">Structure</th>
                    <th scope="col">En attente (%)</th>
                    <th scope="col">Nb en attente</th>
                    <th scope="col">Nb validées</th>
                    <th scope="col">Nb total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr  v-for="suiviDemande in suiviDemandes" :key="suiviDemande.sre_libellecourt">
                    <td><b>{{suiviDemande.sre_libellecourt}}</b></td>
                    <td><b>{{Math.trunc(isNaN(suiviDemande.dem_en_attente*100/suiviDemande.dem_total) ? 0 : suiviDemande.dem_en_attente*100/suiviDemande.dem_total)}} %</b></td>
                    <td><b>{{suiviDemande.dem_en_attente}}</b></td>
                    <td><b>{{suiviDemande.dem_validee}}</b></td>
                    <td><b>{{suiviDemande.dem_total}}</b></td>
                  </tr>
                </tbody>
              </table>
          </b-card-body>
        </b-collapse>
        <b-collapse id="publication-document" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <file-upload />
          </b-card-body>
        </b-collapse>
        <Dashboard v-if="showDashboard" />
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

import { Bar } from 'vue-chartjs'
import BarChart from "~/components/stat/histogramme.vue";
import Editable from "~/components/editable/index.vue";
import Menu from "~/components/navigation/menu-admin.vue"
import user from "~/components/user.vue";
import fileUpload from "~/components/fileUpload.vue";
import Dashboard from '../../components/dashboard/admin.vue';
import stat from "~/lib/mixins/stat";

import logger from '~/plugins/logger'

const log = logger('pages:admin')

export default {
  components: {
    Editable,
    user,
    fileUpload,
    Menu,
    Dashboard
  },
  mixins: [exportUsersCsv],
  data() {
    return {
      loading: true,
      showDashboard: true,
      headers: [
        { path: "id", title: "N° d'utilisateur", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "rolLibelle", title: "Rôle", type: "text", sortable: true },
        { path: "inscription", title: "Inscription", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions", type: "__slot:actions", sortable: false }
      ],
      headersCommentaires: [
        { path: "nom", title: "Intervenant", type: "text", sortable: true },
        { path: "commune.com_libellemaj", title: "Lieu", type: "text", sortable: true },
        { path: "dateIntervention", title: "Date d'intervention", type: "date", sortable: true, filter: "date" },
        { path: "commentaire", title: "Commentaires", type: "text", sortable: true }
      ],
      nomFilter: "",
      prenomFilter: "",
      inscriptionFilter: "Tous",
      listeValidInscrip: [
        { text: "Validée", value: "Validée" },
        { text: "Non validée", value: "Non validée" },
        { text: "Tous", value: "Tous" }
      ],
      optionsHisto: null,
      data1: null,
      bars: [
          { variant: 'success', value: 25 },
          { variant: 'info', value: 75 },
          { variant: 'warning', value: 75 },
          { variant: 'danger', value: 75 },
          { variant: 'primary', value: 75 },
          { variant: 'secondary', value: 75 },
          { variant: 'dark', value: 75 }
        ],
      suiviDemandes: [

      ]
    };
  },
  computed: {
    ...mapState(["users"]),
    filteredUtilisateurs: function() {
      //log.i('filteredUtilisateurs - In')
      return this.users.filter(user => {
        var isMatch = true;
        if (this.nomFilter != "") {
          isMatch = isMatch &&  user.nom && user.nom.toLowerCase().indexOf(this.nomFilter.toLowerCase()) > -1
        }
        if (this.prenomFilter != "") {
          isMatch = isMatch && user.prenom && user.prenom.toLowerCase().indexOf(this.prenomFilter.toLowerCase()) > -1
        }
        if (this.inscriptionFilter != "Tous") {
          isMatch = isMatch && user.inscription.indexOf(this.inscriptionFilter) > -1;
        }
        //log.d('filteredUtilisateurs - Done', { isMatch })
        return isMatch;
      });
    }
  },
  async mounted() {
    log.i('mounted - In')
    this.loading = true;
    await this.$store.dispatch("get_users").catch(error => {
        log.w('mounted - Error', error)
        return this.$toast.error('Une erreur est survenue lors de la récupération des users')
    })

    // Chargements des indicateurs demandes
    this.indicateursDemandesAaq();
    
    log.i('mounted - Done')
    this.loading = false;

  },
  methods: {
    getUser: function(id) {
      log.i('getUser - In')
      return this.$store.dispatch("get_user", id)
        .then(() => {
          log.i('getUser - Done')
          return this.$modal.show("editUser");
        })
        .catch(error => {
          log.w('getUser - Une erreur est survenue lors de la récupération du détail de l\'utilisateur', { error })
          return this.$toast.error('Une erreur est survenue lors de la récupération du détail de l\'utilisateur')
        });
    },
    displayDashboard(bool) {
      return this.showDashboard = bool
    },
    indicateursDemandesAaq(){
      const url = process.env.API_URL + "/demandeaaq/liste";
      return this.$axios.$get(url)
      .then(({suiviDemandes }) => {
          log.i('suiviDemandes -Done')
          return this.suiviDemandes = suiviDemandes;
      })
      .catch(error => {
          log.i('suiviDemandes -Error', error)
          return this.$toast.error("Une erreur est survenue lors de la récupération des indicateurs de demande")
      })
    },
  }
};
</script>

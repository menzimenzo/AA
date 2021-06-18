<template>
  <b-container class="interventionModal">
    <b-row>
      <b-col cols="12" class="text-center">
        <h2 class="mb-3">Edition de l'utilisateur <b>{{ formUser.prenom }} {{ formUser.nom }}</b>
        </h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
        <b-form-group label="Nom :" class="mb-3 mt-3">
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.nom"
            type="text"/>
        </b-form-group>
        <b-form-group label="Prénom :" class="mb-3 mt-3">
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.prenom"
            type="text"/>
        </b-form-group>
        <b-form-group label="Courriel :" class="mb-3 mt-3">
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.mail"
            type="text"/>
        </b-form-group>
        <b-form-group 
          label="Numéro de carte professionnelle :"
          id="eapsInputGroup"
          label-for="eapsInput"
          v-if="formUser.role!=1"
          class="mb-3 mt-3">
          <b-form-input
            id="eapsInput"
            type="text"
            v-model="formUser.eaps"
            name="eaps"
            :disabled="!isAdmin()"
            key="eaps-input"/>
        </b-form-group>          
        <b-form-group 
          label="Profil :"
          class="mb-3 mt-3"> 
          <b-form-select
            v-model="formUser.role"
            :options="listeprofil"/>
        </b-form-group>
        <div v-if="isAdmin()">
          <b-form-group 
            label=" Statut utilisateur :"
            class="mb-3 mt-3"> 
            <b-form-select v-model="formUser.statut" :options="liststatus" />
          </b-form-group>
          <div class="mb-3 mt-3">
            <b-form-checkbox
              switch
              v-model="formUser.validated"
              name="check-button">
              Utilisateur validé
            </b-form-checkbox>
          </div>
        </div>
      </b-col>
      <b-col cols="4">
        <b-form-group label="Site Web de contact :" class="mb-3 mt-3">
          <b-form-input
            v-model="formUser.sitewebcontact"
            :disabled="!isAdmin()"
            type="text"
            placeholder="http:// ou https://"/>
        </b-form-group>
        <b-form-group
          id="emailcontactInputGroup"
          label="Courriel de contact :"
          label-for="emailcontactInput"
          class="mb-3 mt-3">
          <b-form-input
            id="emailcontactInput"
            type="email"
            v-model="formUser.mailcontact"
            :disabled="!isAdmin()"
            name="mailcontact"
            key="email-input"
            aria-describedby="emailcontactFeedback"
            placeholder="Courriel contact"/>      
        </b-form-group>
        <b-form-group
          id="telephonecontactInputGroup"
          label="Telephone de contact :"
          label-for="telephonecontactInput"
          class="mb-3 mt-3">
          <b-form-input
            id="telephonecontactInput"
            type="text"
            v-model="formUser.telephonecontact"
            :disabled="!isAdmin()"
            name="telephonecontact"
            key="phone-input"
            aria-describedby="telephonecontactFeedback"
            placeholder="Telephone contact"/> 
        </b-form-group>
      </b-col>
      <b-col cols="4">
        <b-form-group label="Adresse de  contact :" class="mb-3 mt-3">
          <b-form-input
            type="text"
            v-model="formUser.adrcontact"
            :disabled="!isAdmin()"/>
        </b-form-group>
        <b-form-group label="Complément d'adresse de  contact:" class="mb-3 mt-3">
          <b-form-input
            type="text"
            v-model="formUser.compadrcontact"
            :disabled="!isAdmin()"/>
        </b-form-group>
        <b-form-group id="CodePostal" label="Code Postal :" label-for="cp" class="mb-3 mt-3">
          <b-form-input
            v-model="cp"
            :disabled="!isAdmin()"
            name="codepostal"
            key="cp"
            id="cp"
            type="number"
            placeholder="CP de la commune"/>
        </b-form-group>
        <b-form-group label="Commune" label-for="lstcommune" class="mb-3 mt-3">
          <b-form-select 
            class="liste-deroulante"
            v-model="formUser.cpi_codeinsee"
            :disabled="!isAdmin()"
            name="lstcommune">     
            <option :value="null">-- Choix de la commune --</option>
            <option
              v-for="commune in listecommune"
              :key="commune.cpi_codeinsee"
              :value="commune.cpi_codeinsee"
            >{{ commune.com_libellemaj}}</option>
          </b-form-select>
        </b-form-group>
        <b-form-group id="publiCheckGroup" class="mb-3 mt-3">
          <b-form-checkbox-group
            v-model="formUser.publicontact"
            id="publiCheck"
            name="publiCheck"/>
        </b-form-group>
      </b-col>
    </b-row>
    <div class="modal-btns mb-3 mt-3">
      <b-button v-on:click="$modal.hide('editUser')">Annuler</b-button>
      <b-button variant="success" v-on:click="editUtilisateur">Enregistrer</b-button>
    </div>
  </b-container>
</template>
<script>
import { mapState } from "vuex"
import { loadFormUser } from "../lib/utils"
import rechercheCommune from '~/lib/mixins/rechercheCommune'

import logger from '~/plugins/logger'
const log = logger('components:user')

export default {
  mixins: [rechercheCommune],
  data() {
    return {
      cp: null,
      listeprofil: [
        { text: "Administrateur", value: "1" },
        { text: "Formateur AAQ", value: "3" },
        { text: "Maître Nageur AAQ", value: "4" },
        { text: "Maître Nageur", value: "5" },
      ],
      liststatus: [
        { text: "Actif", value: "1" },
        { text: "Bloqué", value: "2" },
      ],
      listecommune: [
        {
          text: "Veuillez saisir un code postal",
          value: null,
          insee: null,
          cp: null,
          codedep: null
        },
      ],

    };
  },
  watch: {
      cp() {
        log.i('cp - saisie du CP')
        this.formUser.cp = this.cp;
        return this.rechercheCommune();
      },
  },
  computed: { 
    ...mapState(["utilisateurCourant"]),
    formUser() {
      log.i('formUser - In')
      return loadFormUser(this.$store.state.utilisateurSelectionne)
    },
  },
  async mounted() {
    log.i('mounted - In')
    this.loading = false;
    if (!this.isAdmin()) {
      this.listeprofil.splice(0, 2);
    }
    if(this.formUser.cp) {
      // Recopie du CP dans le champ code postal
      this.cp = this.formUser.cp
      // Recherche de la liste des commune
      this.rechercheCommune()
    }
  },
  methods: {
    editUtilisateur: function () {
      log.i('editUtilisateur - In')
      return this.$store.dispatch("put_user", this.formUser)
        .then(() => {
          log.i('editUtilisateur - Done')
          this.$modal.hide("editUser")
          return this.$toast.success(`L'utilisateur ${this.formUser.prenom} ${this.formUser.nom} a été mis à jour`)
        })
        .catch((error) => {
          log.d('editUtilisateur - Une erreur est survenue lors de la mise à jour de l\'utilisateur', error)
          return this.$toast.error('Une erreur est survenue lors de la mise à jour de l\'utilisateur')
        })
    },
    isAdmin: function(){
      return this.utilisateurCourant && this.utilisateurCourant.profilId=="1"
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
</style>

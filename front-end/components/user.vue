<template>
  <b-container class="interventionModal">
    <b-row>
      <b-col cols="12" class="text-center">
        <h2 class="mb-3 interventionTitle">
          Edition de l'utilisateur <b>{{ formUser.prenom }} {{ formUser.nom }}</b
          >
        </h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
        <div class="mb-3 mt-3">
          Nom :
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.nom"
            type="text"
          ></b-form-input>
        </div>
        <div class="mb-3 mt-3">
          Prénom :

          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.prenom"
            type="text"
          ></b-form-input>
        </div>
        <div class="mb-3 mt-3">
          Courriel :

          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.mail"
            type="text"
          ></b-form-input>
        </div>
        <div>
          <b-form-group 
            label="Numéro de carte professionnelle :"
            id="eapsInputGroup"
            label-for="eapsInput"
            v-if="formUser.role!=1"
            >
            <b-form-input
              id="eapsInput"
              type="text"
              v-model="formUser.eaps"
              name="eaps"
              :disabled=!isAdmin()
              key="eaps-input"
            />
          
          </b-form-group>          
        </div>
        <div class="mb-3 mt-3">
          Profil :
          <b-form-select
            v-model="formUser.role"
            :options="listeprofil"
          />
        </div>

        <div v-if="isAdmin()">
          <div class="mb-3 mt-3">
            Statut utilisateur :
            <b-form-select v-model="formUser.statut" :options="liststatus" />
          </div>
          <div class="mb-3 mt-3">
            <b-form-checkbox
              switch
              v-model="formUser.validated"
              name="check-button"
            >
              Utilisateur validé <b></b>
            </b-form-checkbox>
          </div>
        </div>
      </b-col>
      <b-col cols="4">

        <!--<div v-if="user.publicontact==true">-->
        <div>
          <b-form >
            <b-form-group label="Site Web de contact :">
              <b-form-input
                v-model="formUser.sitewebcontact"
                :disabled=!isAdmin()
                type="text"
                placeholder="http:// ou https://"
              />
            </b-form-group>

            <b-form-group
              id="emailcontactInputGroup"
              label="Courriel de contact :"
              label-for="emailcontactInput"
            >
              <b-form-input
                id="emailcontactInput"
                type="email"
                v-model="formUser.mailcontact"
                :disabled=!isAdmin()
                name="mailcontact"
                key="email-input"
                aria-describedby="emailcontactFeedback"
                placeholder="Courriel contact"
              />
              
            </b-form-group>
            <b-form-group
              id="telephonecontactInputGroup"
              label="Telephone de contact :"
              label-for="telephonecontactInput"
            >
              <b-form-input
                id="telephonecontactInput"
                type="text"
                v-model="formUser.telephonecontact"
                :disabled=!isAdmin()
                name="telephonecontact"
                key="phone-input"
                aria-describedby="telephonecontactFeedback"
                placeholder="Telephone contact"
              />
              
            </b-form-group>
          </b-form >
        </div>
      </b-col>
      <b-col cols="4">
        <div>
          <b-form >
            <b-form-group label="Adresse de  contact :">
              <b-form-input
                type="text"
                v-model="formUser.adrcontact"
                :disabled=!isAdmin()
              />
            </b-form-group>
            <b-form-group label="Complément d'adresse de  contact :">
              <b-form-input
                type="text"
                v-model="formUser.compadrcontact"
                :disabled=!isAdmin()
              />
            </b-form-group>

            <b-form-group id="CodePostal" label="Code Postal :" label-for="cp">
              <b-form-input
                v-model="cp"
                :disabled=!isAdmin()
                name="codepostal"
                key="cp"
                id="cp"
                type="number"
                placeholder="CP de la commune"
              />
            </b-form-group>
            <b-form-group 
              label="Commune"
              label-for="lstcommune" 
              require
              >
                <b-form-select 
                  class="liste-deroulante"
                  v-model="formUser.cpi_codeinsee"
                  :disabled=!isAdmin()
                  name="lstcommune"
                  >
                  
                  <option :value="null">-- Choix de la commune --</option>
                  <option
                    v-for="commune in listecommune"
                    :key="commune.cpi_codeinsee"
                    :value="commune.cpi_codeinsee"
                  >{{ commune.com_libellemaj}}</option>
                </b-form-select>
            </b-form-group>
        </b-form>
        <b-form>
          <b-form-group id="publiCheckGroup" >
            <b-form-checkbox-group
              v-model="formUser.publicontact"
              id="publiCheck"
              name="publiCheck"
            >
            </b-form-checkbox-group>
          </b-form-group>
        </b-form>
        </div>
      </b-col>
    </b-row>
    <p class="modal-btns">
      <b-button v-on:click="$modal.hide('editUser')">Annuler</b-button>
      <b-button variant="success" v-on:click="checkform">Enregistrer</b-button>
    </p>
  </b-container>
</template>
<script>
import Vue from "vue";
import moment from "moment";
import { mapState } from "vuex";

var loadFormUser = function (utilisateur) {
  let formUser = JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          nom: "",
          prenom: "",
          mail: "",
          naissance: "",
          profil: "",
          profilId: "",
          structure: "",
          structureLocale: "",
          statut: "",
          validated: "",
          eaps:"",
          publicontact: "",
          mailcontact: "",
          sitewebcontact: "",
          adrcontact: "",
          compadrcontact: "",
          cpi_codeinsee: "",
          cp: "",
          telephonecontact: ""

        },
        utilisateur
      )
    )
  );
  return formUser;
};

export default {
  props: {
    utilisateurSelectionne: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      cp: null,
      formUser: loadFormUser(this.$store.state.utilisateurSelectionne),
      listeprofil: [
        { text: "Administrateur", value: "1" },
        //{ text: "Partenaire", value: "2" },
        { text: "Formateur AAQ", value: "3" },
        { text: "Maître Nageur AAQ", value: "4" },
        { text: "Maître Nageur", value: "5" },
      ],
      //listeprofil: [{text:null, value:null}],
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
  methods: {
    checkform: function () {
      console.info("Validation du formulaire");
      this.erreurformulaire = [];
      var formOK = true;

      if (!this.formUser.nom) {
        this.erreurformulaire.push("Le nom");
        formOK = false;
      }
      if (!this.formUser.prenom) {
        this.erreurformulaire.push("Le prénom");
        formOK = false;
      }
      if (!this.formUser.mail) {
        this.erreurformulaire.push("Le mail");
        formOK = false;
      }

      if (!formOK) {
        console.info("Formulaire invalide", this.erreurformulaire);
        return;
      }

      return this.$store
        .dispatch("put_user", this.formUser)
        .then((message) => {
          console.info(message);
          this.$toast.success(
            `Utilisateur ${this.formUser.prenom} ${this.formUser.nom} mis à jour`,
            []
          );
          this.$store.dispatch("get_users");
          this.$modal.hide("editUser");
        })
        .catch((error) => {
          console.error(
            "Une erreur est survenue lors de la mise à jour de l'utilisateur",
            error
          );
        });
    },
    isAdmin: function(){
      if(this.$store.state.utilisateurCourant.profilId=="1") {
        return true;
      } else {
        return false;
      }
   },
    recherchecommune: function() {
      console.info("Recherche de la commune" + this.formUser.cp);
      if (this.formUser.cp.length === 5) {
        // Le code postal fait bien 5 caractères
        const url =
          process.env.API_URL +
          "/listecommune?codepostal=" +
          this.formUser.cp;
        console.info(url);
        return this.$axios
          .$get(url)
          .then(response => {
            this.listecommune = response.communes;
            console.info("recherchecommune : this.listecommune " + this.listecommune );
          })
          .catch(error => {
            console.error(
              "Une erreur est survenue lors de la récupération des communes",
              error
            );
          });
      } else {
        // On vide la liste car le code postal a changé
        this.listecommune = ["Veuillez saisir un code postal"];
        return Promise.resolve(null);
      }
    },   
  },
 watch: {
    "cp"() {
      console.info("Saisie CP");
      this.formUser.cp = this.cp;
      this.recherchecommune();
    },
 },

  computed: { ...mapState(["structures", "utilisateurCourant"]) 
  },
  async mounted() {
    await this.$store.dispatch("get_structures");
    await this.$store.dispatch("get_users");
    this.loading = false;
    // Si ce n'est pas l'admin alors il ne peut pas mettre
    // ce qu'il veut comme profil 
    if (!this.isAdmin())
    {
      var elementsSupprimes = this.listeprofil.splice(0, 2);
    }

    if(this.formUser.cp)
    {
      // Recopie du CP dans le champ code postal
      this.cp = this.formUser.cp
      // Recherche de la liste des commune
      this.recherchecommune()
      // Sélection de la commune correspondant à celle de l'utilisateur dans la liste
      //this.selectedCommune = this.user.cpi_codeinsee
    }

/*
this.listeprofil.pop()
    if (this.isAdmin)
    {
      this.listeprofil.push({text:'Administrateur',values:"1"})
      this.listeprofil.push({text:'Structure',values:"2"})
      this.listeprofil.push({text:'FormateurAAQ',values:"3"})
    }
    this.listeprofil.push({text:'MaitreNageurAAQ',values:"4"})
    this.listeprofil.push({text:'MaitreNageur',values:"5"})
  */
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

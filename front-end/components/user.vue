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
            v-model="role"
            :options="listeprofil"/>
        </b-form-group>
        <b-form-group v-if="renseignerstructureref()"
          label="Structure de dépendance"
          label-for="lststructureref" 
          required>
            <b-form-select 
              class="liste-deroulante"
              v-model="formUser.structurerefid"
              name="lststructureref"
              aria-describedby="lststructurerefFeedback">
              <option :value="null">-- Choix de la structure de référence --</option>
              <option
                v-for="structureref in listestructureref"
                :key="structureref.id"
                :value="structureref.id"
              >{{ structureref.libellecourt }}</option>
            </b-form-select>
        </b-form-group>   
        <!-- Si c'est un profil Structure ref,
            le changement de profil MN en MN AAQ entraine
            l'obligation de rentrer le formateur qui a assurer la formation
        -->
        <b-form-group 
          v-if="renseignerinstructeur()"
          label="* Instructeur ayant assuré la formation :"
          label-for="lstinstructeur" 
          required>
            <b-form-select 
              class="liste-deroulante"
              v-model="instructeurid"
              name="lstinstructeur"
              v-validate="{ required: true }"
              aria-describedby="lstinstructeurFeedback">
              <option :value="null">-- Choix de l'instructeur --</option>
              <option
                v-for="instructeur in listeinstructeur"
                :key="instructeur.id"
                :value="instructeur.id"
              >{{ instructeur.nom }} {{ instructeur.prenom }}</option>
            </b-form-select>
            <b-form-invalid-feedback id="lstinstructeurFeedback">Un instructeur doit être sélectionné.</b-form-invalid-feedback>
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
      formUser: loadFormUser(this.$store.state.utilisateurSelectionne),
      role: null,
      listeprofil: [
        { text: "Administrateur", value: "1" },
        { text: "Instructeur AAQ", value: "3" },
        { text: "Maître Nageur AAQ", value: "4" },
        { text: "Maître Nageur", value: "5" },
        { text: "Structure de référence", value: "6" },
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
      listeinstructeur: [
          {
            text: "Veuillez sélectionner un instructeur",
            value: null,
            id: null,
            nom: null,
            prenom: null,
            mail: null
        },
      ],
      instructeurid: null,
            listestructureref: [
        {
          text: "Veuillez sélectionner une structure de référence",
          value: null,
          id: null,
          libellecourt: null,
          courriel: null
        },
      ],

    };
  },
  methods: {
    checkform() {
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
      // On vérifie si c'est une structure de réféence et qu'elle passe le rôle à MNAAQ 
        // qu'il y avait bien une demande pour cet utiliteur.
        // Si oui alors on vérifique que l'instructeur a bien été renseigné.

      if(this.formUser.role =="4") {
        if(this.$store.state.utilisateurCourant.profilId=="6" || this.$store.state.utilisateurCourant.profilId=="3") {
          const url = process.env.API_URL + "/demandeaaq?demandeurid=" + this.formUser.id
          console.debug(url);
          this.$axios
            .$get(url)
            .then( response => {
              if(response && response.demandeaaq) {
                console.debug("Une demande en cours: " + response.demandeaaq.dem_id)
                var demandeaaq = response.demandeaaq
                const url = process.env.API_URL + '/demandeaaq/accord'

                // Lorsque c'est une structure référente qui fait la modification, alors l'id du formateur est mis à jour
                // Sinon le formateur avait été choisi par le 
                if (this.$store.state.utilisateurCourant.profilId=="6") {
                  demandeaaq['dem_uti_formateur_id'] = this.instructeurid
                }
                return this.$axios.$put(url, {demandeaaq})
                  .then(async demandeaaq => {
                    // Route pour les Maîtres nagueurs MN
                    //this.$router.push('/interventions')
                    console.debug("Mise à jour de la demande AAQ")
                  }).catch(error => {
                    const err = error.response.data.message || error.message
                    this.$toast.error(err)
                    return
                  })
              }
              else
              {
                console.debug("Aucune demande en cours")
              }
            })
            .catch(error => {
              console.error(
                "Une erreur est survenue lors de la vérification de la présence d'une demande AAQ",
                error);
              return;
            });
        }
      }
  
      if(this.$store.state.utilisateurCourant.profilId=="6" && this.formUser.role =="4") {
        if (!this.instructeurid) {
          this.erreurformulaire.push("Nom de l'instructeur obligatoire");
          formOK = false;
        }
      }
      // Si on est Admin et que l'on change le profil de l'utilisateur pour le
      // passer en Instructeur AAQ, alors on oblige la saisie de la structure
      // de rattachement
      if((this.formUser.role =="3" || this.formUser.role =="6") && (this.$store.state.utilisateurCourant.profilId=="1")) {
        if(!this.formUser.structurerefid) {
          this.erreurformulaire.push("Structure de dépendance obligatoire");
          formOK = false;        
        }
      }

      // 

      if (!formOK) {
        console.info("Formulaire invalide", this.erreurformulaire);
        // Affichage de l'erreur formulaire
        this.$toast.error(this.erreurformulaire)
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
    editUtilisateur() {
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
    isAdmin() {
      return this.utilisateurCourant && this.utilisateurCourant.profilId=="1"
    },
    renseignerinstructeur() {
      return this.utilisateurCourant.profilId=="6" && this.formUser.role =="4"
    },
    // Recherche s'il faut faire apparaitre le fait de saisir une structure de référence
    renseignerstructureref() {
      return this.utilisateurCourant.profilId=="1" && (this.formUser.role =="3" || this.formUser.role =="6")
    }, 
    rechercheinstructeurs() {
      log.i('rechercheinstructeurs - In')
      if(this.$store.state.utilisateurCourant.profilId=="6") {
        // Lance la recherche sur la liste des formateurs 
        const url = process.env.API_URL + "/user/liste/3"
        return this.$axios.$get(url)
          .then(response => {
            log.i('rechercheinstructeurs - Done')
            return this.listeinstructeur = response.users;
          })
          .catch(error => {
            log.w('rechercheinstructeurs -', error)
            return this.$toast.error("Une erreur est survenue lors de la récupération des instructeurs")
        });
      }
    },
    recherchestructureref() {
      log.i('recherchestructureref - In')
      // Lance la recherche sur la liste des formateurs 
      const url = process.env.API_URL + "/structureref/liste/"
      return this.$axios.$get(url)
        .then(response => {
          log.i('recherchestructureref - Done')
          return this.listestructureref = response.structureref;
        })
        .catch(error => {
          log.i('recherchestructureref -', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des structures de référence")
        });
      },   
    },
  watch: {
      cp() {
        log.i('cp - saisie du CP')
        this.formUser.cp = this.cp;
        return this.rechercheCommune();
      },
      role() {
        log.i('cp - saisie du CP')
        this.formUser.role = this.role;
        this.renseignerinstructeur();
    }
  },
  computed: { 
    ...mapState(["utilisateurCourant"]) 
  },
  async mounted() {
    log.i('mounted - In')
    await this.$store.dispatch("get_users");
    await this.rechercheinstructeurs();
    // Chargement de la liste des structures de référence
    await this.recherchestructureref() 
    this.role = this.formUser.role;
    if (!this.isAdmin()) {
      // On supprimes les possibilités de profils si on n'est pas Admin
      // On retire les deux premiers éléments en position 0
      this.listeprofil.splice(0, 2);
      // On retire un élément en position 2
      this.listeprofil.splice(2, 1);
      // Il doit rester MN et MN AAQ 
    }
    if(this.formUser.cp) {
      // Recopie du CP dans le champ code postal
      this.cp = this.formUser.cp
      // Recherche de la liste des commune
      this.rechercheCommune()
    }
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

.hr {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>

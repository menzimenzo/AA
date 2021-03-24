<template>
  <div>
    <b-card class="mb-3">
      <b-form>
        <b-form-group
          id="emailInputGroup"
          label="Courriel :"
          label-for="emailInput"
          required
        >
          <b-form-input
            id="emailInput"
            type="email"
            v-model="user.mail"
            required
            name="mail"
            key="email-input"
            v-validate="{ required: true, email: true }"
            aria-describedby="emailFeedback"
            placeholder="Courriel"
            :disabled="!isUserRegisteredViaPwd"
          />
        </b-form-group>
        <b-form-group label="Prénom :" >
          <b-form-input type="text" v-model="user.prenom" :disabled="isUserRegisteredViaPwd" />
        </b-form-group>
        <b-form-group label="Nom :">
          <b-form-input type="text" v-model="user.nom" :disabled="isUserRegisteredViaPwd" />
        </b-form-group>

<!--
        <b-form-group
          required
          id="structNationaleGroup"
          label="Structure nationale :"
          label-for="structNatSelect"
        >
    
          <b-form-select
            id="structNatSelect"
            v-model="user.structureId"
            v-validate="{ required: true, min_value: 1 }"
            name="struct"
            :state="validateState('struct')"
            aria-describedby="structFeedback"
            :disabled="!checkLegal"
          >
            <option value="0">Veuillez choisir votre structure...</option>
            <option
              v-for="structure in listeStructures"
              :key="structure.str_id"
              :value="structure.str_id"
            >
              {{ structure.str_libelle }}
            </option>
          </b-form-select>
          
        </b-form-group>

        <div v-if="user.structureLocale != ''" >
          <b-form-group
            id="structLocaleGroup"
            label="Structure locale :"
            required
            label-for="structLocaleInput"
            key="structurelocale"
          >
            <b-form-input
              v-validate="{ required: true }"
              name="structLoc"
              :state="validateState('structLoc')"
              aria-describedby="structLocFeedback"
              id="structLocaleInput"
              type="text"
              v-model="user.structureLocale"
              placeholder="Nom de la structure locale"
            />
            <b-form-invalid-feedback id="structLocFeedback">
              La structure locale est obligatoire.
            </b-form-invalid-feedback>
          </b-form-group>
        </div>
        -->


        <b-form-group 
          label="Numéro de carte professionnelle :"
          id="eapsInputGroup"
          label-for="eapsInput"
          required
          >
          <b-form-input
            id="eapsInput"
            type="text"
            v-model="user.eaps"
            name="eaps"
            key="eaps-input"
            v-validate="{ required: true, numeric: false }"
            aria-describedby="eapsFeedback"
            placeholder="Numéro de carte professionnelle"
            :state="validateState('eaps')"
          />
           <b-form-invalid-feedback id="prenomFeedback"
            >Le numéro de carte professionnelle est obligatoire.</b-form-invalid-feedback
          >
        </b-form-group>        
      </b-form>
      
    </b-card>

<b-card class="mb-3">
      <b-form>
        <b-form-group id="publiCheckGroup" >
          <b-form-checkbox-group
            v-model="user.publicontact"
            id="publiCheck"
            :state="validateState('publiCheck')"
            name="publiCheck"
          >
            <b-form-checkbox >
              Je souhaite que ces données soient publiées sur le site "prévention des noyades" et qu'elles apparaissent sur la cartographie             

            </b-form-checkbox> 
          </b-form-checkbox-group>
        </b-form-group>
      </b-form>
      <!--<div v-if="user.publicontact==true">-->
      <div>
        <b-form >
          <b-form-group label="Site Web de contact :">
            <b-form-input
              v-model="user.sitewebcontact"
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
              v-model="user.mailcontact"
              name="mailcontact"
              key="email-input"
              v-validate="{ email: true }"
              aria-describedby="emailcontactFeedback"
              placeholder="Courriel contact"
              :state="validateState('mail')"
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
              v-model="user.telephonecontact"
              name="telephonecontact"
              key="phone-input"
              aria-describedby="telephonecontactFeedback"
              placeholder="Telephone contact"
            />
            
          </b-form-group>
          <b-form-group label="Adresse de  contact :">
            <b-form-input
              type="text"
              v-model="user.adrcontact"
            />
          </b-form-group>
          <b-form-group label="Complément d'adresse de  contact :">
            <b-form-input
              type="text"
              v-model="user.compadrcontact"
            />
          </b-form-group>

          <b-form-group id="CodePostal" label="Code Postal :" label-for="cp">
            <b-form-input
              v-model="cp"
              name="cp"
              key="cp"
              :state="validateState('cp')"
              aria-describedby="cpFeedback"
              id="cp"
              type="number"
              placeholder="CP de la commune"
            />
          </b-form-group>
          <b-form-group 
            label="Commune">
              <b-form-select 
                class="liste-deroulante"
                v-model="selectedCommune">
                <option :value="null">-- Choix de la commune --</option>
                <option
                  v-for="commune in listecommune"
                  :key="commune.cpi_codeinsee"
                  :value="commune.cpi_codeinsee"
                >{{ commune.com_libellemaj}}</option>
              </b-form-select>
          </b-form-group>
       </b-form>
      </div>
      <b-form>
        <b-form-group>
          <span style="color: red">*</span> : Champ obligatoire
        </b-form-group>
      </b-form>
    </b-card>    
    <div class="mb-3 text-right">
      <b-button
        @click="submit"
        variant="success"
        :disabled="
          errors.any() || (isLegalChecked == 'false' && !user.validated)
        "
        >{{ submitTxt }}</b-button
      >
    </div>
  </div>
  
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      // Pour le champ code postal
      cp: null,
      // Pour le champ Commune
      selectedCommune: null,
      // Liste qui contient la liste des communes
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
  props: ["user", "submitTxt", "isLegalChecked"],
  methods: {
    submit: function () {
      this.$validator.validateAll().then((isValid) => {
        if (isValid) {
          this.$emit("submit");
        }
      });
    },
    validateState(ref) {
      if (!this.veeFields) {
        return null;
      }
      if (
        this.veeFields[ref] &&
        (this.veeFields[ref].dirty || this.veeFields[ref].validated)
      ) {
        return !this.errors.has(ref);
      }

      return null;
    },
    recherchecommune: function() {
      // Recopie du CP dans le CP User
      this.user.cp = this.cp
      if (this.user.cp.length === 5) {
        // Le code postal fait bien 5 caractères
        const url =
          process.env.API_URL +
          "/listecommune?codepostal=" +
          this.user.cp;
        // Retourne la liste des communes associées au Code postal
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
      // On recherche la liste des communes lors de la modification du Code postal
      this.recherchecommune();
    },
  },
  async mounted() {
    await this.$store.dispatch("get_structures");

    // Chargement du CP et liste commune + sélection
    if(this.user.cp)
    {
      // Recopie du CP dans le champ code postal
      this.cp = this.user.cp
      // Recherche de la liste des commune
      this.recherchecommune()
      // Sélection de la commune correspondant à celle de l'utilisateur dans la liste
      this.selectedCommune = this.user.cpi_codeinsee
    }
  },
  computed: {
    /*
    ...mapState(["structures"]),
    listeStructures() {
      var liste = this.structures;
      if (this.user.mail.indexOf(".gouv.fr") != -1) {
        return liste;
      } else {
        
        liste = this.structures.filter((str) => {
          var isMatch = true;
          isMatch =
            isMatch &
            (String(str.str_libellecourt) != "DS")
          return isMatch;
        });
        return liste;
      }
    },
    */
    isUserRegisteredViaPwd() {
      return Boolean(this.user && this.user.tokenFc);
    },
  },
};
</script>

<style>
</style>


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
            v-model="mail"
            required
            name="mail"
            key="email-input"
            v-validate="{ required: true, email: true }"
            aria-describedby="emailFeedback"
            placeholder="Courriel"
            :state="validateState('mail')"
            :disabled="!isUserRegisteredViaPwd"
          />

          <b-form-invalid-feedback id="emailFeedback"
            >Le courriel est obligatoire et doit être
            valide.</b-form-invalid-feedback
          >
        </b-form-group>
        <b-form-group 
          label="Prénom :"
          id="prenomInputGroup"
          label-for="prenomInput"
          required
          >
          <b-form-input
            id="prenomInput"
            type="text"
            v-model="user.prenom"
            name="prenom"
            key="prenom-input"
            v-validate="{ required: true }"
            aria-describedby="prenomFeedback"
            placeholder="Prénom"
            :disabled="isUserRegisteredViaPwd"
            :state="validateState('prenom')"
          />
           <b-form-invalid-feedback id="prenomFeedback"
            >Le prénom est obligatoire.</b-form-invalid-feedback
          >
        </b-form-group>
        <b-form-group 
          label="Nom :"
          id="nomInputGroup"
          label-for="nomInput"
          required
          >
          <b-form-input
            id="nomInput"
            type="text"
            v-model="user.nom"
            name="nom"
            key="nom-input"
            v-validate="{ required: true}"
            aria-describedby="nomFeedback"
            placeholder="Nom"
            :disabled="isUserRegisteredViaPwd"
            :state="validateState('nom')"
          />
           <b-form-invalid-feedback id="nomFeedback"
            >Le nom est obligatoire.</b-form-invalid-feedback
          >
        </b-form-group>
       <b-form-group 
          label="Numéro de carte professionnelle :"
          id="eapsInputGroup"
          label-for="eapsInput"
          required
          v-if="user.profilId!=1"
          >
          <b-form-input
            id="eapsInput"
            type="text"
            required
            v-model="user.eaps"
            name="eaps"
            key="eaps-input"
            v-validate="{ required: true, regex: /[0-9]{5}ED[0-9]{4}/ }"
            :state="validateState('eaps')"
            aria-describedby="eapsFeedback"
            placeholder="Numéro de carte professionnelle"
          />
           <b-form-invalid-feedback id="eapsFeedback"
            >Le format de la carte professionnelle n'est pas respecté.</b-form-invalid-feedback
          >
        
        </b-form-group>
      </b-form>
    </b-card>
    <b-card class="mb-3">
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
              name="codepostal"
              key="cp"
              :state="validateState('codepostal')"
              v-validate="{ length:5,numeric:true}"
              aria-describedby="cpFeedback"
              id="cp"
              type="number"
              placeholder="CP de la commune"
            />
            <b-form-invalid-feedback id="cpFeedback">Le code postal doit contenir 5 caractères.</b-form-invalid-feedback>
          </b-form-group>
          <b-form-group 
            v-if="cp"
            label="Commune"
            label-for="lstcommune" 
            require
            >
              <b-form-select 
                class="liste-deroulante"
                v-model="user.cpi_codeinsee"
                name="lstcommune"
                v-validate="{ required: true, min:5, max:5}"
                :state="validateState('lstcommune')"
                aria-describedby="lstcommuneFeedback"
                >
                
                <option :value="null">-- Choix de la commune --</option>
                <option
                  v-for="commune in listecommune"
                  :key="commune.cpi_codeinsee"
                  :value="commune.cpi_codeinsee"
                >{{ commune.com_libellemaj}}</option>
              </b-form-select>
              <b-form-invalid-feedback id="lstcommuneFeedback">Une commune doit être sélectionnée avec un code postal valide.</b-form-invalid-feedback>
          </b-form-group>
       </b-form>
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
      </div>

    <b-card>    
      <b-form-group id="legalCheckGroup" >
        <b-form-checkbox-group
          v-model="accordHonneur"
          id="accordHonneur"
          name="accordHonneur"
        >
          <b-form-checkbox value="true">
            <span style="color: red">*</span> En cochant cette case « je certifie sur l'honneur l'exactitude des informations ci-dessus ».
          </b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>    
    </b-card> 

      <b-form>
        <b-form-group>
          <span style="color: red">*</span> : Champ obligatoire
        </b-form-group>
        <div class="mb-3 text-right">
          <b-button
            @click="submit"
            variant="success"

            >{{ submitTxt }}</b-button
          >
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      cp: null,
      isPubliChecked:"false",
      accordHonneur: false,
      /*listtypecol: [
        { text: "Commune", value: 1 },
        { text: "Conseil Général", value: 2 },
        { text: "EPCI", value: 3 },
      ],
      listdepartement: null,
      listepci: null,
      cpEpci: null,
      boolEpci: false,
      listecommune: [
        {
          text: "Veuillez saisir un code postal",
          value: null,
          insee: null,
          cp: null,
          codedep: null,
        },
      ],*/
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
  props: ["submitTxt", "user", "checkLegal"],
  methods: {
    submit: function () {

      
      this.$validator.validateAll().then((isValid) => {

        if (this.accordHonneur) { 
          if (isValid) {
            this.$store.dispatch("set_state_element", {
              key: "utilisateurCourant",
              value: this.user,
            });
            return this.$emit("submit");
          }
          else
          {
            this.$toast.error('Veuillez vérifier la validité des champs.');
          }
        }
        else
        {
          // On vide le CodeInsee si le CP n'est pas complet
          this.user.cpi_codeinsee = null          
          this.$toast.error('Veuillez certifier sur l\'honneur l\'exactitude des informations déclarées.');

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
      console.info("Recherche de la commune" + this.user.cp);
      if (this.user.cp.length === 5) {
        // Le code postal fait bien 5 caractères
        const url =
          process.env.API_URL +
          "/listecommune?codepostal=" +
          this.user.cp;
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
   
    emitUser: function () {
      return this.$store.dispatch("set_state_element", {
        key: "utilisateurCourant",
        value: this.user,
      });
    },
  },
 watch: {
    "cp"() {
      console.info("Saisie CP");
      this.user.cp = this.cp;
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
      //this.selectedCommune = this.user.cpi_codeinsee
    }
  },
  computed: {
    ...mapState(["structures"]),
    mail: {
      get() {
        return this.$store.state.utilisateurCourant.mail;
      },
      set(value) {
        return this.$store.dispatch("set_state_element", {
          key: "utilisateurCourant.mail",
          value,
        });
      },
    },
    isUserRegisteredViaPwd() {
      return Boolean(this.user && this.user.tokenFc);
    },
    listeStructures() {
      var liste = this.structures;
      if (this.mail && this.mail.indexOf(".gouv.fr") != -1) {
        return liste;
      } else {
        if (!this.user.typeCollectivite) {
          liste = this.structures.filter((str) => {
            var isMatch = true;
            isMatch =
              isMatch &
              (String(str.str_libellecourt) != "DS") &
              (String(str.str_libellecourt) != "DEP") &
              (String(str.str_libellecourt) != "EPCI") &
              (String(str.str_libellecourt) != "COM");
            return isMatch;
          });
        }
        return liste;
      }
    },
  },
};
</script>

<style>
</style>


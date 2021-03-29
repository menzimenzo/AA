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
          :state="validateState('mail')"
          :disabled="!isUserRegisteredViaPwd"
          />
        <b-form-invalid-feedback id="emailFeedback">Le courriel est obligatoire et doit être valide.</b-form-invalid-feedback>
      </b-form-group>


        <b-form-group label="Prénom :" >
          <b-form-input type="text" v-model="user.prenom" :disabled="isUserRegisteredViaPwd" />
        </b-form-group>
        <b-form-group label="Nom :">
          <b-form-input type="text" v-model="user.nom" :disabled="isUserRegisteredViaPwd" />
        </b-form-group>

        <b-form-group 
          label="Numéro de carte professionnelle :"
          id="eapsInputGroup"
          label-for="eapsInput"
          required
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
           <b-form-invalid-feedback id="eapsFeedback">Le format de la carte professionnelle n'est pas respecté.</b-form-invalid-feedback>
        </b-form-group>        
      </b-form>
      
    </b-card>

<b-card class="mb-3">

      <!--<div v-if="user.publicontact==true">-->
        <!--v-validate="{url: {require_protocol: true }}" -->
      <div>
        <b-form >
          <b-form-group label="Site Web de contact :">
            <b-form-input
              v-model="user.sitewebcontact"
              name="siteweb"

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
              placeholder="Courriel contact"
              :state="validateState('mailcontact')"
              aria-describedby="emailcontactFeedback"
              />
        <b-form-invalid-feedback id="emailcontactFeedback">Le courriel est obligatoire et doit être valide.</b-form-invalid-feedback>

 
            
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

             <b-form>
        <b-form-group id="publiCheckGroup" >
          <b-form-checkbox-group
            v-model="user.publicontact"
            id="publiCheck"
          >
            <b-form-checkbox >
              Je souhaite que ces données soient publiées sur le site "prévention des noyades" et qu'elles apparaissent sur la cartographie             

            </b-form-checkbox> 
          </b-form-checkbox-group>
        </b-form-group>
      </b-form>
      </div>
      <b-form>
        <b-form-group>
          <span style="color: red">*</span> : Champ obligatoire
        </b-form-group>
      </b-form>
    </b-card>   
    
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
     
    <div class="mb-3 text-right">
      <b-button
        @click="submit"
        variant="success"

        >{{ submitTxt }}</b-button
      >
    </div>
  </div>
  
</template>
  <!--(errors.any()==false  || accordHonneur==false)
  
          :disabled="
        errors.any()==true
        "
  -->

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      // Validité de concentement
      accordHonneur: false, 
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
  props: ["user", "submitTxt", "checkLegal"],
  methods: {
    submit: function () {
      this.$validator.validateAll().then((isValid) => {
        if (this.accordHonneur) { 
          if (isValid) 
          {
            this.$emit("submit");
          } 
          else 
          {
            this.$toast.error('Veuillez vérifier la validité des champs.');
          }
        }
        else
        {
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
    "isValid"() {
        console.log("watch Validité " + this.isValid)
    },
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


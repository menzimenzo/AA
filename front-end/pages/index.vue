<template>
  <b-container >
    <b-row style="
    margin-top:1%">
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>

      </b-col>
      <b-col   class="col-8 col-md-4" >
        <b-row >
          <p class="aa-bouton-connexion"  v-if="this.b_MN" @click="SeLoguer('MN')">▷ Je suis maître nageur/formateur<br>Je m’identifie et renseigne mes données<br><br></p>
        </b-row>
        <b-row >
          <p class="aa-bouton-connexion" v-if="this.b_AS" @click="SeLoguer('AS')">▷ J'appartiens à une structure actrice du dispositif AAQ<br><br></p>
        </b-row>
      </b-col>
    </b-row>
    <div v-if="b_MN^b_AS">
      <b-row>
        <b-col cols="8" offset-md="2">
          <connectionForm @submit="login"/>
        </b-col>
      </b-row>
      <b-row class="text-center">
        <b-col cols="12">
          <span class="otherConnexion">Ou</span>
        </b-col>
      </b-row>
      <b-row class="text-center" >
        <b-col cols="12">
          <b-img class="fcBtn" @click="connexionutilisateur()"  fluid  :src="require('assets/FCboutons-10.png')" border="0" style="size: 100%;" />
          <br>
          <a
            href="https://franceconnect.gouv.fr/"
            target="_blank"
            style="text-align:center;" 
            >A propos de FranceConnect</a>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>


<script>
export default {
  components: {
    connectionForm: () => import('~/components/connectionForm.vue')
  },
  data() {
    return {
      // Booleen Maitre nageur
      b_MN: true,
      // Booleen agent de structure
      // V1 : On ne permet pas l'affichage du bouton Partenaire
      b_AS: false
    };
  },
//
//  RECHERCHE DE LA COMMUNE PAR CODE POSTAL
//
  methods: {
    connexionutilisateur: function() {
      console.info("Recherche de l'utilisateur");
      const url = process.env.API_URL + '/connexion/login'
      console.info(url);
      this.$axios.$get(url)
      .then(response => {
        window.location.replace(response.url)
      }).catch(err => {
        console.log(err)
      })
    },
    login: function(e) {
      return this.$store.dispatch('login', e)
        .then(() => {
            console.log('login success!')
            this.formErrors = []
            this.$modal.hide('connexionForm')
            // Route pour les Maîtres nagueurs MN
            console.log("route accueil index racine page")

            if (this.$store.state.utilisateurCourant.profilId == 1) {
              return this.$router.push('/admin')
            }
            if (this.$store.state.utilisateurCourant.profilId == 2) {
              return this.$router.push('/partenaire')
            }
            if (this.$store.state.utilisateurCourant.profilId == 3) {
              return this.$router.push('/formateur')
            }
            if (this.$store.state.utilisateurCourant.profilId == 4) {
              //return this.$router.push('/interventions')
              return this.$router.push('/pageenconstruction')
            } else
            {
              return this.$router.push('/accueil')
            }
            
        })
        .catch((e) => {
            console.log('Error during login process', e.stack)
        })
        .finally(() => {
            this.loading = false
        })
    },
    // Fonction permettant d'afficher dynamiquement la partie Login
    SeLoguer: function(e) {
      // V1 : On ne permet pas de basculer d'un bouton à l'autre
      return
      // Return à supprimer pour faire fonctionne le switch des boutons
      if (e === "AS")  {
        //this.b_MN = !this.b_MN
        this.$toast.info("Ce profil n'est pas encore accessible.")
        }
      if (e === "MN")  {this.b_AS = !this.b_AS;}
    }

  },

//
//  CHARGEMENT ASYNCHRONE DES INTERVENTIONS
//
  async mounted() {
    console.info("mounted home");
    
  }
};
</script>


<style>
.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}
.links {
  padding-top: 15px;
}
.fcBtn{
  cursor: pointer;
  margin-bottom: 10px;
}
.aa-welcome-title {
  margin-top: 0vw;
  font-size: 3em;
  font:bold;
  font-family: Arial ;
  --text-transform: uppercase;
  color: rgb(0,0,128)
}
.aa-bouton-connexion {
  cursor: pointer;
  padding-left: 1vw;
  width: 50em;
  padding-right: 1vw;
  font-size: 100%;
  font-family: sans-serif ;
  text-align: left;
  background-color: #104F9F;
  color:white
}

.link-alignement {
  min-width: 80%;
  min-height: 56px;
}
.otherConnexion {
  font-size: 30px;
  color: #e5425a;
  margin: 20px 0;
}
.otherConnexion:before, .otherConnexion:after {
    display: inline-block;
    margin: 0 0 8px 0;
    height: 3px;
    content: " ";
    text-shadow: none;
    background-color: #e5425a;
    width: 200px;
}
.otherConnexion:before {
  margin-right: 20px;
}
.otherConnexion:after {
  margin-left: 20px;
}
@media screen and (min-width: 2000px) {
  .aa-welcome-title {
    margin-top: 100px;
  }
}
</style>


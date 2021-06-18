<template>
  <b-container >
    <b-row style="margin-top:1%">
      <b-col class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col class="col-8 col-md-4" >
        <b-row >
          <p class="aa-bouton-connexion"  @click="SeLoguer(1)">▷ Je suis maître nageur<sup>(1)</sup><br>Je m’identifie et renseigne mes données<br><br></p>
        </b-row>
        <b-row >
          <p class="aa-bouton-connexion" @click="SeLoguer(2)">▷ J'appartiens à une structure actrice du dispositif AAQ<br><br></p>
        </b-row>
      </b-col>
    </b-row>
    <div v-if="connexionType">
      <b-row>
        <b-col cols="8" offset-md="2">
          <connectionForm @submit="login" :connexionType="this.connexionType"/>
        </b-col>
      </b-row>
      <b-row class="text-center" v-if="this.fc">
        <b-col cols="12">
          <span class="otherConnexion">Ou</span>
        </b-col>
      </b-row>
      <b-row class="text-center" v-if="this.fc">
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
    

    <div>

      <b-row class="text-center" >
        <b-col cols="12">
          <br>
          <span class="renvoiBasDePage">
            (1) un maitre-nageur est un éducateur sportif professionnel détenteur d’une carte professionnelle, qualifié pour encadrer contre rémunération l’apprentissage de la natation (ex : BPJEPS AAn, DEJEPS Triathlon, Licence staps entrainement sportif « natation » ...)
          </span>
            
        </b-col>
      </b-row>
      <div v-if="fc">
        <b-row class="text-center">
          <b-col cols="12">
            <span class="otherConnexion">Ou</span>
          </b-col>
        </b-row>
        <b-row class="text-center">
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
    </div>
    <b-row class="text-center" >
      <b-col cols="12">
        <br>
        <span class="renvoiBasDePage">
          (1) un maitre-nageur est un éducateur sportif professionnel détenteur d’une carte professionnelle, qualifié pour encadrer contre rémunération l’apprentissage de la natation (ex : BPJEPS AAn, DEJEPS Triathlon, Licence staps entrainement sportif « natation » ...)
        </span>          
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import logger from '~/plugins/logger'
const log = logger('pages:index')

export default {
  components: {
    connectionForm: () => import('~/components/connectionForm.vue')
  },
  data() {
    return {
      connexionType: null,
      fc: false
    };
  },
  methods: {
    connexionutilisateur: function() {
      const url = process.env.API_URL + '/connexion/login'
      log.i('connexionutilisateur - In', { url })
      this.$axios.$get(url)
      .then(response => {
        log.i('connexionutilisateur - Done')
        window.location.replace(response.url)
      }).catch(err => {
        log.w('connexionutilisateur - error', { error })
      })
    },
    login: function(e) {
      log.i('login - In')
      return this.$store.dispatch('login', e)
        .then(() => {
            log.i('login - done - gestion de l\'utilisateur courant.')
            this.formErrors = []
            this.$modal.hide('connexionForm')
            // Route pour les Maîtres nagueurs MN
            if (this.$store.state.utilisateurCourant.profilId == 1) {
              return this.$router.push('/admin')
            }
            if (this.$store.state.utilisateurCourant.profilId == 2) {
              return this.$router.push('/partenaire')
            }
            if (this.$store.state.utilisateurCourant.profilId == 3) {
              return this.$router.push('/formateur')
            }
            if (this.$store.state.utilisateurCourant.profilId == 6) {
              return this.$router.push('/structureref')
            }
            if (this.$store.state.utilisateurCourant.profilId == 4) {
              return this.$router.push('/interventions')
            } else
            {
              return this.$router.push('/accueil')
            }            
        })
        .catch((e) => {
            log.w('login - error', e.stack)
        })
        .finally(() => {
            this.loading = false
        })
    },
    // Fonction permettant d'afficher dynamiquement la partie Login
    // V1 : On ne permet pas de basculer d'un bouton à l'autre
    SeLoguer: function(e) {
        this.connexionType = e
    }
  },
  async mounted() {
    log.i("mounted home - In");
    const url = process.env.API_URL + '/parametres/fcactif'
      this.$axios.$get(url)
      .then(response => {
        if (response) {
          log.d("mounted home - France Connect Actif", response)
          this.fc = true
        } else {
          log.d("mounted home - France Connect Inactif")
          this.fc = false
        }
        log.i("mounted home - done")
      }).catch(err => {
        log.w("mounted home - Error on mounted", err);
      })
  }
};
</script>

<style>
.renvoiBasDePage {
  text-align: center;
  color:gray
}
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


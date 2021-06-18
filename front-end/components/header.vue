<template>
  <b-container>
    <b-row class="text-center main-header">
      <b-col cols="2">
        <nuxt-link to="/" title="Afficher la page d'accueil" style="text-decoration: none" >
          <b-img fluid :src="require('assets/Gouvernement_PiloteMS.jpg')" blank-color="rgba(0,0,0,0.5)" />
        </nuxt-link>
      </b-col>
      <b-col cols="5">
        <p class="aa-welcome-title">Aisance Aquatique</p>
      </b-col>
    </b-row>
    <div class="accountMenu" v-if="utilisateurCourant">
      <nuxt-link to="/pageenconstruction" v-if="utilisateurCourant.profilId == 3 || utilisateurCourant.profilId == 4" class="menuLink">
        <b-img fluid :src="require('assets/ico_nage.png')" blank-color="rgba(0,0,0,0.5)" img-alt="Interventions" />
        Interventions 
      </nuxt-link>
      <nuxt-link to="/admin" >
        <b-button variant="outline-primary" v-if="utilisateurCourant.profilId == 1" class="settingsBtn">
          <i class="material-icons" >settings</i> Espace admin
        </b-button>
      </nuxt-link>
      <nuxt-link to="/partenaire" v-if="utilisateurCourant.profilId == 2">
        <b-button variant="outline-primary" class="settingsBtn">
          <i class="material-icons" >settings</i> Espace partenaire
        </b-button>
      </nuxt-link>
      <nuxt-link to="/formateur" v-if="utilisateurCourant.profilId == 3" class="menuLink">
        <b-img fluid :src="require('assets/ico_diplome.png')" blank-color="rgba(0,0,0,0.5)" img-alt="Espace Instructeur" />
        Espace Instructeur
      </nuxt-link>
      <b-dropdown  id="accountBtn"  >
        <template slot="button-content">{{utilisateurCourant && utilisateurCourant.prenom}} {{utilisateurCourant && utilisateurCourant.nom}}</template>
        <b-dropdown-item to="/connexion/profil">
          Mon compte
        </b-dropdown-item>
        <b-dropdown-item href="#" @click.prevent="logout()">Se déconnecter</b-dropdown-item>
      </b-dropdown>
    </div>
  </b-container>
  
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['utilisateurCourant']),
  methods: {
    logout() {
      return this.$axios.$get(process.env.API_URL + '/connexion/logout').then(async response => {
        response.url ? window.location.replace(response.url) : this.$router.push('/')
        return this.$store.dispatch('logout')
      })
    }
  }
};
</script>

<style>
.main-header {
  margin-bottom: 20px;
}
.accountMenu {
  position: absolute;
  top: 10px;
  right: 15px;
  z-index: 10;
  display: inline-flex;
}
.accountMenu .menuLink img {
  margin-right: 10px;
}
.accountMenu .menuLink {
  position: relative;
  text-decoration: none;
  margin-right: 10px;
  padding-right: 5px;
  transition: all ease-in-out 0.3s;
}
.accountMenu .menuLink:hover {
  color: #FFBA35;
}
.accountMenu .menuLink:hover::after {
  content: "";
  position: absolute;
  left:0;
  width: 100%;
  bottom: 0;
  border: 1px solid #FFBA35;
}
#accountBtn button{
  background-color: white;
  color: #666;
  border: 0px solid #FFBA35;
  border-bottom: 1px solid #FFBA35;
  border-radius: 0px;
}
.settingsBtn {
  margin-right: 10px;
  background-color: white; 
}
.settingsBtn i {
  position: relative;
  top: 4px;
}
</style>

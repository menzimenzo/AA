<template>
    <b-container>
      <b-row>
        <b-col cols="12">
          <h5>Ajouter un document: </h5> 
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="5">
            <b-form-group label="Libellé:">
                <b-form-input type="text" v-model="libelle" />
            </b-form-group>
        </b-col>
        <b-col cols="5">
            <b-form-group label="Fichier:">
              <b-form-file v-model="file" placeholder="Choisissez un fichier..." :browse-text="'Parcourir'"/>
            </b-form-group>
        </b-col>
        <b-col cols="2">
            <b-btn variant="primary" style="margin-top: 1.9rem !important;" @click="uploadFile()" :disabled="!file || !libelle.length">Ajouter</b-btn>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12">
          <h5 >Documents disponibles: </h5>
          <ul v-if="documents.length > 0">
            <li v-for="doc in documents" :key="doc.doc_id" >
              {{doc.doc_libelle}}
              <b-img class="img-icon" fluid  @click="downloadDoc(doc)" :src="require('assets/pdf-240x240.png')" blank-color="rgba(0,0,0,0.5)" />
              <b-button variant="danger" class="ml-3" @click="deleteFile(doc.doc_id)" size="sm"><i class="material-icons">delete</i></b-button>
            </li>
          </ul>
          <div v-else>Aucun document disponible</div>
        </b-col>
      </b-row>
    </b-container>
</template>
<script>
import { mapState } from 'vuex'

import logger from '~/plugins/logger'
const log = logger('components:fileUpload')

export default {
  data() {
    return {
      file: null,
      libelle: ""
    };
  },
  computed: {
    ...mapState(['documents'])
  },
  methods: {
    uploadFile: function() {
      log.i('uploadFile - In')
      let formData = new FormData()
      formData.append('file', this.file)
      formData.append('libelle', this.libelle)
      return this.$axios.post(process.env.API_URL + '/documents', formData)
        .then(res => {
          log.i('uploadFile - Done')
          return this.$store.dispatch('get_documents')
        }).catch(error => {
          log.w('uploadFile - error', error)
          return this.$toast.error('Une erreur est survenue lors du dépot de votre document.')
          })
    },
    deleteFile: function(id) {
      log.i('deleteFile - In')
      return this.$axios.delete(process.env.API_URL + '/documents/' + id)
        .then(res => {
          log.i('deleteFile - Done', res)
          return this.$store.dispatch('get_documents')
        }).catch(err => {
            log.w('deleteFile - error', error)
            return this.$toast.error('Une erreur est survenue lors de la suppression du document.')
        })
    },
    downloadDoc: function(doc) {
      log.i('downloadDoc - In')
      this.$axios({
        url: process.env.API_URL + '/documents/'+doc.doc_id,
        method: 'GET',
        responseType: 'blob'
      }).then((response) => {
          log.d('downloadDoc - Response from the server')
           // Crée un objet blob avec le contenue du CSV et un lien associé
          const url = window.URL.createObjectURL(new Blob([response.data]))
          // Crée un lien caché pour télécharger le fichier
          const link = document.createElement('a')
          link.href = url
          const fileName = doc.doc_filename
          link.setAttribute('download', fileName)
          // Télécharge le fichier
          link.click()
          link.remove()
          log.i('downloadDoc - Done')
      }).catch(err => {
          log.w('deleteFile - error', error)
          return this.$toast.error('Une erreur est survenue lors du téléchargement du document.')
      })
    },
  },
  mounted(){
    this.$store.dispatch('get_documents')
  }
};
</script>

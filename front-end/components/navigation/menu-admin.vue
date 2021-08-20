<template>
    <div>
        <b-btn
          block
          v-b-toggle.liste-compte-aaq
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(0)"
          :class="activeTab === 0 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-1">people</i> Gestion des comptes utilisateurs
          </h4>
        </b-btn>
        <b-btn
          block
          v-b-toggle.tableaux-de-bord
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(1)"
          :class="activeTab === 1 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-1">leaderboard</i> Tableaux de bord
          </h4>
        </b-btn>        
        <b-btn
          block
          v-b-toggle.publication-document
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(2)"
          :class="activeTab === 2 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-1">cloud_upload</i> Publication des documents
          </h4>
        </b-btn>

    </div>
</template>

<script>
export default {
    data: function() {
        return  {
            activeTab: null
        }
    },
    methods: {
        switchTab(tab) {
            this.$emit('displayDashboard', false)
            return this.activeTab = tab
        }
    },
    beforeDestroy() {
        return this.$emit('displayDashboard', true)
    }
}
</script>

<style scoped>
.accordionBtn {
  text-align: left;
}

.accordionBtn:focus {
  box-shadow: none;
}

.activeBg {
    background-color: #252195;
    color: white;
}
</style>

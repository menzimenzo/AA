const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const axios = require('axios');
var moment = require('moment');
const { response } = require('express');
moment().format();



router.get('/uai/:id', async function (req, res) {
  const uai = req.params.id
  console.log('recherche UAI :' + uai)
  try {
    // Request access token.
    const reponse = await axios.get('https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre&q=(etat_etablissement_libe:"OUVERT" AND numero_uai:' + uai + ')');
    if (reponse) {
      const etablissement = reponse.data.records[0].fields
      const nom = etablissement.appellation_officielle
      const uai_retour = etablissement.numero_uai
      const adresse = etablissement.adresse_uai
      const libelleCommune = etablissement.libelle_commune
      const cp = etablissement.code_postal_uai
      const commune = etablissement.code_commune
      const type = etablissement.nature_uai
      const type_libelle = etablissement.nature_uai_libe
      const ecole = {
        nom: nom,
        uai: uai_retour,
        type: type,
        type_libe: type_libelle,
        adresse: adresse,
        libelleCommune: libelleCommune,
        cp: cp,
        commune: commune
      }
      return res.status(200).json({ ecole: ecole })
    }
  }
  catch (error) {
    console.log(error)
  }
})

router.get('/cp/:id', async function (req, res) {

  const cp = req.params.id
  console.log('recherche Ecole par CP :' + cp)
  try {
    // Request access token.
    const reponse = await axios.get('https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre&q=(code_postal_uai:' + cp + ' AND nature_uai=151 AND etat_etablissement_libe:"OUVERT")&rows=100');
    const etablissements = reponse.data.records
    //console.log(etablissements)
    let etablissementsFormate = []
    etablissements.forEach(element => {
      //console.log(element.fields)
      const nom = element.fields.appellation_officielle
      const uai_retour = element.fields.numero_uai
      const adresse = element.fields.adresse_uai
      const libelleCommune = element.fields.libelle_commune
      const cp = element.fields.code_postal_uai
      const commune = element.fields.code_commune
      const type = element.fields.nature_uai
      const type_libelle = element.fields.nature_uai_libe
      const ecole = {
        nom: nom,
        uai: uai_retour,
        type: type,
        type_libe: type_libelle,
        adresse: adresse + ' ' + cp + ' ' + libelleCommune,
        libelleCommune: libelleCommune,
        cp: cp,
        commune: commune
      }
      etablissementsFormate.push(ecole)
    });
    //console.log(etablissementsFormate)
    return res.status(200).json({ etablissements: etablissementsFormate })
  }
  catch (error) {
    console.log(error)
  }
})

module.exports = router;
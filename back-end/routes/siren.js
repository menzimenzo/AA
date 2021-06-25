const express = require('express');
const router = express.Router();
const axios = require('axios');
var moment = require('moment');
moment().format();

router.get('/siret/:id', async function (req, res) {
  const token = '7feea564-6173-3350-8aa6-bee62bd01c7b'
  const now = moment(new Date()).format('YYYY-MM-DD')
  const idsiret = req.params.id
  console.log('recherche SIRET :' + idsiret)
  try {
    // Request access token.
    const reponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3/siret/' + idsiret + '?date=' + now, { headers: { "Authorization": `Bearer ${token}` } });
    
    const siren = reponse.data.etablissement.siren
    const siret = reponse.data.etablissement.siret
    const type = reponse.data.etablissement.uniteLegale.activitePrincipaleUniteLegale
    const nom = reponse.data.etablissement.uniteLegale.denominationUniteLegale
    const numeroVoie = reponse.data.etablissement.adresseEtablissement.numeroVoieEtablissement
    const typeVoie = reponse.data.etablissement.adresseEtablissement.typeVoieEtablissement
    const libelleVoie = reponse.data.etablissement.adresseEtablissement.libelleVoieEtablissement
    const libelleCommune = reponse.data.etablissement.adresseEtablissement.libelleCommuneEtablissement
    const cp = reponse.data.etablissement.adresseEtablissement.codePostalEtablissement
    const complement = reponse.data.etablissement.adresseEtablissement.complementAdresseEtablissement
    const commune = reponse.data.etablissement.adresseEtablissement.codeCommuneEtablissement
    const numeroVoieFormate = numeroVoie != 'null' ? numeroVoie + ' ' : ''
    const typeVoieFormate = typeVoie != 'null' ? typeVoie + ' ' : ''
    const libelleVoieFormate = libelleVoie != 'null' ? libelleVoie + ' ' : ''
    const libelleCommuneFormate = libelleCommune != 'null' ? libelleCommune : ''
    const cpFormate = cp != 'null' ? cp + ' ' : ''
    const complementFormate = complement != 'null' ? complement + ' ' : ''
    const adresse = numeroVoieFormate + typeVoieFormate + libelleVoieFormate + complementFormate + cpFormate + libelleCommuneFormate
    const structure = {
      siren: siren,
      siret: siret,
      nom: nom,
      numeroVoie: numeroVoie,
      typeVoie: typeVoie,
      libelleVoie: libelleVoie,
      libelleCommune: libelleCommune,
      cp: cp,
      complement: complement,
      adresse: adresse,
      commune: commune,
      activite: type
    }
    //console.log(structure)
    return res.status(200).json({ structure: structure })
  }
  catch (error) {
    console.log(error)
    return res.status(404).json({ error })
  }
})

router.get('/siren/:id', async function (req, res) {
  const token = '7feea564-6173-3350-8aa6-bee62bd01c7b'
  const siren = req.params.id
  console.log('recherche SIREN :' + siren)
  try {
    // Request access token.
    const reponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3/siret?q=(siren:' + siren + ' AND periode(etatAdministratifEtablissement:A))', { headers: { "Authorization": `Bearer ${token}` } });
    const etablissements = reponse.data.etablissements
    //console.log(etablissements)
    let etablissementsFormate = []
    etablissements.forEach(element => {
      const siren = element.siren
      const siret = element.siret
      const nom = element.uniteLegale.denominationUniteLegale
      const type =element.uniteLegale.activitePrincipaleUniteLegale
      const numeroVoie = element.adresseEtablissement.numeroVoieEtablissement ? element.adresseEtablissement.numeroVoieEtablissement : ''
      const numeroVoieFormate = numeroVoie != '' ? numeroVoie + ' ' : ''
      const typeVoie = element.adresseEtablissement.typeVoieEtablissement ? element.adresseEtablissement.typeVoieEtablissement : ''
      const typeVoieFormate = typeVoie != '' ? typeVoie + ' ' : ''
      const libelleVoie = element.adresseEtablissement.libelleVoieEtablissement ? element.adresseEtablissement.libelleVoieEtablissement : ''
      const libelleVoieFormate = libelleVoie != '' ? libelleVoie + ' ' : ''
      const libelleCommune = element.adresseEtablissement.libelleCommuneEtablissement ? element.adresseEtablissement.libelleCommuneEtablissement : ''
      const libelleCommuneFormate = libelleCommune != '' ? libelleCommune : ''
      const cp = element.adresseEtablissement.codePostalEtablissement ? element.adresseEtablissement.codePostalEtablissement : ''
      const cpFormate = cp != '' ? cp + ' ' : ''
      const complement = element.adresseEtablissement.complementAdresseEtablissement ? element.adresseEtablissement.complementAdresseEtablissement : ''
      const complementFormate = complement != '' ? complement + ' ' : ''
      const adresse = numeroVoieFormate + typeVoieFormate + libelleVoieFormate + complementFormate + cpFormate + libelleCommuneFormate
      const commune = element.adresseEtablissement.codeCommuneEtablissement
      const etablissement = {
        siren: siren,
        siret: siret,
        nom: nom,
        numeroVoie: numeroVoie,
        typeVoie: typeVoie,
        libelleVoie: libelleVoie,
        libelleCommune: libelleCommune,
        cp: cp,
        complement: complement,
        adresse: adresse,
        commune: commune,
        activite: type
      }
      //console.log(etablissement)
      etablissementsFormate.push(etablissement)
    });
    return res.status(200).json({ etablissements: etablissementsFormate })
  }
  catch (error) {
    console.log(error)
  }
})

module.exports = router;


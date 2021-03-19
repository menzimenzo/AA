module.exports = {
  postgres: {
    user: process.env.POSTGRES_URL || "u_aaq_dev",
    host: process.env.POSTGRES_HOST || "pg",
    database: process.env.POSTGRES_DB || "aaq_dev",
    password: process.env.POSTGRES_PWD ||"A@kou@t1k!",
    port: process.env.POSTGRES_PORT ||5432
  },
  // les watchers ("normal" et nuxt) ne semblent pas fonctionner sous windows
  watch: true,
  watchers: {
    webpack: {
      poll: true
    }
  },
  sessionSecret: "vB2P+i@/Uz>+yK%@LK@g9Vb93gZ^c<",
  pathAttestation: process.env.PATH_PDF_ATTESTATION || "../../tmp/",
  PATH_SUPERVISION_BATCH: process.env.PATH_SUPERVISION_BATCH || "/var/tmp/",
  MAIL_URL: process.env.MAIL_URL,
  URL_PREFIX: process.env.URL_PREFIX || '/api',
  SENDER_EMAIL: process.env.SENDER_EMAIL || 'nepasrepondreaaq@sports.gouv.fr',
  FRONT_DOMAIN: process.env.FRONT_DOMAIN || 'localhost', 
  // FRANCE CONNECT
  franceConnect: {
    "FC_URL": process.env.FC_URL || "https://fcp.integ01.dev-franceconnect.fr",
    "FS_URL": process.env.FS_URL || "http://localhost",
    //"FRANCE_CONNECT_KIT_PATH":process.env.FRANCE_CONNECT_KIT_PATH ||  "/js/franceconnect.js",

// Clés Aisance aquatique

/*
    "CLIENT_ID": process.env.CLIENT_ID || "6825c95ac3be9a12b2791283c3f02aee22d5cf687d4c5c0b13b16f1cfb94d05a",
    "CLIENT_SECRET": process.env.CLIENT_SECRET || "dc50bb7ebaec89e9a27d27a82081eb99260d84e9c349b67512704df0eb672f16",

    */
///*    
// Clés Savoir Rouler à Vélo
    "CLIENT_ID": process.env.CLIENT_ID || "14a5bbbc66fd6ea4a525e5faadb38afec6bd07375d12dba2a42ffb7cab9ef49d",
    "CLIENT_SECRET": process.env.CLIENT_SECRET || "9154ebbc9f9243cc34899ee7fecbf17f55a4d8208f51f0317df414586b010132",
//*/
    "CALLBACK_FS_PATH": process.env.CALLBACK_FS_PATH || "/connexion/login",
    "LOGOUT_FS_PATH": process.env.LOGOUT_FS_PATH || "/connexion/logout",
    
    "AUTHORIZATION_FC_PATH": process.env.AUTHORIZATION_FC_PATH || "/api/v1/authorize",
    "TOKEN_FC_PATH": process.env.TOKEN_FC_PATH || "/api/v1/token",
    "USERINFO_FC_PATH": process.env.USERINFO_FC_PATH || "/api/v1/userinfo",
    "LOGOUT_FC_PATH": process.env.LOGOUT_FC_PATH || "/api/v1/logout",

    //"SCOPES": "openid profile birth",
    "SCOPES": "openid profile",

    // Random values for security purpose
    "state": "02XZ4MjSE0OAZ3JS",
    "nonce": new Date().toISOString()
    
  }
}
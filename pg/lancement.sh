#! /bin/sh
psql -c "DROP DATABASE aaq_dev if EXISTS"

#echo '01-CreationBDD :'
psql -f /docker-entrypoint-initdb.d/scripts/01-CreationBDD.sql

#echo '02-SQL_CreationBase :'
psql -d aaq_dev -U u_aaq_dev -f /docker-entrypoint-initdb.d/scripts/02-SQL_CreationBase.sql

#echo '04-SQL_CreationSession :'
psql -d aaq_dev -U u_aaq_dev -f /docker-entrypoint-initdb.d/scripts/04-SQL_CreationSession.sql

# Script initial de peuplement de la base de données
echo '03-SQL_PeuplementReferentielBase :'
psql -d aaq_dev -U u_aaq_dev -f /docker-entrypoint-initdb.d/scripts/03-SQL_PeuplementReferentielBase.sql

echo '04-SQL_MAJBase :'
psql -d aaq_dev -U u_aaq_dev -f /docker-entrypoint-initdb.d/scripts/04-SQL_MAJBase.sql

#VERSION 1.1.0
# Ajout des structures
# Ajout des piscines
# Ajout des structures de référence
echo '04-SQL_V1.1.0 : mises à jours de la version 1.1.0'
psql -d aaq_dev -U u_aaq_dev -f /docker-entrypoint-initdb.d/scripts/04-SQL_V1.1.0.sql

#VERSION 1.1.1
# Pas de script

#VERSION 1.1.2
# Pas de script

#VERSION 1.1.3 - Version en cours
echo '05-SQL_V1.1.3 : mises à jours de la version 1.1.3'
psql -d aaq_dev -U u_aaq_dev -f /docker-entrypoint-initdb.d/scripts/05-SQL_V1.1.3.sql


-- Début de la procédure de déploiement automatisé : 
-- Création de la version
DO $$
BEGIN 
   call AAQ_CreerVersion('1.1.3');
END
$$ language plpgsql;

-- Mise à jour du schéma de base de données
DO $$
DECLARE
	FaireMAJSchema BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.3','schema') INTO FaireMAJSchema;
	IF FaireMAJSchema THEN
      -- Agrandissement colonne doc_type pour accepter plus de type de documents
      alter table DOCUMENT ALTER COLUMN doc_type TYPE VARCHAR(500);
      
      -- Déploiement du Schéma effectué
      call AAQ_VersionDeployee('1.1.3','schema');
		raise notice '%','Mise à jour du schéma effectué';
	ELSE
		raise notice '%','Pas de mise à jour schéma à faire';
	END IF;
END
$$ language plpgsql;


-- Mise à jour des données
DO $$
DECLARE
	FaireMAJData BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.3','data') INTO FaireMAJData;
	IF FaireMAJData THEN
      -- Création du rôle Structure référente
      INSERT INTO utilisateur (rol_id,stu_id,uti_validated,uti_mail,uti_nom,uti_prenom) VALUES (3,1,true,'inconnu@aaq.fr','inconnu','inconnu');  

      -- Déploiement du Schéma effectué
      call AAQ_VersionDeployee('1.1.3','data');
	   raise notice '%','Mise à jour des datas effectué';
	ELSE
		raise notice '%','Pas de mise à jour de datas à faire';
	END IF;
END
$$ language plpgsql;

DO $$
DECLARE
	FaireMAJDroit BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.3','droit') INTO FaireMAJDroit;
	IF FaireMAJDroit THEN
      CALL AAQ_AjouteDroitsObjets();
		raise notice '%','Mise à jour des droits';
	ELSE
		raise notice '%','Pas de mise à jour des droits à faire';
	END IF;
END
$$ language plpgsql;
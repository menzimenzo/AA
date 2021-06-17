

-- TODO ; 
-- Intégration des scripts de Vincent
-- Mettre les droits sur les tables
-- Voir pour le déploiement automatisé

/*==============================================================*/
/* Table : STRUCTURE_REFERENTE                                  */
/*==============================================================*/
create table STRUCTURE_REF (
   SRE_ID               SERIAL               not null,
   SRE_LIBELLECOURT     VARCHAR(100)         null,
   SRE_LIBELLE          VARCHAR(150)         not null,
   SRE_COURRIEL         VARCHAR(50)          null,
   SRE_ACTIF            BOOLEAN              not null,
   constraint PK_STRUCTURE_REF primary key (SRE_ID)
);

/*==============================================================*/
/* Table : UTI_SRE                                              */
/*==============================================================*/
create table UTI_SRE (
   UTI_ID               BIGINT               not null,
   SRE_ID               BIGINT               not null
);

/*==============================================================*/
/* Index : IDX_UTI_SRE                                          */
/*==============================================================*/
create  index IDX_UTI_SRE on UTI_SRE (
UTI_ID,SRE_ID
);


/*==============================================================*/
/* Table : MAJ TABLE DEMANDE_AAQ                                  */
/*==============================================================*/
ALTER TABLE DEMANDE_AAQ ADD COLUMN DEM_SRE_ID BIGINT null;
ALTER TABLE DEMANDE_AAQ ALTER DEM_UTI_FORMATEUR_ID drop not null;

-- Création du rôle Structure référente
INSERT INTO PROFIL (rol_id, rol_libelle, rol_ordre) VALUES (6, 'StructureRef', 6);

-- Création de la structure de référence ICARE
insert into structure_ref (sre_libellecourt, sre_libelle,sre_courriel,sre_actif) values ('ICARE','Institut Coopératif de l''Apprentissage, de la Recherche et de l’Enseignement','aaq@icare.fr',true);
update utilisateur set rol_id = 3 where uti_id = 20;
insert into UTI_SRE (UTI_ID,SRE_ID) values (20,1);
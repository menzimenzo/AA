

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
   SRE_TRAITEMENTCENTRAL BOOLEAN             not null default false ,
   SRE_ACTIF            BOOLEAN              not null,
   constraint PK_STRUCTURE_REF primary key (SRE_ID)
);

/*==============================================================*/
/* Table : UTI_SRE                                              */
/*==============================================================*/
create table UTI_SRE (
   UTI_ID               BIGINT               not null,
   SRE_ID               BIGINT               not null,
   UTS_ACTIF            BOOLEAN              not null default true
);

/*==============================================================*/
/* Index : IDX_UTI_SRE                                          */
/*==============================================================*/
create  index IDX_UTI_SRE on UTI_SRE (
UTI_ID,SRE_ID, UTS_ACTIF
);


/*==============================================================*/
/* Table : MAJ TABLE DEMANDE_AAQ                                  */
/*==============================================================*/
ALTER TABLE DEMANDE_AAQ ADD COLUMN DEM_SRE_ID BIGINT null;
ALTER TABLE DEMANDE_AAQ ALTER DEM_UTI_FORMATEUR_ID drop not null;



-- Création du rôle Structure référente
INSERT INTO PROFIL (rol_id, rol_libelle, rol_ordre) VALUES (6, 'StructureRef', 6);
-- Création de la structure par défaut pour les instructeurs indépendants
insert into structure_ref (sre_libellecourt, sre_libelle,sre_courriel,sre_actif) values ('ICARE','Institut Coopératif de l''Apprentissage, de la Recherche et de l’Enseignement','aaq@icare.fr',true);
-- Par défaut s'il existait déjà des profil Instructeurs,
-- ils sont alors automatiquement ajoutés dans la structure "Indépendant" 
insert into uti_sre (select uti_id,1,true from utilisateur 
where rol_id = 3 and uti_id not in (select uti_id from uti_sre));


-- Création de la structure de référence ICARE
insert into structure_ref (sre_libellecourt, sre_libelle,sre_courriel,SRE_TRAITEMENTCENTRAL,sre_actif) values ('Indépendant','Instructeur indépendant','',false,true);
insert into structure_ref (sre_libellecourt, sre_libelle,sre_courriel,SRE_TRAITEMENTCENTRAL,sre_actif) values ('ICARE','Institut Coopératif de l''Apprentissage, de la Recherche et de l’Enseignement','aaq@icare.fr',true,true);
insert into structure_ref (sre_libellecourt, sre_libelle,sre_courriel,SRE_TRAITEMENTCENTRAL,sre_actif) values ('FFSS','Fédération Française de Sauvetage et de Secourisme','',false,true);
insert into structure_ref (sre_libellecourt, sre_libelle,sre_courriel,SRE_TRAITEMENTCENTRAL,sre_actif) values ('FFN','Fédération Française de Natation','',false,true);
update utilisateur set rol_id = 3 where uti_id = 20;
insert into UTI_SRE (UTI_ID,SRE_ID) values (20,1);
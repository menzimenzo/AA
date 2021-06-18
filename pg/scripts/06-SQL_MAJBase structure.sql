
DROP table STRUCTURE CASCADE;
/*==============================================================*/
/* Table : STRUCTURE                                            */
/*==============================================================*/
create table STRUCTURE (
   STR_ID               SERIAL               not null,
   STR_CODE             VARCHAR(20)          not null,
   STR_LIBELLE          VARCHAR(150)         not null,
   STR_ADRESSE          VARCHAR(150)         null,
   STR_COMMUNE          VARCHAR(5)           null,
   STR_TYPE             BIGINT               null,
   STR_SOUSTYPE         VARCHAR(50)          null,
   STR_ACTIF            BOOLEAN              not null,
   constraint PK_STRUCTURE primary key (STR_ID)
);

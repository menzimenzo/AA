update piscine set cpi_codeinsee = CONCAT('0',cpi_codeinsee) where length(cpi_codeinsee) = 4;
update piscine set pis_nom=TRIM(pis_nom), pis_adr=TRIM(pis_adr);
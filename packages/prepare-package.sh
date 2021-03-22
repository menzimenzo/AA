#!/bin/bash

# Shell de préparation du package de déploiement pour livraison

cp -r ../front-end ./
rm -r ./front-end/node_modules

cp -r ../back-end ./
rm -r ./back-end/node_modules

cp -r ../mail-server ./
rm -r ./mail-server/node_modules
tar -zcvf aaq_package.tar.gz  front-end back-end mail-server

rm -r ./front-end
rm -r ./back-end
rm -r ./mail-server


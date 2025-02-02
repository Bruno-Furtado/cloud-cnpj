#!/bin/bash

# Variáveis
PROJECT="cloud-cnpj"

# Verifica se já há um usuário autenticado
if ! gcloud auth list --format="value(account)" | grep -q .; then
    echo "Nenhuma conta autenticada. Realizando login..."
    gcloud auth login
else
    echo "Usuário já autenticado."
fi

# Define o projeto em uso
gcloud config set project $PROJECT

# Executar o deploy da camada raw
bash raw/deploy.sh

# Executar o deploy da camada gold
bash gold/deploy.sh

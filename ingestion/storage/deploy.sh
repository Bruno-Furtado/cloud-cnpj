#!/bin/bash

# Variáveis
PROJECT="cloud-cnpj"
BUCKET="cloud-cnpj"
REGION="us-central1"

# Verifica se já há um usuário autenticado
if ! gcloud auth list --format="value(account)" | grep -q .; then
    echo "Nenhuma conta autenticada. Realizando login..."
    gcloud auth login
else
    echo "Usuário já autenticado."
fi

# Define o projeto em uso
gcloud config set project $PROJECT

# Criar novo bucket caso ainda não exista
echo "Criando bucket ${BUCKET} na região ${REGION}..."
gsutil mb -p $PROJECT -l $REGION -c regional gs://$BUCKET/ || echo "Bucket já existe, continuando..."

echo "Bucket ${BUCKET} criado com sucesso em ${REGION}."

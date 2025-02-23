#!/bin/bash

# Variáveis
PROJECT="cloud-cnpj"
BUCKET="gs://cloud-cnpj.dataflow"
REGION="us-central1"
APP_NAME="firestore-dataflow"

# Verifica se já há um usuário autenticado
if ! gcloud auth list --format="value(account)" | grep -q .; then
    echo "Nenhuma conta autenticada. Realizando login..."
    gcloud auth login
else
    echo "Usuário já autenticado."
fi

# Define o projeto em uso
gcloud config set project $PROJECT

# Habilita APIs
gcloud services enable dataflow.googleapis.com \
    bigquery.googleapis.com \
    firestore.googleapis.com \
    cloudfunctions.googleapis.com \
    storage.googleapis.com

# Cria o bucket caso não exista
gcloud storage buckets create $BUCKET --location=$REGION

# Cria a conta de serviço
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name "Dataflow Service Account"

# Adiciona as permissões necessárias
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:$APP_NAME@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/dataflow.worker"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:$APP_NAME@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:$APP_NAME@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

# Construir a imagem e enviar para o Registry
gcloud builds submit --tag gcr.io/$PROJECT/$APP_NAME

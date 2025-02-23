#!/bin/bash

# Variáveis
PROJECT="cloud-cnpj"
PROJECT_NUMBER=""
BUCKET="cloud-cnpj"
REGION="us-central1"
JOB_NAME="bq-firestore-migrator"
REPO_NAME=$JOB_NAME
IMAGE=$JOB_NAME
LOG_ENABLED="true"
SLACK_NOTIFICATIONS_ENABLED="false"
SLACK_WEBHOOK_URL=""
BIGQUERY_DATASET="gold"
BIGQUERY_TABLE="estabelecimentos"
FIRESTORE_COLLECTION="estabelecimentos"

# Verifica se já há um usuário autenticado
if ! gcloud auth list --format="value(account)" | grep -q .; then
    echo "Nenhuma conta autenticada. Realizando login..."
    gcloud auth login
else
    echo "Usuário já autenticado."
fi

# Define o projeto em uso
gcloud config set project $PROJECT

# Habilite os serviços
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    cloudscheduler.googleapis.com \
    firestore.googleapis.com

# Cria repositório de artifacts para armazenar as images
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION

# Configura o docker
gcloud auth configure-docker $REGION-docker.pkg.dev

# Realiza o build da image considerando a arquitetura aceita pelo GCP e envia para repo
docker build --platform=linux/amd64 -t $IMAGE .
docker tag $IMAGE $REGION-docker.pkg.dev/$PROJECT/$REPO_NAME/$IMAGE:latest
docker push $REGION-docker.pkg.dev/$PROJECT/$REPO_NAME/$IMAGE:latest

# Cria o job no Cloud Run
gcloud run jobs create $JOB_NAME \
    --image $REGION-docker.pkg.dev/$PROJECT/$REPO_NAME/$IMAGE:latest \
    --region $REGION \
    --task-timeout=7200s \
    --memory=512Mi \
    --cpu=1 \
    --max-retries=0 \
    --tasks=1 \
    --set-env-vars PROCESS=$JOB_NAME \
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT \
    --set-env-vars GOOGLE_CLOUD_REGION=$REGION \
    --set-env-vars BIGQUERY_DATASET=$BIGQUERY_DATASET \
    --set-env-vars BIGQUERY_TABLE=$BIGQUERY_TABLE \
    --set-env-vars FIRESTORE_COLLECTION=$FIRESTORE_COLLECTION \
    --set-env-vars LOG_ENABLED=$LOG_ENABLED \
    --set-env-vars SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
    --set-env-vars SLACK_NOTIFICATIONS_ENABLED=$SLACK_NOTIFICATIONS_ENABLED

# Adiciona permissão para o Cloud Run acessar o BigQuery
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"gcloud projects add-iam-policy-binding cloud-cnpj \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/bigquery.jobUser"
gcloud projects add-iam-policy-binding cloud-cnpj \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/datastore.user"

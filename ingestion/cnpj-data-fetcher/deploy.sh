#!/bin/bash

# Variáveis
PROJECT="cloud-cnpj"
PROJECT_ID=""
BUCKET="cloud-cnpj"
REGION="us-central1"
JOB_NAME="cnpj-data-fetcher"
REPO_NAME=$JOB_NAME
IMAGE=$JOB_NAME
RECEITA_FEDERAL_URL="https://arquivos.receitafederal.gov.br"
NEXTCLOUD_SHARE_TOKEN="YggdBLfdninEJX9"
SLACK_WEBHOOK_URL=""
SLACK_NOTIFICATIONS_ENABLED="false"

# Verifica se já há um usuário autenticado
if ! gcloud auth list --format="value(account)" | grep -q .; then
    echo "Nenhuma conta autenticada. Realizando login..."
    gcloud auth login
else
    echo "Usuário já autenticado."
fi

# Define o projeto em uso
gcloud config set project $PROJECT

# Garante que os serviços estão habilitados no projeto
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    cloudscheduler.googleapis.com

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
    --task-timeout=43200s \
    --memory=8Gi \
    --cpu=2 \
    --max-retries=0 \
    --tasks=1 \
    --set-env-vars PROCESS=$JOB_NAME \
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT \
    --set-env-vars GOOGLE_CLOUD_BUCKET=$BUCKET \
    --set-env-vars RECEITA_FEDERAL_URL=$RECEITA_FEDERAL_URL \
    --set-env-vars NEXTCLOUD_SHARE_TOKEN=$NEXTCLOUD_SHARE_TOKEN \
    --set-env-vars SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
    --set-env-vars SLACK_NOTIFICATIONS_ENABLED=$SLACK_NOTIFICATIONS_ENABLED
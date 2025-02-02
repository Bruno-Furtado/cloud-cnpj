PROJECT="cloud-cnpj"
REGION="us-central1"
FLOW_NAME="cnpj-zip-bq"
FILE_NAME="cnpj-zip-bq.yaml"
DESCRIPTION="Fluxo de orquestração para ingestão e processamento dos dados de CNPJs."

gcloud services enable workflows.googleapis.com --project=$PROJECT

gcloud workflows deploy $FLOW_NAME \
  --location="$REGION" \
  --source="$FILE_NAME" \
  --description="$DESCRIPTION"

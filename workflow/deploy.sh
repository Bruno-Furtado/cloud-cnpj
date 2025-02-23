PROJECT="cloud-cnpj"
REGION="us-central1"
FLOW_NAME="cloud-cnpj"
FILE_NAME="cloud-cnpj.yaml"
DESCRIPTION="Fluxo de orquestração para ingestão, processamento e disponibilização dos dados de CNPJs."

gcloud services enable workflows.googleapis.com --project=$PROJECT

gcloud workflows deploy $FLOW_NAME \
  --location="$REGION" \
  --source="$FILE_NAME" \
  --description="$DESCRIPTION"

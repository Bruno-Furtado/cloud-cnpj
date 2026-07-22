PROJECT="cloud-cnpj"
REPO="Bruno-Furtado/cloud-cnpj"
SA="github-actions-runner"
SA_DESCRIPTION="GitHub Actions - dispara o workflow mensal"
POOL="github-actions"
PROVIDER="github"

SA_EMAIL="$SA@$PROJECT.iam.gserviceaccount.com"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT --format="value(projectNumber)")

gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project=$PROJECT

# Service account que o GitHub Actions irá personificar
if ! gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT >/dev/null 2>&1; then
  gcloud iam service-accounts create $SA \
    --project=$PROJECT \
    --display-name="$SA_DESCRIPTION"
fi

gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/workflows.invoker" \
  --condition=None

# Pool e provider OIDC do GitHub
if ! gcloud iam workload-identity-pools describe $POOL \
  --project=$PROJECT --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create $POOL \
    --project=$PROJECT \
    --location=global \
    --display-name="GitHub Actions"
fi

if ! gcloud iam workload-identity-pools providers describe $PROVIDER \
  --project=$PROJECT --location=global --workload-identity-pool=$POOL >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc $PROVIDER \
    --project=$PROJECT \
    --location=global \
    --workload-identity-pool=$POOL \
    --display-name="GitHub" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository=='$REPO'"
fi

# Somente este repositório pode personificar a service account
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO"

WIF_PROVIDER="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"

echo ""
echo "✅ Workload Identity Federation configurado. Cadastre os segredos no repositório:"
echo ""
echo "  gh secret set GCP_WIF_PROVIDER --body \"$WIF_PROVIDER\""
echo "  gh secret set GCP_SA_EMAIL --body \"$SA_EMAIL\""
echo ""

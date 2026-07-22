PROJECT="cloud-cnpj"
ALERT_EMAIL="brunotfurtado@gmail.com"
CHANNEL_NAME="E-mail - alertas cloud-cnpj"
POLICY_FILE="alert-policy.yaml"
POLICY_NAME="cloud-cnpj - falha no workflow"

gcloud services enable monitoring.googleapis.com --project=$PROJECT

CHANNEL=$(gcloud beta monitoring channels list \
  --project=$PROJECT \
  --filter="type='email' AND labels.email_address='$ALERT_EMAIL'" \
  --format="value(name)" | head -n 1)

if [ -z "$CHANNEL" ]; then
  echo "Criando canal de notificação para $ALERT_EMAIL..."
  CHANNEL=$(gcloud beta monitoring channels create \
    --project=$PROJECT \
    --display-name="$CHANNEL_NAME" \
    --type=email \
    --channel-labels=email_address=$ALERT_EMAIL \
    --format="value(name)")
  echo "⚠️  Confirme o e-mail enviado para $ALERT_EMAIL para ativar o canal."
fi

POLICY=$(gcloud alpha monitoring policies list \
  --project=$PROJECT \
  --filter="displayName='$POLICY_NAME'" \
  --format="value(name)" | head -n 1)

if [ -n "$POLICY" ]; then
  echo "A política '$POLICY_NAME' já existe ($POLICY). Nada a fazer."
  exit 0
fi

gcloud alpha monitoring policies create \
  --project=$PROJECT \
  --policy-from-file="$POLICY_FILE" \
  --notification-channels="$CHANNEL"

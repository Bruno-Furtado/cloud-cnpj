# cnpj-data-distributor

Este é um [Cloud Run Job](https://cloud.google.com/run/docs/create-jobs), construído em [NodeJS](https://nodejs.org) que tem por objetivo carregar os dados do [Google BigQuery](https://cloud.google.com/bigquery) e transferi-los para o [Firestore](https://firebase.google.com/docs/firestore), um banco de baixa latência e fácil uso em APIs.

## ⚠️ Em desenvolvimento

Comandos usados para testes:

```sh
gcloud firestore databases create --location=$LOCATION --project=$PROJECT
```
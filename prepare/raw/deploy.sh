#!/bin/bash

# Variáveis
PROJECT="cloud-cnpj"
BUCKET="cloud-cnpj"
DATASET="raw"
DATA_SOURCE="google_cloud_storage"
REGION="us-central1"

# Lista de transfers (apenas os nomes, pois tabela e transfer são iguais)
TRANSFERS=(
    "cnaes"
    "empresas"
    "estabelecimentos"
    "motivos"
    "municipios"
    "naturezas"
    "paises"
    "qualificacoes"
    "simples"
    "socios"
)

# Cria as tabelas no BQ
bq query --location=$REGION --use_legacy_sql=false < raw/create.sql

# Criar transfers dinamicamente
for NAME in "${TRANSFERS[@]}"; do
    echo "Criando transferência para: ${NAME}"

    bq mk \
        --transfer_config \
        --project_id="${PROJECT}" \
        --data_source="${DATA_SOURCE}" \
        --display_name="${NAME}-storage-bq" \
        --target_dataset="${DATASET}" \
        --location="${REGION}" \
        --no_auto_scheduling \
        --params="{
            \"destination_table_name_template\": \"${NAME}\",
            \"data_path_template\": \"gs://${BUCKET}/${NAME}/*.csv\",
            \"write_disposition\": \"MIRROR\",
            \"file_format\": \"CSV\",
            \"field_delimiter\": \";\",
            \"delete_source_files\": \"true\",
            \"preserve_ascii_control_characters\": \"true\"
        }"

    echo "Transferência ${NAME} criada com sucesso!"
done

echo "Todas as transferências foram criadas."

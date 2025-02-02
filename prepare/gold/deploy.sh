#!/bin/bash

# Variáveis
SQ_NAME="estabelecimentos-raw-gold"
SQ_DATASET="gold"
SQ_TABLE="estabelecimentos"
SQ_FILE="gold/estabelecimentos.sql"
REGION="us-central1"

# Criar a camada gold
bq query --location=$REGION --use_legacy_sql=false < gold/create.sql

# Configurar a query agendada
SQ_PARAMS=$(jq -n \
    --arg query "$(cat $SQ_FILE | sed 's/"/\\"/g')" \
    --arg write_disposition "WRITE_TRUNCATE" \
    --arg destination_table "$SQ_TABLE" \
    '{query: $query, write_disposition: $write_disposition, destination_table_name_template: $destination_table}')

bq mk --transfer_config \
    --data_source=scheduled_query \
    --display_name="$SQ_NAME" \
    --no_auto_scheduling=true \
    --target_dataset="$SQ_DATASET" \
    --params="$SQ_PARAMS"
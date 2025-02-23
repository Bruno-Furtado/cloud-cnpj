# Workflow

Este é o orquestrador de tarefas do projeto, criado a partir do [Google Workflow](https://cloud.google.com/workflows), e responsável por obter [dados da Receita Federal](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj) e controlar os processos de ingestão, tratamento e distribuição dos dados.

## 🏗 Estrutura

```
├── cloud-cnpj.yaml   # Fluxo de orquestração de tarefas
├── deploy.sh         # Script para criação do workflow
├── README.md
```

## 🩺 Como funciona

### 1. Etapa de ingestão

Este é o procedimento que realiza o download e extração dos dados da Receita Federal em um bucket do Google Cloud Storage. Para mais detalhes consulte a [ingestion](../ingestion/).

### 2. Etapa de preparação

Uma vez com os dados brutos armazenados, precisamos trata-los. Para realizar este procedimento, fazemos uso do BigQuery e todos os seus recursos, como Data Transfers e Scheduled Queries. Para mais detalhes consutle a [prepare](../prepare/).

### 3. Etapa de distribuição

Com os dados já preparados, realizamos a distribuição para consumo dos mesmos. Para mais detalhes consutle a [use](../use/).

## 🛠️ Como realizar o deploy

Antes de iniciar, certifique-se de possuir o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install) instalado em sua máquina. Além disso, é necessário que sua conta de e-mail vinculada ao projeto do Google Cloud possua as permissões necessárias.

Com tudo pronto, basta executar o script [`deploy.sh`](./deploy.sh), sempre lembrando de configurar as variáveis no início do arquivo.


## 💵 Custos

Considerando que o workflow será chamado diariamente, sendo que em 1 dia do mês executará 75 steps e nos outros 29 dias executará 20 steps, e que está sendo utilizada a **region** `us-central1`, de acordo com a [tabela de custos](https://cloud.google.com/workflows/pricing) e considerando o free tier, os valores seriam os seguintes:

| Operação | Custo por unidade | Uso estimado | Free Tier | Custo final (USD) |
|----------|-------------------|--------------|-----------|-------------------|
| Chamadas ao Workflow | $0.00001 por execução | 30 execuções/mês | 5.000 execuções/mês | $0.00 |
| Execução de Steps | $0.0000025 por step | (1x 75 steps) + (29x 20 steps) = 655 steps | 2.000 steps/mês | $0.00 |
| **Total mensal estimado** | **—** | **—** | **—** | **$0.00** |


## 🪛 Como trigar localmente

Novamente, caso ainda não tenha verificado, certifique-se de possuir o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install) instalado em sua máquina. Além disso, é necessário que sua conta de e-mail vinculada ao projeto do Google Cloud possua as permissões necessárias.

```
gcloud workflows execute $FLOW_NAME \
    --location=$LOCATION \
    --data='{
      "ingestion_job_name": $INGESTION_JOB_NAME,
      "use_job_name": $USE_JOB_NAME,
      "location": $LOCATION,
      "project_id": $PROJECT_ID,
      "slack_webhook_url": $SLACK_WEBHOOK_URL,
      "scheduled_query": {
          "id": "679...01c",
          "name": "minha-query-agendada"
      },
      "transfer_configs": [
        { "id": "679...55c0", "name": "cnaes-storage-bq" },
        { "id": "67...bfc", "name": "empresas-storage-bq" },
        { "id": "679...40564", "name": "estabelecimentos-storage-bq" },
        { "id": "67...323680", "name": "motivos-storage-bq" },
        { "id": "6...a8d8cc", "name": "municipios-storage-bq" },
        { "id": "67...ff01c", "name": "naturezas-storage-bq" },
        { "id": "6799...f88", "name": "paises-storage-bq" },
        { "id": "679...80", "name": "qualificacoes-storage-bq" },
        { "id": "6799...5a2cc", "name": "simples-storage-bq" },
        { "id": "679...b948", "name": "socios--storage-bq" }
      ]
    }'
```





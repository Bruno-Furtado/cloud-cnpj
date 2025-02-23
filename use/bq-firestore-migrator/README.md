# bq-firestore-migrator

Este é um [Cloud Run Job](https://cloud.google.com/run/docs/create-jobs), construído em [NodeJS](https://nodejs.org). O job é responsável por copiar os registros da camada gold presentes no [BigQuery](https://cloud.google.com/bigquery) para o [Firestore](https://firebase.google.com/docs/firestore), possibilitando o consumo do dado com um baixo tempo de resposta.

## 🏗 Estrutura

```
│── src/
│   ├── config/
│   │   ├── env.js          # Variáveis de ambiente
|   |
│   ├── controller/
│   │   ├── migrator.js     # Orquestra a cópia dos dados
|   |
│   ├── service/
│   │   ├── bigquery.js     # Obtém dados do BigQuery
│   │   ├── firestore.js    # Salva dados no Firestore
|   |
│   ├── util/
│   │   ├── logger.js       # Logs estruturados
│   │   ├── alert.js        # Envio de alertas para o Slack
│   │   ├── helper.js       # Funções auxiliares
|   |
│   ├── main.js             # Ponto de entrada do processo
|
│── package.json            # Dependências do projeto
│── Dockerfile              # Configuração do container Docker
│── deploy.sh               # Script de deploy
```

## 🩺 Como funciona

Este job será executado 1x por dia na **região** `us-central1`, com 1 CPU, 512MB de memória, sem retry e criação de apenas 1 task. O processo dura cerca de 30 minutos e obtém todos os dados do BigQuery e os armazena no Firestore.

### 1. Obtenção dos dados do BigQuery

Apenas executa a query no BigQuery, na tabela estabelecimentos, e obtém todos os registros.

É utilizada uma regra de obtenção por batch, sendo que cada batch possui 500 registros, afim de não armazenarmos os mais de 60 milhões de registros em memória.

### 2. Inserção dos dados no Firestore

A medida em que os batch com os 500 registros são recebidos, os mesmos vão sendo persistidos no Firestore (banco de dados NoSQL de baixa latência).

> Durante todas as etapas, o job gera logs que são enviadas para o [Google Cloud Logging](https://cloud.google.com/logging), além de alertas para um canal no [Slack](https://slack.com).

## 💵 Custos

Considerando as condições de execução e a as tabelas de preços do [Cloud Run](https://cloud.google.com/run/pricing), [BigQuery](https://cloud.google.com/bigquery/pricing) e [Firestore](https://cloud.google.com/firestore/pricing) com o free tier, temos os seguintes custos:

| **Serviço** | **Operação** | **Custo por Unidade** | **Uso Estimado** | **Custo Estimado (USD)** |
|-------------|--------------|-----------------------|------------------|--------------------------|
| **Cloud Run Job** | Tempo de CPU | $0.000024 por vCPU-seg | 1 vCPU por **30 min (1800 seg)** | **$0.0432** |
|                   | Tempo de Memória | $0.0000025 por GB-seg   | **512MB** por **30 min (1800 seg)** | **$0.00225** |
|                   | Solicitações | $0.40 por 1M solicitações | **1 solicitação** (única execução) | **$0.0000004** |
| **BigQuery** | Consulta de Dados | $5.00 por TB processado  | **40GB (0.04 TB)**  | **$0.20** (ou **$0.00** se dentro do free tier) |
| **Firestore** | Gravação de Documentos | $0.18 por 100K gravações | **65 milhões** de gravações | **$117.00** |
|               | Armazenamento Mensal | $0.18 por GB por mês | **40GB armazenados** | **$7.20** |
| **Total mensal estimado** | **—** | **—** | **—** | **$124.25** |

## 🛠️ Como realizar o deploy

Certifique-se de ter instalado o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install), [Docker](https://docs.docker.com/desktop/) e [NodeJS](https://nodejs.org). Sua conta de e-mail vinculada ao projeto do Google Cloud também deve ter as permissões necessárias.

Para realizar o deploy, execute o script [`deploy.sh`](./deploy.sh) e configure as variáveis no início do arquivo.

Para executar o job no Google Cloud:
```sh
gcloud run jobs execute $JOB_NAME --region=$REGION
```

> Esta etapa também pode ser realizada via [Google Console](https://console.cloud.google.com/run/jobs).

## 🪛 Como executar localmente

Crie um arquivo `.env` na raiz do projeto:
```env
PROCESS=bq-firestore-migrator

GOOGLE_CLOUD_PROJECT=cloud-cnpj
GOOGLE_CLOUD_REGION=us-central1
BIGQUERY_DATASET=gold
BIGQUERY_TABLE=estabelecimentos

FIRESTORE_COLLECTION=estabelecimentos

LOG_ENABLED=true
SLACK_NOTIFICATIONS_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

Instale as dependências e execute o job localmente:
```sh
npm install
npm start
```

> Se não for usar notificações do Slack, não é necessário configurar a URL. Para ativá-las, siga [estas instruções](https://api.slack.com/messaging/webhooks).

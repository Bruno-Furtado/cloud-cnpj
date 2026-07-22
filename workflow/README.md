# Workflow

Este é o orquestrador de tarefas do projeto, criado a partir do [Google Workflow](https://cloud.google.com/workflows), e responsável por obter [dados da Receita Federal](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj) e controlar os processos de ingestão, tratamento e distribuição dos dados.

## 🏗 Estrutura

```
├── cloud-cnpj.yaml    # Fluxo de orquestração de tarefas
├── alert-policy.yaml  # Política de alerta por e-mail em caso de falha
├── deploy.sh          # Script para criação do workflow
├── deploy-alerts.sh   # Script para criação do alerta
├── deploy-wif.sh      # Script para autenticação do GitHub Actions no GCP
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

O campo `slack_webhook_url` é opcional: quando ausente ou vazio, nenhuma notificação externa é enviada, e uma eventual falha no envio nunca interrompe a execução.


## 🤖 Execução automática

O workflow é disparado uma vez por mês pelo GitHub Actions, através de [`monthly-pipeline.yml`](../.github/workflows/monthly-pipeline.yml), no dia 15 às 09:00 UTC (06:00 BRT). O job apenas dispara a execução — que pode levar horas — e encerra, atualizando na sequência o badge de dados atualizados no [`README.md`](../README.md) e no [`README_en.md`](../README_en.md) com um commit automático.

Para disparar sob demanda:

```
gh workflow run monthly-pipeline.yml
gh workflow run monthly-pipeline.yml -f badge_month=2026/07   # forçando o mês do badge
```

### Configuração

A autenticação usa [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation), sem chaves de longa duração: a cada execução o GitHub emite um token OIDC que o Google troca por credenciais temporárias. Execute o script [`deploy-wif.sh`](./deploy-wif.sh), que cria a service account, o pool, o provider OIDC e as permissões, e ao final imprime os comandos dos segredos.

O acesso é restrito a este repositório em duas camadas: o provider só aceita tokens cujo `assertion.repository` seja `Bruno-Furtado/cloud-cnpj`, e a permissão de personificar a service account é concedida apenas ao `principalSet` desse mesmo repositório. Forks não conseguem se autenticar.

São necessários três segredos:

| Secret | Conteúdo |
|--------|----------|
| `GCP_WIF_PROVIDER` | Caminho completo do provider (impresso pelo `deploy-wif.sh`) |
| `GCP_SA_EMAIL` | E-mail da service account (impresso pelo `deploy-wif.sh`) |
| `CNPJ_WORKFLOW_CONFIG` | O JSON passado em `--data` na seção anterior |

```
gh secret set CNPJ_WORKFLOW_CONFIG < /tmp/payload.json
rm /tmp/payload.json
```

A role `roles/workflows.invoker` é suficiente: quem chama o Cloud Run Job e os Data Transfers é a service account do próprio workflow.


## 🔔 Alertas

Como o job do GitHub Actions encerra assim que dispara a execução, o acompanhamento acontece pelo Google Cloud Monitoring: qualquer log com severidade `ERROR` no workflow — falha do Cloud Run Job, falha de um Data Transfer ou erro da própria execução — gera um e-mail.

Basta executar o script [`deploy-alerts.sh`](./deploy-alerts.sh), lembrando de configurar as variáveis no início do arquivo. Na primeira execução o Google envia um e-mail de confirmação que precisa ser aceito para o canal ficar ativo.





# Prepare

Esta etapa do processo é responsável pela preparação dos dados que foram previamente obtidos no processo [ingestion](../ingestion/). Sua responsabilidade é importar os arquivos CSV presentes no [Google Cloud Storage](https://cloud.google.com/storage), tornando-os registros em tabelas do [Google BigQuery](https://cloud.google.com/bigquery).

## 🏗 Estrutura

```
├── gold/                       # Arquivos relacionados aos dados refinados
│   ├── create.sql              # Query para criar datasets e tabelas
│   ├── deploy.sh               # Script para criar transfers que refinam os dados
│   ├── estabelecimentos.sql    # Query para refinar os dados de estabelecimentos
|
├── raw/                        # Arquivos relacionados aos dados brutos
│   ├── create.sql              # Query para criar datasets e tabelas
│   ├── deploy.sh               # Script para criar transfers que importam dados do storage para o BQ
|
├── deploy.sh                   # Script geral para criar datasets, tabelas e transfers
├── README.md
```

## 🩺 Como funciona

### 1. Camada raw

O dataset `raw` foi criado no BigQuery, na **region** `us-central1`. Este dataset possui todas as tabelas conforme descrição do [dicionário de dados da Receita Federal](https://www.gov.br/receitafederal/dados/cnpj-metadados.pdf).

| Tabela | Dataset | Descrição |
|--------|---------|-----------|
| `cnaes` | `raw` | Armazena os códigos e descrições das atividades econômicas (CNAE) |
| `empresas` | `raw` | Contém os dados cadastrais das empresas |
| `estabelecimentos` | `raw` | Registra os estabelecimentos vinculados às empresas |
| `motivos` | `raw` | Lista os códigos e descrições dos motivos de situação cadastral |
| `municipios` | `raw` | Contém os códigos e nomes dos municípios |
| `naturezas` | `raw` | Tabela de códigos e descrições das naturezas jurídicas |
| `paises` | `raw` | Lista os códigos e nomes dos países |
| `qualificacoes` | `raw` | Armazena os códigos e descrições das qualificações de sócios |
| `simples` | `raw` | Indica a opção da empresa pelo Simples Nacional e MEI |
| `socios` | `raw` | Contém os dados dos sócios das empresas |
| `portes` | `raw` | Contém os dados dos portes das empresas |
| `situacoes` | `raw` | Contém os dados das situações cadastrais das empresas |

Os dados dos arquivos CSV presentes no Storage são importados para tabelas no BigQuery por meio de [Data Transfers](https://cloud.google.com/bigquery/docs/dts-introduction).

Os transfers foram configurados para serem executados sob demanda. Eles utilizam a opção **MIRROR**, o que significa que os dados existentes serão substituídos a cada execução.

Além disso, ao final, o arquivo CSV é excluído do Storage após a importação para o BigQuery.

| Nome | GCS Path | Dataset | Tabela |
|------|----------|---------|--------|
| `cnaes-storage-bq` | `gs://cloud-cnpj/cnaes/*.csv` | `raw` | `cnaes` |
| `empresas-storage-bq` | `gs://cloud-cnpj/empresas/*.csv` | `raw` | `empresas` |
| `estabelecimentos-storage-bq` | `gs://cloud-cnpj/estabelecimentos/*.csv` | `raw` | `estabelecimentos` |
| `motivos-storage-bq` | `gs://cloud-cnpj/motivos/*.csv` | `raw` | `motivos` |
| `municipios-storage-bq` | `gs://cloud-cnpj/municipios/*.csv` | `raw` | `municipios` |
| `naturezas-storage-bq` | `gs://cloud-cnpj/naturezas/*.csv` | `raw` | `naturezas` |
| `paises-storage-bq` | `gs://cloud-cnpj/paises/*.csv` | `raw` | `paises` |
| `qualificacoes-storage-bq` | `gs://cloud-cnpj/qualificacoes/*.csv` | `raw` | `qualificacoes` |
| `simples-storage-bq` | `gs://cloud-cnpj/simples/*.csv` | `raw` | `simples` |
| `socios-storage-bq` | `gs://cloud-cnpj/socios/*.csv` | `raw` | `socios` |

> Este procedimento não é agendado pois é controlado por um workflow.
> As entidades possuem o campo `data_criacao` que indica a data e hora de inserção daquele registro em cada tabela.

### 2. Camada gold

O dataset `gold` foi criado na **region** `us-central1`. Este dataset possui todas as tabelas com dados tratados, ou seja, dados refinados que serão úteis para o o consumo de usuários.

Esses dados são gerados por meio de execuções de [query agendadas do BigQuery](https://cloud.google.com/bigquery/docs/scheduling-queries). Essas queries lêm dados da camada `raw` e os disponibilizam em tabelas da camada `gold`.

| Tabela | Dataset | Descrição |
|--------|---------|-----------|
| `estabelecimentos` | `gold` | Unifica e trata todos os dados de empresas, sócios, estabelecimentos e demais entidades |

> Este procedimento não é agendado pois é controlado por um workflow.
> A entidade possui o campo `data_criacao` que indica a data e hora de inserção daquele registro na tabela.

## 💵 Custos

Considerando que todas as tabelas da camada `raw` utilizarão 20GB de armazenamento e a camada `gold` faz uso de 40GB, pelo fato de estar sendo utilizada a **region** `us-central1`, de acordo com a [tabela de custos](https://cloud.google.com/bigquery/pricing) e considerando o free tier, os valores seriam os seguintes:

| Operação | Custo por unidade | Uso estimado | Custo final (USD) |
|----------|-------------------|--------------|-------------------|
| Armazenamento (gold) | $0.02 por GB/mês | 40 GB | $0.80 |
| Armazenamento (raw) | $0.02 por GB/mês | 20 GB | $0.40 |
| Ingestão via Data Transfer (raw) | $0.00 (se origem for Google Cloud) | 60 GB | $0.00 |
| Processamento (ingestão na raw) | $5.00 por TB processado | 50 GB (0.05 TB) | $0.25 |
| Processamento (ingestão na gold) | $5.00 por TB processado | 50 GB (0.05 TB) | $0.25 |
| **Total mensal estimado** | **—** | **—** | **$1.70** |

## 🛠️ Como realizar o deploy

Antes de iniciar, certifique-se de possuir o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install) instalado em sua máquina. Além disso, é necessário que sua conta de e-mail vinculada ao projeto do Google Cloud possua as permissões necessárias.

Com tudo pronto, basta executar o script [`deploy.sh`](./deploy.sh), sempre lembrando de configurar as variáveis no início do arquivo.

> Esta não é uma etapa obrigatória, podendo ser realizada por meio da UI do [Google Console](https://console.cloud.google.com/bigquery).

### Notificações por e-mail

Para receber alertas em caso de falha, é necessário configurar as notificações manualmente pelo Cloud Console:

1. Acesse o [BigQuery Data Transfer Service](https://console.cloud.google.com/bigquery/transfers).
2. Selecione a transferência criada.
3. Clique em **"Editar configuração"**.
4. Ative a opção **"Enviar e-mails em caso de falha"**.
5. Salve as alterações.

## 🪛 Como trigar localmente

Caso ainda não tenha feito, certifique-se de possuir o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install) instalado em sua máquina. Além disso, é necessário que sua conta de e-mail vinculada ao projeto do Google Cloud possua as permissões necessárias.

```
bq mk --transfer_run \
    --project_id=$PROJECT \
    --location=$LOCATION \
    --run_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    projects/$PROJECT_ID/locations/us/transferConfigs/$TRANSFER_ID
```

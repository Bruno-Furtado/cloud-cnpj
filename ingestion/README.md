# Ingestion

Esta é a etapa de obtenção dos [dados do Cadastro Nacional da Pessoa Jurídica (CNPJ)](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj). A ingestão é responsável pela armazenamento dos dados no [Google Cloud Storage](https://cloud.google.com/storage) e pela execução do job, criado a partir do [Google Cloud Run](https://cloud.google.com/run), que realiza o download e processamento dos arquivos da Receita Federal.

## 🏗 Estrutura

```
├── storage/              # Responsável pelo armazenamento dos arquivos ZIP e CSV
│   ├── deploy.sh         # Script para criação do bucket
│   ├── README.md                   
│
├── cnpj-data-fetcher/    # Job responsável pela obtenção e processamento dos arquivos
│   ├── deploy.sh         # Script de deploy do job
│   ├── README.md
│   ├── ...
```

## 🩺 Como funciona

### 1. Criação do bucket de armazenamento

A primeira etapa da ingestão é a criação do bucket no Cloud Storage. Esse bucket armazenará os arquivos ZIP baixados da Receita Federal, bem como os arquivos CSV extraídos. A configuração do bucket está descrita no diretório [`storage`](./storage/), onde são definidos os critérios de armazenamento e organização dos dados.

### 2. Execução do job de ingestão

Após a configuração do armazenamento, o job [`cnpj-data-fetcher`](./cnpj-data-fetcher/) é responsável por realizar a busca, download, extração e o upload dos dados para o bucket. Esse job é executado diariamente para verificar a existência de novos arquivos e processá-los.

## 💵 Custos

Os custos associados a esta etapa de ingestão estão relacionados ao armazenamento dos dados e ao processamento do job. A estimativa de custos pode ser consultada nos diretórios [`storage`](./storage/) e [`cnpj-data-fetcher`](./cnpj-data-fetcher/), onde há detalhes sobre o consumo de CPU, memória e armazenamento.

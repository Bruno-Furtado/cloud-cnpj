![Data Updated](https://img.shields.io/badge/Data_Updated-2025/09-green)

<p>
    <small>🇧🇷 <a href="README.md">Versão em português</a></small>
</p>


<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/cloud-cnpj.firebasestorage.app/o/images%2Flogo.webp?alt=media&token=8b2851dd-ec33-4ee8-98ca-ab054c9b7f7b" width="200" alt="Cloud CNPJ">

  <h2 align="center">Free access to Brazilian company data</h2>
</p>

With **Cloud CNPJ**, you have access to Brazilian company data, obtained from the [official website of Receita Federal](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj) and made available for free.

> At this moment, we are providing the data for free through a table on [Google BigQuery](https://cloud.google.com/bigquery). Soon, we intend to make an API available (seeking very low-cost alternatives).

## 🩺 How it works

The entire infrastructure for obtaining, processing, and distributing the data is hosted on [Google Cloud Platform](https://cloud.google.com/). The steps outlined below are orchestrated by a workflow in [Google Workflow](https://cloud.google.com/workflows).

<p align="center">
  <br/>
  <img src="https://firebasestorage.googleapis.com/v0/b/cloud-cnpj.firebasestorage.app/o/images%2Fflow_v2.webp?alt=media&token=ec153049-edbe-4772-bba5-0b23966aba36" width="500" alt="Cloud CNPJ">
</p>

### 1. Ingestion

The files are obtained from the official Receita Federal repository and stored in a private bucket on Google Cloud Storage through a job created in Google Cloud Run.

> *For more details on file retrieval, access [ingestion](./ingestion/) (only in Portuguese)*.

### 2. Preparation

Using BigQuery Data Transfers, these files are migrated and become raw records within BigQuery tables, later transforming into processed records in other tables through scheduled query executions.

> *The data transformation step is detailed in [prepare](./prepare/) (only in Portuguese)*.

### 3. Usage

These processed data tables are made available to the public and can be queried by any user with a Google Cloud account.

> *More details on how to consume the data are available in [use](./use/) (only in Portuguese)*.

## 🚴‍♂️ How to use

1. Access [Google Cloud](https://cloud.google.com/) and click **Start for free**.
2. If you do not have a Google email, choose **Create account** and follow the steps.
3. You will be directed to the Billing page, but don't worry: there will be no charges.
4. Access the [BigQuery Console](https://console.cloud.google.com/bigquery) to execute SQL commands.
5. Run the command below to access Brazilian company data for free.

```sql
select *
from `cloud-cnpj.gold.estabelecimentos`
limit 10;

select *
from `cloud-cnpj.gold.estabelecimentos`
where cnpj = '00000000188484';

select *
from `cloud-cnpj.gold.estabelecimentos`
where razao_social = 'BANCO DO BRASIL SA';

select *
from `cloud-cnpj.gold.estabelecimentos`
where situacao_cadastral.codigo = '02' -- empresas ativas
limit 10;

select *
from `cloud-cnpj.gold.estabelecimentos`
where simples.opcao = true -- empresas optantes pelo Simples Nacional
limit 10;

select *
from `cloud-cnpj.gold.estabelecimentos`
where cnpj_basico = '00000000'; -- empresas matriz e suas filiais
 
select *
from `cloud-cnpj.gold.estabelecimentos` e,
unnest(e.socios) as s
where lower(normalize(s.nome, nfd)) = 'jair messias bolsonaro'; -- empresas por sócio
```

> Google Cloud has a [free access tier](https://cloud.google.com/free). More specifically about BigQuery, the first 1TB of data queried per month is free (the entire "estabelecimentos" table is about 40GB), as stated [on this page](https://cloud.google.com/bigquery/pricing?#free-tier).

## 🛠️ Contribution

Contributions are welcome! Check the [`CONTRIBUTING.md`](CONTRIBUTING.md) (only in Portuguese) file for guidelines.

## 📜 License

This project is licensed under the **MIT License** - see the [`LICENSE`](LICENSE) file for more details.

---

<p align="center">Made with ❤️ in Curitiba 🌳 ☔️</p>


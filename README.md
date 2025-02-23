![Dados Atualizados](https://img.shields.io/badge/Dados_Atualizados-2025/02-green)


<p>
  <small>🇺🇸 <a href="README_en.md">English version</a></small>
</p>

<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/cloud-cnpj.firebasestorage.app/o/images%2Flogo.webp?alt=media&token=8b2851dd-ec33-4ee8-98ca-ab054c9b7f7b" width="200" alt="Cloud CNPJ">

  <h2 align="center">Acesso gratuito aos dados de empresas do Brasil</h2>
</p>

Com o **Cloud CNPJ**, você tem acesso aos dados das empresas brasileiras, obtidos do [site oficial da Receita Federal](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj) e disponibilizados gratuitamente.

> Neste momento, estamos fornecendo os dados de forma gratuita por meio de uma tabela no [Google BigQuery](https://cloud.google.com/bigquery). Pretendemos, em breve (buscando alternativas de baixíssimo custo), disponibilizar uma API.

## 🩺 Como funciona

Toda a infraestrutura para obtenção, tratamento e distribuição dos dados está hospedada no [Google Cloud Platform](https://cloud.google.com/). As etapas citadas abaixo são orquestradas por um fluxo no [Google Workflow](https://cloud.google.com/workflows).

<p align="center">
  <br/>
  <img src="https://firebasestorage.googleapis.com/v0/b/cloud-cnpj.firebasestorage.app/o/images%2Fflow_v3.webp?alt=media&token=9c487c8f-ef7b-4455-9fb3-174f3afea037" width="500" alt="Cloud CNPJ">
</p>

### 1. Ingestão

Os arquivos são obtidos do repositório oficial da Receita Federal e armazenados em um bucket privado no Google Cloud Storage por meio de um job criado no Google Cloud Run.

> *Para obter mais detalhes sobre a obtenção dos arquivos, acesse [ingestion](./ingestion/)*.

### 2. Preparação

Fazendo uso do BigQuery Data Transfers, esses arquivos são migrados e se transformam em registros brutos dentro de tabelas do BigQuery, tornando-se posteriormente registros tratados em outras tabelas a partir de execuções de queries agendadas.

> *A etapa de transformação dos dados é detalhada em [prepare](./prepare/)*.

### 3. Uso

Essas tabelas com dados tratados são disponibilizadas ao público e podem ser consultadas por qualquer usuário com conta no Google Cloud.

> *Mais detalhes sobre como consumir os dados estão disponíveis em [use](./use/)*.

## 🚴‍♂️ Como utilizar

1. Acesse o [Google Cloud](https://cloud.google.com/) e clique em **Comece a usar gratuitamente**.
2. Caso não possua um e-mail Google, opte por **Criar conta** e siga os passos.
3. Você será direcionado para a página de Billing, mas não se preocupe: não haverá cobranças.
4. Acesse o [Console do BigQuery](https://console.cloud.google.com/bigquery) para execução de comandos SQL.
5. Execute o comando abaixo e tenha acesso aos dados de empresas do Brasil gratuitamente.

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

> O Google Cloud possui um [nível de acesso gratuito](https://cloud.google.com/free). Quando falamos mais especificamente sobre o BigQuery, os primeiros 1TB de dados consultados no mês são gratuitos (a tabela estabelecimentos toda possui cerca de 40GB), conforme informado [nesta página](https://cloud.google.com/bigquery/pricing?#free-tier).

## 🛠️ Contribuição

Contribuições são bem-vindas! Consulte o arquivo [`CONTRIBUTING.md`](CONTRIBUTING.md) para diretrizes.

## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [`LICENSE`](LICENSE) para mais detalhes.

---

<p align="center">Made with ❤️ in Curitiba 🌳 ☔️</p>


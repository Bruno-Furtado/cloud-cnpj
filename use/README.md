# Use

Nesta etapa, a principal função é disponibilizar os dados para consumo, garantindo que sejam facilmente acessíveis.

## 🏗 Estrutura

```
├── cnpj-data-distributor/  # Job que leva os dados do BigQuery para um banco de baixa latência
├── deploy.sh               # Script para tornar tabelas públicas
├── README.md
```

## 🩺 Como funciona

### 1. Dados disponibilizados no BigQuery

Os dados disponíveis para qualquer usuário que possua uma conta no [Google Cloud](https://cloud.google.com/).

Atualmente, há apenas uma tabela disponibilizada (`estabelecimentos`). Seu dicionário de dados pode ser visualizado nos detalhes da tabela ou no arquivo [create.sql](../prepare/gold/create.sql). Abaixo, seguem algumas das diversas opções de queries que podem ser executadas:

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

### 2. API pública

Ainda estamos trabalhando em uma solução para disponibilizar os dados em uma API, buscando alternativas de baixo custo. Após algumas pesquisas, foi levantada a possibilidade de uso do [Firestore](https://firebase.google.com/docs/firestore) para disponibilização desses dados em um banco de baixa latência.


## 🛠️ Como realizar o deploy

Antes de iniciar, certifique-se de possuir o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install) instalado em sua máquina. Além disso, é necessário que sua conta de e-mail vinculada ao projeto do Google Cloud possua as permissões necessárias.

Com tudo pronto, basta executar o script [`deploy.sh`](./deploy.sh), sempre lembrando de configurar as variáveis no início do arquivo.

> Esta não é uma etapa obrigatória, podendo ser realizada por meio da UI do [Google Console](https://console.cloud.google.com/bigquery).

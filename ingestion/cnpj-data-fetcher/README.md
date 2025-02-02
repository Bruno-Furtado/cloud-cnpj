# cnpj-data-fetcher

Este é um [Cloud Run Job](https://cloud.google.com/run/docs/create-jobs), construído em [NodeJS](https://nodejs.org). O job é responsável por baixar os [arquivos ZIP da Receita Federal](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj), realizar a extração de seus conteúdos e armazená-los no [Cloud Storage](https://cloud.google.com/storage).

## 🏗 Estrutura

```
├── src/
│   ├── config/
│   │   ├── env.js         # Variáveis de ambiente
│   │
│   ├── controller/
│   │   ├── fetcher.js     # Orquestração do scraping, download, extração e upload para o GCP
│   │
│   ├── service/
│   │   ├── download.js    # Download do arquivo ZIP da Receita
│   │   ├── extract.js     # Extração do arquivo CSV oriundo do ZIP
│   │   ├── scraping.js    # Scraping da página da Receita
│   │   ├── storage.js     # Manipulação de arquivos no GCS
│   │
│   ├── util/
│   │   ├── logger.js      # Logs estruturados
│   │   ├── alert.js       # Envio de alertas para o Slack
│   │   ├── helper.js      # Funções auxiliares
│   │
│   ├── main.js            # Ponto de entrada do processo
│
├── package.json
├── package-lock.json
├── Dockerfile
├── README.md
```

## 🩺 Como funciona

Este job será executado 1x por dia na **região** `us-central1`, com 2 CPUs, 8GB de memória, sem retry e criação de apenas 1 task. Quando há atualização de dados (uma vez por mês), o processo dura cerca de 3 horas. Nas outras execuções, ele leva menos de 1 minuto, pois apenas verifica se precisa ser executado (isto é feito pois não sabemos o dia em que a receita proverá a atualização).

### 1. Scraping do repositório da Receita Federal

Inicialmente, é realizada uma chamada para o repositório oficial da Receita Federal.

Em seguida, identificamos a última versão dos dados disponível, pois a Receita gera todos os dados mensalmente e os organiza em diretórios, como `2025-01`, representando janeiro de 2025.

Após identificar o diretório mais atual, os nomes dos arquivos ZIP também são obtidos para posterior download.

### 2. Verificação do processamento mensal

Caso os dados do mês já tenham sido processados, o job encerra antes de realizar qualquer download.

Isso ocorre porque há um arquivo armazenado no bucket que registra a última versão de dados processados. Esse arquivo é atualizado após a última etapa do job, evitando custos desnecessários.

### 3. Download dos dados

Se os dados mais recentes ainda não foram obtidos, o processo de download é iniciado.

Caso o arquivo CSV correspondente ao ZIP não esteja armazenado, conforme descrito em [storage](../storage/), o download começa. À medida que os dados são recebidos, eles são gravados diretamente para evitar sobrecarga de memória.

### 4. Extração dos dados

Após o download, o conteúdo do ZIP é extraído linha a linha, validando o charset e gerando um arquivo CSV com o mesmo nome do ZIP.

### 5. Upload dos dados

Por fim, o CSV é enviado para o bucket e o arquivo ZIP é excluído.

> Durante todas as etapas, o job gera logs que são enviadas para o [Google Cloud Logging](https://cloud.google.com/logging), além de alertas para um canal no [Slack](https://slack.com).

## 💵 Custos

Considerando as condições de execução e a [tabela de preços](https://cloud.google.com/run/pricing) com o free tier, temos os seguintes custos:

| **Operação** | **Custo por unidade** | **Uso estimado** | **Custo final (USD)** |
|--------------|-----------------------|------------------|-----------------------|
| Tempo de CPU (execução completa) | $0.000024 por CPU-minuto | 360 CPU-minutos | $0.00864 |
| Tempo de Memória (execução completa) | $0.0000025 por GB-minuto | 1,440 GB-minutos | $0.0036 |
| Solicitação (execução completa) | $0.40 por 1M solicitações | 1 solicitação | $0.0000004 |
| Tempo de CPU (execuções rápidas) | $0.000024 por CPU-minuto | 58 CPU-minutos | $0.001392 |
| Tempo de Memória (execuções rápidas) | $0.0000025 por GB-minuto | 232 GB-minutos | $0.00058 |
| Solicitações (execuções rápidas) | $0.40 por 1M solicitações | 29 solicitações | $0.0000116 |
| **Total mensal estimado** | **—** | **—** | **$0.01422** |
| **Total após nível gratuito** | **—** | **—** | **$0.00** |

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
PROCESS=cnpj-data-fetcher
GOOGLE_CLOUD_PROJECT=cloud-cnpj
GOOGLE_CLOUD_BUCKET=cloud-cnpj
RECEITA_FEDERAL_URL=https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
LOG_ENABLED=true
SLACK_NOTIFICATIONS_ENABLED=false
```

Instale as dependências e execute o job localmente:
```sh
npm install
npm start
```

> Se não for usar notificações do Slack, não é necessário configurar a URL. Para ativá-las, siga [estas instruções](https://api.slack.com/messaging/webhooks).

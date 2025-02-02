# Storage

Os dados de CNPJs de empresas do Brasil são disponibilizados em um [repositório de arquivos ZIP da Receita Federal](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-jurídica---cnpj). O [Google Cloud Storage](https://cloud.google.com/storage) foi a solução escolhida para realizar esse armazenamento, pois é uma ferramenta de fácil uso, baixo custo, bem documentada e amplamente utilizada pela comunidade.

## 🏗 Estrutura

```
├── cloud-cnpj/                     
│   ├── last_folder.txt             # Indica a última versão de dados obtidos
│   ├── cnaes/                      # Armazena arquivos ZIPs e CSVs
│   ├── empresas/                   # Armazena arquivos ZIPs e CSVs
│   ├── estabelecimentos/           # Armazena arquivos ZIPs e CSVs
│   ├── motivos/                    # Armazena arquivos ZIPs e CSVs
│   ├── municipios/                 # Armazena arquivos ZIPs e CSVs
│   ├── naturezas/                  # Armazena arquivos ZIPs e CSVs
│   ├── paises/                     # Armazena arquivos ZIPs e CSVs
│   ├── qualificacoes/              # Armazena arquivos ZIPs e CSVs
│   ├── simples/                    # Armazena arquivos ZIPs e CSVs
│   ├── socios/                     # Armazena arquivos ZIPs e CSVs
```

## 🩺 Como funciona

### 1. Sobre o bucket

O bucket foi criado na **região** `us-central1`, que é a localização geográfica onde os dados estão armazenados. Essa escolha foi baseada no preço. O Google disponibiliza algumas opções, como **multi-region** (maior custo e maior redundância de dados entre várias regiões) e **region** (menor custo e redundância na região). Como para este caso não há muitos benefícios em utilizar **multi-region**, optou-se pelo uso da **region** citada anteriormente.

Quanto à classe de armazenamento (responsável por definir as operações de inserção, leitura, deleção, entre outras), optou-se pelo uso da `Standard`, pois a solução em questão trabalha com armazenamento de dados a curto prazo.

As demais configurações relacionadas ao controle de acesso e proteção dos dados seguirão o padrão, sendo privados.

### 2. Sobre a organização

Optou-se pela criação de uma pasta para cada tipo de dado (CNAEs, Empresas, etc.), pois a Receita disponibiliza um ou mais arquivos ZIP para a mesma entidade. Organizando os diretórios dessa forma, centralizamos os arquivos relacionados a cada uma delas, conseguindo criar lógicas individuais para o posterior tratamento desses dados.

### 3. Sobre as operações

Os dados são obtidos e armazenados em formato ZIP. Após a extração, os arquivos CSV são gerados, utilizados e excluídos. Como os dados são atualizados mensalmente, esse processo ocorre apenas uma vez ao mês.

Sendo assim, temos as seguintes operações:
1. Escrita de arquivos ZIP por meio de download do site da Receita.
2. Leitura de arquivos ZIP para posterior extração.
3. Escrita de arquivos CSV por meio da extração.
4. Remoção dos arquivos ZIP.
5. Leitura dos arquivos CSV pelos processos de processamento dos dados.
6. Remoção dos arquivos CSV.

## 💵 Custos

Considerando o [free tier](https://cloud.google.com/storage/pricing?hl=pt-br#cloud-storage-always-free) e a [tabela de preços](https://cloud.google.com/storage/pricing) para a região `us-central1`, classe `Standard`, estabelecemos a seguinte estimativa de gastos mensais:

| **Operação** | **Custo por unidade** | **Uso estimado** | **Custo final (USD)** |
|--------------|-----------------------|------------------|-----------------------|
| Armazenamento (ZIP + CSV) | $0.020 por GB/mês | (32GB - 5GB Free Tier) = 27GB | $0.54/mês |
| Escrita de arquivos (Classe A) | $0.05 por 10.000 operações | 5.000 operações grátis | $0.00 |
| Leitura dos arquivos (Classe B) | $0.004 por 10.000 operações | 50.000 operações grátis | $0.00 |
| Remoção dos arquivos (Gratuito) | operações grátis | operações grátis | $0.00 |
| **Total estimado** | **—** | **—** | **$0.54/mês** |

## 🛠️ Como realizar o deploy

Antes de iniciar, certifique-se de possuir o [Google Cloud SDK CLI](https://cloud.google.com/sdk/docs/install) instalado em sua máquina. Além disso, é necessário que sua conta de e-mail vinculada ao projeto do Google Cloud possua as permissões necessárias.

Com tudo pronto, basta executar o script [`deploy.sh`](./deploy.sh), sempre lembrando de configurar as variáveis no início do arquivo.

> Esta não é uma etapa obrigatória, podendo ser realizada por meio da UI do [Google Console](https://console.cloud.google.com/storage/browser).

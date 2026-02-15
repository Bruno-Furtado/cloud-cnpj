# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloud CNPJ is a GCP-based data pipeline that ingests, processes, and distributes Brazilian company (CNPJ) registry data from Receita Federal. It has three layers: ingestion → preparation → usage.

## Commands

### Ingestion service (ingestion/cnpj-data-fetcher)
```bash
cd ingestion/cnpj-data-fetcher && npm install
npm start   # node --no-warnings src/main.js
```

### Distributor service (use/cnpj-data-distributor)
```bash
cd use/cnpj-data-distributor && npm install
npm start   # node --no-warnings src/main.js
npm test    # node --no-warnings src/test.js
```

### Docker build (both services)
```bash
docker build --platform=linux/amd64 -t <image-name> .
```

### Deployment (each layer has its own deploy.sh)
```bash
bash ingestion/cnpj-data-fetcher/deploy.sh
bash prepare/deploy.sh
bash use/deploy.sh
bash workflow/deploy.sh
```

## Architecture

### Three-layer pipeline

1. **Ingestion** (`ingestion/cnpj-data-fetcher/`): Node.js Cloud Run job that scrapes Receita Federal, downloads ZIP files, extracts CSVs (with charset conversion via iconv-lite), and uploads to Cloud Storage.

2. **Preparation** (`prepare/`): BigQuery SQL layer. `raw/` defines 11 tables loaded from CSVs via Data Transfers. `gold/` transforms raw data into a single unified `estabelecimentos` table with nested structures.

3. **Usage** (`use/cnpj-data-distributor/`): Node.js Cloud Run job that queries BigQuery gold data and batch-writes to Firestore for low-latency access.

### Orchestration

`workflow/cnpj-zip-bq.yaml` is a Google Workflows definition that coordinates the full pipeline: triggers ingestion → launches 10 parallel Data Transfers → runs gold scheduled queries → executes Firestore migration.

### Code patterns

- Node.js 20 with ES Modules (not TypeScript, not CommonJS)
- MVC-like structure: `config/` → `controller/` → `service/` → `util/`
- All configuration via dotenv (`.env` files)
- Google Cloud SDKs: @google-cloud/storage, bigquery, firestore, logging
- Error handling with Slack webhook alerts (`@slack/webhook`)
- HTTP via axios with axios-retry

### Key data tables (BigQuery raw dataset)

cnaes, empresas, estabelecimentos, motivos, municipios, naturezas, paises, qualificacoes, simples, socios, portes, situacoes

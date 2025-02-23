import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis do arquivo .env para `process.env`

/**
 * Configuração carregada a partir das variáveis de ambiente.
 * 
 * @type {Object}
 * @property {string} process - O nome do processo que será usado para nomear os logs (ex: "bq-firestore-migrator").
 * @property {string} project - O nome do projeto no Google Cloud.
 * @property {string} region - A location/region do dataset/tabela no BigQuery (ex: "us-central1").
 * @property {string} dataset - O nome do dateset no BigQuery.
 * @property {string} table - O nome da tabela no BigQuery.
 * @property {boolean} logEnabled - Se `true`, os logs serão exibidos apenas no console.
 * @property {boolean} slackEnabled - Se `true`, as notificações para o Slack serão ativadas.
 * @property {string} slackWebhookUrl - URL do webhook do Slack para envio de alertas.
 */
const env = {
    process: process.env.PROCESS,

    project: process.env.GOOGLE_CLOUD_PROJECT,
    region: process.env.GOOGLE_CLOUD_REGION,
    dataset: process.env.BIGQUERY_DATASET,
    table: process.env.BIGQUERY_TABLE,

    collection: process.env.FIRESTORE_COLLECTION,
    
    logEnabled: process.env.LOG_ENABLED === 'true',
    slackEnabled: process.env.SLACK_NOTIFICATIONS_ENABLED === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL
};

export default env;

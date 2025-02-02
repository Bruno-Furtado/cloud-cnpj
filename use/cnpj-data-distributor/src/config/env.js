import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis do arquivo .env para `process.env`

/**
 * Configuração carregada a partir das variáveis de ambiente.
 * 
 * @type {Object}
 * @property {string} project - O ID do projeto no Google Cloud.
 * @property {string} dataset - O nome do dataset no BigQuery.
 * @property {string} table - O nome da tabela no BigQuery.
 * @property {string} location - A região do BigQuery.
 * @property {number} queryLimit - O número de registros por consulta no BigQuery. 
 * @property {string} firestoreCollection - O nome da coleção no Firestore.
 * @property {number} batchSize - O tamanho do batch de escrita no Firestore.
 * @property {boolean} logEnabled - Se `true`, os logs serão exibidos apenas no console.
 * @property {boolean} slackEnabled - Se `true`, as notificações para o Slack serão ativadas.
 * @property {string} slackWebhookUrl - URL do webhook do Slack para envio de alertas.
 */
const env = {
    project: process.env.GOOGLE_CLOUD_PROJECT,

    dataset: process.env.BIGQUERY_DATASET,
    table: process.env.BIGQUERY_TABLE,
    location: process.env.BIGQUERY_LOCATION,
    queryLimit: parseInt(process.env.QUERY_LIMIT, 10) || 10000,

    firestoreCollection: process.env.FIRESTORE_COLLECTION,
    batchSize: parseInt(process.env.BATCH_SIZE, 10) || 400,

    logEnabled: process.env.LOG_ENABLED === 'true',
    slackEnabled: process.env.SLACK_NOTIFICATIONS_ENABLED === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL
};

export default env;
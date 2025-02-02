import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis do arquivo .env para `process.env`

/**
 * Configuração carregada a partir das variáveis de ambiente.
 * 
 * @type {Object}
 * @property {string} process - O nome do processo que será usado para nomear os logs (ex: "cnpj-data-fetcher").
 * @property {string} project - O nome do projeto no Google Cloud.
 * @property {string} bucket - O nome do bucket onde os arquivos ZIP e CSV serão armazenados.
 * @property {string} receitaFederalUrl - URL para acessar os dados da Receita Federal.
 * @property {boolean} logEnabled - Se `true`, os logs serão exibidos apenas no console.
 * @property {boolean} slackEnabled - Se `true`, as notificações para o Slack serão ativadas.
 * @property {string} slackWebhookUrl - URL do webhook do Slack para envio de alertas.
 */
const env = {
    process: process.env.PROCESS,

    project: process.env.GOOGLE_CLOUD_PROJECT,
    bucket: process.env.GOOGLE_CLOUD_BUCKET,

    receitaFederalUrl: process.env.RECEITA_FEDERAL_URL,
    
    logEnabled: process.env.LOG_ENABLED === 'true',
    slackEnabled: process.env.SLACK_NOTIFICATIONS_ENABLED === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL
};

export default env;

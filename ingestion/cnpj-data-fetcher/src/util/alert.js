import axios from 'axios';
import env from '../config/env.js';
import helper from './helper.js'
import logger from './logger.js';

/**
 * Envia um alerta para o Slack.
 *
 * @param {string} message - A mensagem a ser enviada como alerta.
 * @returns {Promise<void>} - Retorna uma Promise que é resolvida após o envio da mensagem.
 */
const send = async (message) => {
    const stackTraceDetails = helper.getStackTraceDetails();

    if (!env.slackEnabled) {
        logger.info('Notificações no Slack estão desabilitadas.', stackTraceDetails);
        return Promise.resolve();
    }

    try {
        await axios.post(env.slackWebhookUrl, { text: message });
    } catch (e) {
        logger.error(e, stackTraceDetails);
        throw e;
    }
};

export default { send };

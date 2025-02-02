import { Logging } from '@google-cloud/logging';
import env from '../config/env.js';

// Gerar um ID único para a execução
const EXECUTION_ID = Date.now();

/**
 * Função que formata a mensagem e registra no console ou no Google Cloud Logging.
 * 
 * @param {string} severity - Nível de severidade do log (INFO, ERROR, etc).
 * @param {(string|Error)} message - A mensagem ou o erro a ser registrado.
 * @param {string} [functionName='N/A'] - O nome da função que gerou o log (opcional).
 * 
 * @returns {void}
 */
const _logMessage = async (severity, message, functionName = 'N/A') => {
    if (message instanceof Error) {
        message = message.stack;
    }

    if (env.logEnabled) {
        const formattedMessage = `[${severity}] [${functionName}] : ${message}`;
        console[severity.toLowerCase()]?.(formattedMessage);
        return;
    }

    try {
        const logging = new Logging({ projectId: env.project });
        const log = logging.log(env.process || 'ingestor');
        await log.write(log.entry({ severity, resource: { type: 'global' } }, {
            executionId: EXECUTION_ID,
            message,
            function: functionName,
            process: env.process,
            timestamp: new Date().toISOString()
        }));
    } catch (e) {
        console.error(`[LOG ERROR] ${e.message}`);
    }
};

/**
 * Objeto que contém os métodos para registrar logs de informação e erro.
 * 
 * @type {Object}
 */
const logger = {
    /**
     * Registra uma mensagem de informação no log.
     * 
     * @param {string} message - A mensagem a ser registrada.
     * @param {string} [functionName] - O nome da função que gerou o log (opcional).
     * 
     * @returns {void}
     */
    info: (message, functionName) => _logMessage('INFO', message, functionName),

    /**
     * Registra uma mensagem de erro no log.
     * 
     * @param {string} message - A mensagem a ser registrada.
     * @param {string} [functionName] - O nome da função que gerou o log (opcional).
     * 
     * @returns {void}
     */
    error: (message, functionName) => _logMessage('ERROR', message, functionName)
};

export default logger;

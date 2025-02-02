import { parse } from 'node-html-parser';
import helper from '../util/helper.js';
import http from '../util/http.js';
import logger from '../util/logger.js';

/**
 * Obtém o diretório mais recente disponível no servidor da Receita Federal.
 * 
 * @returns {Promise<string>} - Retorna o nome do diretório mais recente.
 * 
 * @throws {Error} Se houver falha na obtenção do diretório.
 */
const getLatestDirectory = async () => {
    const functionName = helper.getStackTraceDetails();

    try {
        logger.info('Obtendo diretório mais recente...', functionName);

        const response = await http.get('/');
        const root = parse(response.data);
        const directories = root.querySelectorAll('a')
            .map(a => a.getAttribute('href'))
            .filter(href => href.endsWith('/') && href.startsWith('202'))
            .map(dir => dir.replace(/\/$/, ''));

        const latestDirectory = directories.sort().reverse()[0] || '';

        logger.info(`Diretório mais recente encontrado: ${latestDirectory}`, functionName);

        return latestDirectory;
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

/**
 * Obtém a lista de arquivos ZIP disponíveis no diretório mais recente.
 * 
 * @param {string} directory - O diretório onde os arquivos estão armazenados.
 * @returns {Promise<string[]>} - Retorna uma lista de arquivos ZIP disponíveis.
 * 
 * @throws {Error} Se houver falha na obtenção dos arquivos.
 */
const getLatestFiles = async (directory) => {
    const functionName = helper.getStackTraceDetails();

    try {
        logger.info(`Obtendo lista de arquivos em ${directory}...`, functionName);

        const response = await http.get(`/${directory}`);
        const root = parse(response.data);
        const files = root.querySelectorAll('a')
            .map(a => a.getAttribute('href'))
            .filter(href => href.endsWith('.zip'));

        logger.info(`Arquivos encontrados: ${files.join(', ')}`, functionName);

        return files;
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { getLatestDirectory, getLatestFiles };

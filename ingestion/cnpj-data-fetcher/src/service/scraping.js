import helper from '../util/helper.js';
import http from '../util/http.js';
import logger from '../util/logger.js';

/**
 * Executa um PROPFIND no WebDAV e retorna os hrefs encontrados.
 *
 * @param {string} path - O caminho relativo para consultar.
 * @returns {Promise<string[]>} - Lista de hrefs extraídos da resposta.
 */
const propfind = async (path) => {
    const response = await http.request({
        method: 'PROPFIND',
        url: path,
        headers: { 'Depth': '1' }
    });

    const hrefs = [];
    const regex = /<d:href>([^<]+)<\/d:href>/g;
    let match;
    while ((match = regex.exec(response.data)) !== null) {
        hrefs.push(decodeURIComponent(match[1]));
    }

    return hrefs;
};

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

        const hrefs = await propfind('/');
        const directories = hrefs
            .filter(href => href.endsWith('/'))
            .map(href => href.replace(/\/$/, '').split('/').pop())
            .filter(dir => dir.startsWith('202'));

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

        const hrefs = await propfind(`/${directory}/`);
        const files = hrefs
            .filter(href => href.endsWith('.zip'))
            .map(href => href.split('/').pop());

        logger.info(`Arquivos encontrados: ${files.join(', ')}`, functionName);

        return files;
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { getLatestDirectory, getLatestFiles };

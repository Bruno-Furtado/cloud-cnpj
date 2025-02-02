import fs from 'fs';
import env from '../config/env.js';
import helper from '../util/helper.js';
import http from '../util/http.js';
import logger from '../util/logger.js';

/**
 * Baixa um arquivo da Receita Federal.
 * 
 * @param {string} period - O período do arquivo (exemplo: '2025-01').
 * @param {string} fileName - O nome do arquivo a ser baixado (exemplo: 'Cnaes.zip').
 * @param {string} destination - O caminho onde o arquivo será salvo.
 * @returns {Promise<string>} - Retorna o caminho onde o arquivo foi salvo.
 */
const fileFromUrl = async (period, fileName, destination) => {
    const functionName = helper.getStackTraceDetails();
    const fileUrl = `${period}/${fileName}`;
    const fullUrl = `${env.receitaFederalUrl}/${fileUrl}`;

    if (fs.existsSync(destination)) {
        logger.info(`Arquivo ${fileName} já existe em ${destination}. Pulando download.`, functionName);
        return destination;
    }

    try {
        logger.info(`Baixando o arquivo ${fileName} de ${fullUrl}.`, functionName);

        const writer = fs.createWriteStream(destination);
        const response = await http.get(fileUrl, { responseType: 'stream' });

        const totalBytes = response.headers['content-length'] ? parseInt(response.headers['content-length'], 10) : null;
        let receivedBytes = 0;
        let lastLoggedMB = 0;
        
        response.data.on('data', (chunk) => {
            receivedBytes += chunk.length;
            const downloadedMB = Math.floor(receivedBytes / (10 * 1024 * 1024)) * 10; // Garante múltiplos exatos de 10MB
        
            if (downloadedMB > lastLoggedMB) { // Só loga quando um novo bloco de 10MB for ultrapassado
                lastLoggedMB = downloadedMB;
                const progress = totalBytes ? `(${((receivedBytes / totalBytes) * 100).toFixed(2)}%)` : '';
                logger.info(`Baixados ${downloadedMB} MB de ${fileName} ${progress}`, functionName);
            }
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                logger.info(`Arquivo ${fileName} baixado com sucesso (${(receivedBytes / (1024 * 1024)).toFixed(2)} MB)`, functionName);
                resolve(destination);
            });
            writer.on('error', (e) => {
                logger.error(e, functionName);
                reject(e);
            });
        });
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { fileFromUrl };

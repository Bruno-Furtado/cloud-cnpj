import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import env from '../config/env.js';
import helper from '../util/helper.js';
import logger from '../util/logger.js';

/**
 * Nome do arquivo que armazenará a última pasta processada no GCP.
 */
const LAST_PROCESSED_FILE = 'last_folder.txt';

const storage = new Storage();
const bucket = storage.bucket(env.bucket);

/**
 * Gera o caminho correto de destino no GCP, seguindo o novo padrão.
 * @param {string} period - Período do arquivo (exemplo: '2025-01').
 * @param {string} fileName - Nome do arquivo original (exemplo: 'Estabelecimentos0.csv').
 * @returns {string} - Caminho formatado para upload.
 */
const _getStoragePath = (period, fileName) => {
    const match = fileName.match(/^([a-zA-Z]+)/); // Captura apenas a parte inicial do nome do arquivo
    const category = match ? match[1].toLowerCase() : 'outros'; // Define a pasta correta
    return `${category}/${period}_${fileName.toLowerCase()}`;
};

/**
 * Verifica se um arquivo já existe no Google Cloud Storage.
 * 
 * @param {string} period - Período do arquivo.
 * @param {string} fileName - Nome do arquivo CSV.
 * @returns {Promise<boolean>} - Retorna `true` se o arquivo já estiver no Storage.
 */
const fileExists = async (period, fileName) => {
    const functionName = helper.getStackTraceDetails();
    const destination = _getStoragePath(period, fileName);
    const file = bucket.file(destination);

    try {
        const [exists] = await file.exists();
        if (exists) {
            logger.info(`Arquivo ${destination} já existe no GCP. Pulando upload.`, functionName);
        }
        return exists;
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

/**
 * Faz o upload de um arquivo extraído para o Google Cloud Storage usando stream.
 * Após o upload, o arquivo CSV é excluído da `/tmp/` para liberar espaço.
 * 
 * @param {string} period - O período do arquivo (exemplo: '2025-01').
 * @param {string} fileName - O nome do arquivo extraído (exemplo: 'Cnaes.csv').
 * @param {string} filePath - O caminho completo do arquivo extraído.
 * @returns {Promise<void>} - Retorna uma Promise após o upload ser concluído ou pula se o arquivo já existir.
 */
const uploadFile = async (period, fileName, filePath) => {
    const functionName = helper.getStackTraceDetails();
    const destination = _getStoragePath(period, fileName);

    if (!fs.existsSync(filePath)) {
        logger.error(`Arquivo ${fileName} não encontrado para upload.`, functionName);
        throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    try {
        if (await fileExists(period, fileName)) return;

        logger.info(`Iniciando upload de ${fileName} para ${destination} no GCP via stream.`, functionName);

        await new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(filePath);
            const writeStream = bucket.file(destination).createWriteStream();

            readStream.pipe(writeStream)
                .on('finish', () => {
                    logger.info(`Arquivo ${fileName} enviado para ${destination} com sucesso.`, functionName);
                    
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        logger.info(`Arquivo CSV ${filePath} excluído após upload.`, functionName);
                    }
                    resolve();
                })
                .on('error', (e) => {
                    logger.error(e, functionName);
                    reject(e);
                });
        });
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

/**
 * Verifica se a pasta já foi processada e retorna `true` se sim.
 * @param {string} currentFolder - Nome da pasta atual (ex: '2025-02').
 * @returns {Promise<boolean>} - Retorna `true` se a pasta já foi processada.
 */
const wasFolderProcessed = async (currentFolder) => {
    const functionName = helper.getStackTraceDetails();
    const file = bucket.file(LAST_PROCESSED_FILE);

    try {
        const [exists] = await file.exists();

        if (exists) {
            const [contents] = await file.download();
            const lastProcessed = contents.toString().trim();

            if (lastProcessed === currentFolder) {
                logger.info(`A pasta ${currentFolder} já foi processada. Encerrando o job.`, functionName);
                return true;
            }
        }
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }

    return false;
};

/**
 * Atualiza o Cloud Storage com a última pasta processada.
 * @param {string} currentFolder - Nome da pasta atual (ex: '2025-02').
 * @returns {Promise<void>}
 */
const updateLastProcessedFolder = async (currentFolder) => {
    const functionName = helper.getStackTraceDetails();
    const file = bucket.file(LAST_PROCESSED_FILE);

    try {
        await file.save(currentFolder);
        logger.info(`Última pasta processada atualizada para ${currentFolder}.`, functionName);
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { fileExists, uploadFile, wasFolderProcessed, updateLastProcessedFolder };

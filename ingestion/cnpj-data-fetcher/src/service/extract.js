import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import helper from '../util/helper.js';
import logger from '../util/logger.js';
import iconv from 'iconv-lite';
import readline from 'readline';

/**
 * Extrai um arquivo ZIP para um diretório especificado e preserva a codificação corretamente.
 * Processa o CSV linha por linha para evitar carregamento excessivo de memória.
 * Após a extração, o arquivo ZIP é excluído para liberar espaço.
 * 
 * @param {string} fileName - O nome do arquivo ZIP a ser extraído (exemplo: 'Cnaes.zip').
 * @param {string} zipPath - O caminho completo do arquivo ZIP baixado.
 * @param {string} extractedFolder - O diretório onde os arquivos serão extraídos.
 * @returns {Promise<string>} - Retorna o caminho do arquivo extraído.
 */
const file = async (fileName, zipPath, extractedFolder) => {
    const functionName = helper.getStackTraceDetails();
    const extractedFileName = fileName.replace('.zip', '.csv'); 
    const extractedFilePath = path.join(extractedFolder, extractedFileName);

    try {
        logger.info(`Extraindo ${fileName} para ${extractedFolder}...`, functionName);

        if (!fs.existsSync(extractedFolder)) {
            fs.mkdirSync(extractedFolder, { recursive: true });
        }

        await new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Parse())
                .on('entry', async (entry) => {
                    const originalFileName = path.basename(entry.path);
                    const targetFilePath = path.join(extractedFolder, extractedFileName);

                    logger.info(`Extraindo ${originalFileName} como ${extractedFileName}.`, functionName);
                    
                    const writeStream = fs.createWriteStream(targetFilePath);
                    const readStream = entry.pipe(iconv.decodeStream('ISO-8859-1'));
                    
                    const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });
                    
                    for await (const line of rl) {
                        writeStream.write(line + '\n');
                    }
                    
                    writeStream.end();
                    writeStream.on('finish', () => {
                        logger.info(`Arquivo ${originalFileName} salvo como ${extractedFileName}.`, functionName);
                        resolve();
                    });
                })
                .on('error', reject);
        });

        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
            logger.info(`Arquivo ZIP ${zipPath} excluído após extração.`, functionName);
        }

        return extractedFilePath;
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { file };

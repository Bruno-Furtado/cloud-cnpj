import path from 'path';
import download from '../service/download.js';
import extract from '../service/extract.js';
import scraping from '../service/scraping.js';
import storage from '../service/storage.js';
import alert from '../util/alert.js';

const TEMP_DIR = '/tmp/'; // Diretório temporário padrão do Google Cloud Run
const EXTRACTED_DIR = '/tmp/extracted/';

/**
 * 🔍 Obtém o diretório mais recente e a lista de arquivos ZIP disponíveis para download.
 * 
 * @returns {Promise<{ period: string, files: string[] }>} - Retorna o período e os arquivos ZIP disponíveis.
 * 
 * @throws {Error} Se houver erro ao obter os dados via scraping.
 */
const _scrapeData = async () => {
    try {
        await alert.send('🔍 Buscando últimos arquivos disponíveis no site da Receita Federal...');

        const period = await scraping.getLatestDirectory();
        if (!period) {
            throw new Error('Não foi possível obter os arquivos mais recentes.');
        }

        const files = await scraping.getLatestFiles(period);
        if (!files.length) {
            throw new Error(`Nenhum arquivo encontrado no diretório ${period}.`);
        }

        await alert.send(`📂 Diretório mais atual: ${period}\n📄 Arquivos mais atuais: ${files.join(', ')}`);

        return { period, files };
    } catch (e) {
        await alert.send(`❌ Erro ao buscar arquivos no site da Receita Federal: ${e.message}`);
        throw e;
    }
};

/**
 * Executa o pipeline completo de download, extração e upload para um único arquivo.
 *
 * @param {string} period - Período da base de dados.
 * @param {string} fileName - Nome do arquivo ZIP a ser processado.
 * @returns {Promise<void>} - Retorna uma Promise que resolve após todas as etapas.
 */
const _processFile = async (period, fileName) => {
    const zipPath = path.join(TEMP_DIR, fileName);
    const extractedFolder = EXTRACTED_DIR;
    const extractedFileName = fileName.replace('.zip', '.csv');

    try {
        const alreadyExists = await storage.fileExists(period, extractedFileName);
        if (alreadyExists) {
            await alert.send(`✅ O arquivo ${extractedFileName} não precisa ser processado pois já está no Storage.`);
            return;
        }

        await alert.send(`📥 Baixando arquivo: ${fileName}...`);
        await download.fileFromUrl(period, fileName, zipPath);

        await alert.send(`🪤 Extraindo arquivo: ${fileName}...`);
        const extractedFilePath = await extract.file(fileName, zipPath, extractedFolder);

        await alert.send(`⏳ Fazendo upload: ${extractedFileName}...`);
        await storage.uploadFile(period, extractedFileName, extractedFilePath);

        await alert.send(`✅ Arquivo armazenado no Storage: ${fileName}`);
    } catch (e) {
        await alert.send(`❌ Erro ao manipular o arquivo ${fileName}: ${e.message}`);
        throw e;
    }
};

/**
 * Inicia o pipeline de processamento, executando os arquivos um por um (SEM PARALELISMO).
 */
const run = async () => {
    try {        
        await alert.send("🏂 O job foi iniciado.");
        const { period, files } = await _scrapeData();

        if (await storage.wasFolderProcessed(period)) {
            await alert.send(`🫡 O job encerrado pois o diretório ${period} já foi processado.`);
            return;
        }

        for (const file of files) {
            await _processFile(period, file);
        }

        await storage.updateLastProcessedFolder(period);

        await alert.send('🫡 O job foi encerrado com sucesso.');
    } catch (e) {
        await alert.send(`❌ O job foi encerrado com falha: ${e.message}`);
        throw e;
    }
};

export default { run };

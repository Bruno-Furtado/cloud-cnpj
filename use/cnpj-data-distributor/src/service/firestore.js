import { Firestore } from '@google-cloud/firestore';
import { Semaphore } from 'async-mutex';
import env from '../config/env.js';
import logger from '../util/logger.js';
import helper from '../util/helper.js';

const firestore = new Firestore();
const semaphore = new Semaphore(5); // Limita a concorrência no Firestore
const MAX_BATCH_SIZE = 400; // Máximo permitido pelo Firestore
const MAX_BATCH_BYTES = 9.5 * 1024 * 1024; // 10MB (limite do Firestore)

/**
 * Estima o tamanho de um objeto JSON em bytes.
 * @param {Object} obj - O objeto a ser estimado.
 * @returns {number} - Tamanho estimado em bytes.
 */
const _estimateSize = (obj) => Buffer.byteLength(JSON.stringify(obj), 'utf8');

/**
 * Converte campos de data do BigQuery para strings compatíveis com Firestore.
 *
 * @param {Object} row - Objeto contendo os dados da linha do BigQuery.
 * @returns {Object} - Objeto convertido, com datas no formato `YYYY-MM-DD`.
 */
const _normalizeRow = (row) => {
    const normalized = { ...row };

    for (const key in normalized) {
        if (normalized[key] && typeof normalized[key] === 'object') {
            if (normalized[key].value) {
                // Se for um objeto com valor, obtem o valor
                normalized[key] = normalized[key].value;
            } else if (normalized[key] instanceof Object && normalized[key].constructor.name === 'Big') {
                // Se for um tipo Big (NUMERIC no BigQuery), converte para Number
                normalized[key] = Number(normalized[key].toString());
            } else if (Array.isArray(normalized[key])) {
                // Se for um array, normaliza cada item do array
                normalized[key] = normalized[key].map(_normalizeRow);
            } else {
                // Se for um STRUCT, chama recursivamente
                normalized[key] = _normalizeRow(normalized[key]);
            }
        }
    }

    return normalized;
};

/**
 * Divide os registros em batches respeitando o limite de 10MB.
 * @param {Array<Object>} rows - Lista de registros a serem inseridos.
 * @returns {Array<Array<Object>>} - Lista de batches otimizados.
 */
const _splitIntoValidBatches = (rows) => {
    let batches = [];
    let currentBatch = [];
    let currentSize = 0;

    for (const row of rows) {
        const normalizedRow = _normalizeRow(row);
        const rowSize = _estimateSize(normalizedRow);

        // Se um único registro for maior que 10MB, logamos erro e ignoramos
        if (rowSize > MAX_BATCH_BYTES) {
            logger.error(`Documento excede 10MB e será ignorado: ${row.cnpj} (${rowSize} bytes)`);
            continue;
        }

        // Se adicionar este documento estouraria o batch, criamos um novo
        if (currentSize + rowSize > MAX_BATCH_BYTES || currentBatch.length >= MAX_BATCH_SIZE) {
            batches.push(currentBatch);
            currentBatch = [];
            currentSize = 0;
        }

        currentBatch.push(normalizedRow);
        currentSize += rowSize;
    }

    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }

    return batches;
};

/**
 * Insere registros no Firestore em lote, garantindo eficiência e controle.
 *
 * @param {Array<Object>} rows - Lista de registros a serem inseridos.
 * @returns {Promise<void>} Retorna uma Promise resolvida após a inserção dos dados.
 * @throws {Error} Se houver falha na inserção dos registros.
 */
const batchWrite = async (rows) => {
    const functionName = helper.getStackTraceDetails();
    logger.info(` Preparando batch write para ${rows.length} registros.`, functionName);

    const batches = _splitIntoValidBatches(rows);
    logger.info(`Número de batches gerados: ${batches.length}`, functionName);

    try {
        await Promise.all(
            batches.map(async (batchRows) => {
                const [value, release] = await semaphore.acquire();
                try {
                    const batch = firestore.batch();
                    for (const row of batchRows) {
                        const docRef = firestore.collection(env.firestoreCollection).doc(row.cnpj);
                        batch.set(docRef, row);
                    }
                    await batch.commit();
                    logger.info(`Batch commitado com ${batchRows.length} registros.`, functionName);
                } finally {
                    release();
                }
            })
        );

        logger.info('Todos os registros foram enviados com sucesso!', functionName);
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { batchWrite };

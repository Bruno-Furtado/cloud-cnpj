import { BigQuery } from '@google-cloud/bigquery';
import env from '../config/env.js';
import logger from '../util/logger.js';
import helper from '../util/helper.js';

const bigquery = new BigQuery();

/**
 * Obtém dados do BigQuery dentro de um range de CNPJs, utilizando paginação com cursor.
 *
 * @param {string} startCnpj - CNPJ inicial do intervalo.
 * @param {string} endCnpj - CNPJ final do intervalo.
 * @returns {AsyncGenerator<Array<Object>>} Um gerador assíncrono que retorna lotes de registros.
 * @throws {Error} Se houver falha na consulta ao BigQuery.
 */
async function* fetchDataRange(startCnpj, endCnpj) {
    const functionName = helper.getStackTraceDetails();
    let lastCnpj = null;
    let hasMoreData = true;
    let totalProcessed = 0;

    logger.info(`Iniciando busca no BigQuery para o intervalo: ${startCnpj} - ${endCnpj}.`, functionName);
    const startTime = Date.now();

    while (hasMoreData) {
        const table = `\`${env.project}.${env.dataset}.${env.table}\``;
        let query = `
            SELECT * FROM ${table} 
            WHERE cnpj BETWEEN '${startCnpj}' AND  '${endCnpj}'
        `;

        if (lastCnpj) {
            query += ` AND cnpj >  '${lastCnpj}'`;
        }

        query += ` ORDER BY cnpj LIMIT ${env.queryLimit}`;

        const options = {
            query,
            location: env.location,
        };

        try {
            const [rows] = await bigquery.query(options);

            if (rows.length === 0) {
                hasMoreData = false;
            } else {
                lastCnpj = rows[rows.length - 1].cnpj;
                totalProcessed += rows.length;
                yield rows; // Retorna os dados para o controller sem acumular em memória.

                if (totalProcessed % 50000 === 0) {
                    logger.info(`Processados ${totalProcessed} registros até agora para o intervalo: ${startCnpj} - ${endCnpj}.`, functionName);
                }
            }
        } catch (e) {
            logger.error(e, functionName);
            throw e;
        }
    }

    logger.info(`Finalizado intervalo: ${startCnpj} - ${endCnpj}.`, functionName);
}

export default { fetchDataRange };

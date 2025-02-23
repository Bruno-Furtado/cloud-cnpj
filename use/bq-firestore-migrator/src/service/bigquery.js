import { BigQuery } from "@google-cloud/bigquery";
import env from "../config/env.js";
import helper from "../util/helper.js";
import logger from "../util/logger.js";

/**
 * Serviço responsável por buscar dados do BigQuery.
 * 
 * @module service/bigquery
 */
const bigquery = new BigQuery({ location: env.region });

/**
 * Obtém os estabelecimentos do BigQuery de forma paginada para evitar sobrecarga de memória.
 * 
 * @returns {AsyncGenerator<Object[]>} Gerador assíncrono que retorna lotes de estabelecimentos.
 * @throws {Error} Se houver falha na consulta ao BigQuery.
 */
async function* fetchEstabelecimentos() {
    const functionName = helper.getStackTraceDetails();
    logger.info('Buscando dados do BigQuery...', functionName);

    const query = `SELECT * FROM \`${env.project}.${env.dataset}.${env.table}\` ORDER BY cnpj`;

    try {
        const [job] = await bigquery.createQueryJob({ query, location: env.region });

        logger.info("Job iniciado no BigQuery. Lendo resultados por streaming...", functionName);
        const [rowsIterator] = await job.getQueryResults({ autoPaginate: false });

        let count = 0;
        let batchSize = 500;
        let batch = [];

        for await (const row of rowsIterator) {
            batch.push(row);
            count++;

            if (batch.length >= batchSize) {
                logger.info(`Processando lote de ${batch.length} registros... (Total lido: ${count})`, functionName);
                yield batch;
                batch = []; // Reinicia o batch
            }
        }

        // Se ainda houver registros no último batch, envie-os
        if (batch.length > 0) {
            logger.info(`Processando último lote de ${batch.length} registros... (Total lido: ${count})`, functionName);
            yield batch;
        }

        logger.info(`Consulta concluída. Total de registros processados: ${count}`, functionName);
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
}

export default { fetchEstabelecimentos };

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
    logger.info('Iniciando busca de dados no BigQuery...', functionName);

    const query = `SELECT * FROM \`${env.project}.${env.dataset}.${env.table}\` ORDER BY cnpj`;

    try {
        const [job] = await bigquery.createQueryJob({ query, location: env.region });
        logger.info(`Job iniciado no BigQuery: ${job.id}`, functionName);

        const options = {
            maxResults: 500,
            pageToken: undefined,
            autoPaginate: false
        };

        let totalCount = 0;

        do {
            const [rows, queryInfo] = await job.getQueryResults(options);

            if (rows.length === 0) {
                logger.info('Nenhum registro retornado nesta página.', functionName);
                break;
            }

            totalCount += rows.length;
            logger.info(`Processando lote de ${rows.length} registros... (Total processado: ${totalCount})`, functionName);

            yield rows;

            options.pageToken = queryInfo.pageToken;
        } while (options.pageToken);

        logger.info(`Consulta concluída. Total de registros processados: ${totalCount}`, functionName);
    } catch (error) {
        logger.error(e, functionName);
        throw error;
    }
}

export default { fetchEstabelecimentos };

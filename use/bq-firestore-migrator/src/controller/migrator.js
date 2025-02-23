import bigquery from "../service/bigquery.js";
import firestore from "../service/firestore.js";
import alert from "../util/alert.js";
import logger from "../util/logger.js";
import helper from "../util/helper.js";

/**
 * Controlador responsável por orquestrar a migração de dados do BigQuery para o Firestore.
 * 
 * @module controller/migrator
 */
const run = async () => {
    const functionName = helper.getStackTraceDetails();
    logger.info("Iniciando migração de estabelecimentos...", functionName);
    await alert.send("🏂 Iniciando a migração dos estabelecimentos para Firestore.");

    try {
        let totalProcessed = 0;
        for await (const batch of bigquery.fetchEstabelecimentos()) {
            await firestore.saveEstabelecimentos(batch);
            totalProcessed += batch.length;
            logger.info(`Lote processado com ${batch.length} registros. Total até agora: ${totalProcessed}`, functionName);
            await alert.send(`📦 Lote processado com ${batch.length} registros. Total até agora: ${totalProcessed}`);
        }

        logger.info("Migração concluída com sucesso!", functionName);
        await alert.send(`🫡 Migração finalizada! Total de registros migrados: ${totalProcessed}`);
    } catch (e) {
        logger.error(e, functionName);
        await alert.send(`❌ Falha na migração: ${e.message}`);
        throw e;
    }
};

export default { run };

import { Firestore } from "@google-cloud/firestore";
import env from "../config/env.js";
import helper from "../util/helper.js";
import logger from "../util/logger.js";

/**
 * Serviço responsável por salvar dados no Firestore.
 * 
 * @module service/firestore
 */
const firestore = new Firestore();
const collection = firestore.collection(env.collection);

/**
 * Converte campos de data, NUMERIC e STRUCT do BigQuery para formatos compatíveis com Firestore.
 *
 * @param {Object} row - Objeto contendo os dados da linha do BigQuery.
 * @returns {Object} - Objeto convertido, com formatos adequados para Firestore.
 */
const _normalizeRow = (row) => {
    const normalized = { ...row };

    for (const key in normalized) {
        if (normalized[key] && typeof normalized[key] === 'object') {
            if (normalized[key].value) {
                // Se for um objeto com valor (ex: BigQueryDate), pega o valor real
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
 * Salva estabelecimentos no Firestore em batch.
 * 
 * @param {Object[]} estabelecimentos - Lista de estabelecimentos a serem salvos.
 * @returns {Promise<void>} Promessa resolvida após a inserção.
 * @throws {Error} Se houver falha na gravação.
 */
const saveEstabelecimentos = async (estabelecimentos) => {
    const functionName = helper.getStackTraceDetails();
    logger.info(`Salvando ${estabelecimentos.length} registros no Firestore...`, functionName);

    try {
        const batch = firestore.batch();

        estabelecimentos.forEach((estabelecimento) => {
            const normalizedEstabelecimento = _normalizeRow(estabelecimento);
            const docRef = collection.doc(normalizedEstabelecimento.cnpj.toString());
            batch.set(docRef, normalizedEstabelecimento);
        });

        await batch.commit();
        logger.info(`Inseridos ${estabelecimentos.length} registros no Firestore.`, functionName);
    } catch (e) {
        logger.error(e, functionName);
        throw e;
    }
};

export default { saveEstabelecimentos };

import bigquery from '../service/bigquery.js';
import firestore from '../service/firestore.js';
import alert from '../util/alert.js';

/**
 * Controlador responsável por importar dados do BigQuery para o Firestore.
 */
const run = async () => {
    try {
        await alert.send("🏂 O job foi iniciado.");

        const ranges = [
            ['00000000000000', '19999999999999'],
            ['20000000000000', '39999999999999'],
            ['40000000000000', '59999999999999'],
            ['60000000000000', '79999999999999'],
            ['80000000000000', '99999999999999']
        ];

        // Executamos as queries em paralelo e processamos os resultados sem acumular na memória.
        await Promise.all(ranges.map(async ([start, end]) => {
            for await (const rows of bigquery.fetchDataRange(start, end)) {
                await firestore.batchWrite(rows);
            }
            await alert.send(`✅ Intervalo ${start} - ${end} finalizado.`);
        }));

        await alert.send('🫡 O job foi encerrado com sucesso.');
    } catch (e) {
        await alert.send(`❌ O job foi encerrado com falha: ${e.message}`);
        throw e;
    }
};

export default { run };

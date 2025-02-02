/**
 * Captura detalhes do stack trace, incluindo o nome do arquivo e o nome da função.
 *
 * Utiliza o stack trace gerado pelo JavaScript para extrair informações sobre onde 
 * a função foi chamada. Essas informações são úteis para logging e debug.
 *
 * @returns {string} - Retorna uma string no formato 'file.js:functionName'.
 *                     Caso não seja possível determinar as informações, retorna 'unknown'.
 *
 * @example
 * // Exemplo de retorno:
 * 'file.js:upload'
 * 
 * Caso o stack trace não tenha as informações necessárias, o retorno será:
 * 'unknown'.
 */
const getStackTraceDetails = () => {
    const err = new Error();
    const stack = err.stack.split("\n")[2].trim(); // A linha que contém a função que chamou o erro
    
    // Ajustando regex para pegar função e arquivo
    const functionNameMatch = stack.match(/at (.*?) \((.*?):\d+:\d+\)/); // Captura função e arquivo

    if (functionNameMatch) {
        const functionName = functionNameMatch[1]; // Nome da função
        const fileName = functionNameMatch[2].split('/').pop(); // Nome do arquivo
        const formattedFunctionName = functionName.replace('Object.', ''); // Remove 'Object.' se aparecer
        return `${fileName}:${formattedFunctionName}`; // Ex: 'file.js:upload'
    }

    return "unknown"; // Caso não consiga encontrar as informações
};

export default { getStackTraceDetails };

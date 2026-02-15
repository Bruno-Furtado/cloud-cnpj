import axios from 'axios';
import axiosRetry from 'axios-retry';
import env from '../config/env.js';

const axiosInstance = axios.create({
    baseURL: `${env.receitaFederalUrl}/public.php/webdav`,
    timeout: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Authorization': `Basic ${Buffer.from(`${env.nextcloudShareToken}:`).toString('base64')}`
    }
});

// Configuração de retry para evitar falhas temporárias
axiosRetry(axiosInstance, {
    retries: 5,
    retryDelay: (count) => Math.pow(2, count) * 1000, // Retry exponencial: 1s, 2s, 4s, 8s, 16s
    retryCondition: (e) => axiosRetry.isNetworkOrIdempotentRequestError(e) || e.response?.status >= 500,
});

export default axiosInstance;

/* API boundary: all network traffic passes through one authenticated client. */
import axios from 'axios';
import { env } from '../config/env';

const client = axios.create({ baseURL: env.apiUrl, headers: { Accept: 'application/json' } });
client.interceptors.request.use((request) => { const token = localStorage.getItem('techzone_token'); if (token) request.headers.Authorization = `Bearer ${token}`; return request; });
export const apiError = (error) => { if (error?.code === 'ERR_NETWORK' || !error?.response) return 'Unable to reach the portal service. Check that the server is running and try again.'; return error.response?.data?.error || error.response?.data?.message || 'Something went wrong while completing that request.'; };
export default client;

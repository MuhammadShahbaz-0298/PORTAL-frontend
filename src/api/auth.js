/* Auth service: login, registration, session validation, and password change only. */
import client from './client';
export const login = (payload) => client.post('/auth/login', payload);
export const register = (payload) => client.post('/auth/register', payload);
export const me = () => client.get('/auth/me');
export const changePassword = (payload) => client.patch('/auth/change-password', payload);

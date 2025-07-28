import api from './api';

const API_URL = '/auth';

const register = (data) => {
  return api.post(`${API_URL}/register`, data);
};

const login = (data) => {
  return api.post(`${API_URL}/login`, data);
};

export default { register, login };
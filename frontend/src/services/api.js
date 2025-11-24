import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

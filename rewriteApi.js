const fs = require('fs');
const file = 'C:/Users/patri/OneDrive/Desktop/autorizamed/front/src/services/api.ts';
const content = const BASE_URL = 'http://localhost:8080/api';

export const api = {
  defaults: {
    headers: {}
  },
  
  _getHeaders(isFormData = false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {
      ...this.defaults.headers
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  },

  async post(endpoint, data, config) {
    const isFormData = data instanceof FormData;
    let headers = this._getHeaders(isFormData);
    if (config && config.headers) {
        // do not override if we explicitly want fetch to set boundary
        if (config.headers['Content-Type'] === 'multipart/form-data' && isFormData) {
            delete config.headers['Content-Type'];
        }
        headers = { ...headers, ...config.headers };
    }
    
    const response = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    return response.ok && response.status !== 204 && response.headers.get('content-type')?.includes('application/json') ? response.json() : null;
  },

  async get(endpoint, config) {
    let headers = this._getHeaders(false);
    if (config && config.headers) headers = { ...headers, ...config.headers };

    const response = await fetch(BASE_URL + endpoint, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    return response.json();
  },

  async put(endpoint, data, config) {
    const isFormData = data instanceof FormData;
    let headers = this._getHeaders(isFormData);
    if (config && config.headers) {
        if (config.headers['Content-Type'] === 'multipart/form-data' && isFormData) {
            delete config.headers['Content-Type'];
        }
        headers = { ...headers, ...config.headers };
    }
    const response = await fetch(BASE_URL + endpoint, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    return response.json();
  },

  async patch(endpoint, data, config) {
    const isFormData = data instanceof FormData;
    let headers = this._getHeaders(isFormData);
    if (config && config.headers) {
        if (config.headers['Content-Type'] === 'multipart/form-data' && isFormData) {
            delete config.headers['Content-Type'];
        }
        headers = { ...headers, ...config.headers };
    }
    const response = await fetch(BASE_URL + endpoint, {
      method: 'PATCH',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    return response.json();
  }
};
;
fs.writeFileSync(file, content, 'utf8');

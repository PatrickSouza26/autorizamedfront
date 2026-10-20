const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = {
  defaults: {
    headers: {} as Record<string, string>
  },
  
  _getHeaders(isFormData = false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      ...this.defaults.headers
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async post(endpoint: string, data: any, config?: any) {
    const isFormData = data instanceof FormData;
    
    let finalHeaders = this._getHeaders(isFormData);
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
      // Delete Content-Type if it's multipart/form-data so fetch can set the boundary automatically
      if (finalHeaders['Content-Type'] === 'multipart/form-data' && isFormData) {
        delete finalHeaders['Content-Type'];
      }
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: finalHeaders,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisiÃ§Ã£o');
    }
    
    return response.ok && response.status !== 204 && response.headers.get('content-type')?.includes('application/json') ? response.json() : null;
  },

  async get(endpoint: string, config?: any) {
    let finalHeaders = this._getHeaders();
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: finalHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any = {};
      try { errorJson = JSON.parse(errorText); } catch(e) {}
      throw new Error(errorJson.message || 'Erro na requisiÃ§Ã£o');
    }
    
    if (config?.responseType === 'blob') {
      const blob = await response.blob();
      return { data: blob };
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  async put(endpoint: string, data: any, config?: any) {
    const isFormData = data instanceof FormData;
    let finalHeaders = this._getHeaders(isFormData);
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
      if (finalHeaders['Content-Type'] === 'multipart/form-data' && isFormData) {
        delete finalHeaders['Content-Type'];
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: finalHeaders,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisiÃ§Ã£o');
    }
    
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  async patch(endpoint: string, data: any, config?: any) {
    const isFormData = data instanceof FormData;
    let finalHeaders = this._getHeaders(isFormData);
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
      if (finalHeaders['Content-Type'] === 'multipart/form-data' && isFormData) {
        delete finalHeaders['Content-Type'];
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: finalHeaders,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisiÃ§Ã£o');
    }
    
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
};

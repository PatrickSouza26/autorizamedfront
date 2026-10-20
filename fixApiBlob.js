const fs = require('fs');
const file = 'C:/Users/patri/OneDrive/Desktop/autorizamed/front/src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

const targetGet = \  async get(endpoint: string, config?: any) {
    let finalHeaders = this._getHeaders();
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
    }

    const response = await fetch(\\\\\\\\, {
      method: 'GET',
      headers: finalHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    return response.json();
  },\;

const targetGetFallback = \  async get(endpoint: string, config?: any) {
    let finalHeaders = this._getHeaders();
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
    }

    const response = await fetch(\\\\\\\\, {
      method: 'GET',
      headers: finalHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisi\u00E7\u00E3o');
    }
    
    return response.json();
  },\;

const replacementGet = \  async get(endpoint: string, config?: any) {
    let finalHeaders = this._getHeaders();
    if (config?.headers) {
      finalHeaders = { ...finalHeaders, ...config.headers };
    }

    const response = await fetch(\\\\\\\\, {
      method: 'GET',
      headers: finalHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    if (config?.responseType === 'blob') {
      const blob = await response.blob();
      return { data: blob };
    }
    
    return response.json();
  },\;

// Replace using regex due to mojibake in user's file
content = content.replace(/async get\(endpoint: string, config\?: any\) \{[\s\S]*?return response\.json\(\);\r?\n  \},/, replacementGet);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed api.ts');

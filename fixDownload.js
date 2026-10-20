const fs = require('fs');
const file = 'C:/Users/patri/OneDrive/Desktop/autorizamed/front/src/app/solicitacoes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetA = \<a 
                    href={\\\http://localhost:8080/api/guias/anexos/\\\\\\}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnDownload} 
                    title="Baixar anexo"
                  >
                    <Download size={18} />
                  </a>\;

const targetAAlt = \<a 
                    href={\\\http://localhost:8080/api/guias/anexos/\\\\}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnDownload} 
                    title="Baixar anexo"
                  >
                    <Download size={18} />
                  </a>\;

const replacementBtn = \<button
                    onClick={() => handleDownloadAnexo(anexo)}
                    className={styles.btnDownload} 
                    title="Baixar anexo"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066CC' }}
                  >
                    <Download size={18} />
                  </button>\;

if (content.includes(targetA)) {
    content = content.replace(targetA, replacementBtn);
} else if (content.includes(targetAAlt)) {
    content = content.replace(targetAAlt, replacementBtn);
} else {
    // regex fallback
    content = content.replace(/<a[\s\S]*?href=\{http:\/\/localhost:8080\/api\/guias\/anexos\/\$\{anexo\.idAnexo\}\}[\s\S]*?<\/a>/, replacementBtn);
}

const targetFunction = 'const handleAuditorAction = (acao: \\'AUTORIZADA\\' | \\'NEGADA\\' | \\'PENDENCIA\\') => {';
const replacementFunction = \const handleDownloadAnexo = async (anexo: any) => {
    try {
      const response = await api.get(\\\/guias/anexos/\\\\\\, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', anexo.nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Erro ao baixar anexo", err);
      alert("Não foi possível baixar o anexo. Verifique sua permissão.");
    }
  };

  const handleAuditorAction = (acao: 'AUTORIZADA' | 'NEGADA' | 'PENDENCIA') => {\;

if (content.includes(targetFunction)) {
    content = content.replace(targetFunction, replacementFunction);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed download and function!');

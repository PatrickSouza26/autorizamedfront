const fs = require('fs');
const file = 'C:/Users/patri/OneDrive/Desktop/autorizamed/front/src/app/solicitacoes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /<div className=\{styles\.fileList\}>([\s\S]*?)<\/div>\s*<\/div>\s*<div>\s*<div className=\{styles\.card\}>/;

const replacementBlock = \<div className={styles.fileList}>
            {guia.anexos && guia.anexos.length > 0 ? (
              guia.anexos.map((anexo: any) => (
                <div key={anexo.idAnexo} className={styles.fileItem}>
                  <FileText size={20} className={styles.fileIcon} />
                  <span className={styles.fileName}>{anexo.nomeArquivo}</span>
                  <a 
                    href={\\\http://localhost:8080/api/guias/anexos/\\\\\\}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnDownload} 
                    title="Baixar anexo"
                  >
                    <Download size={18} />
                  </a>
                </div>
              ))
            ) : (
              <span className={styles.detailValue}>Nenhum arquivo anexado.</span>
            )}
          </div>
        </div>

        <div>
          <div className={styles.card}>\;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacementBlock);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Frontend successfully updated to render attachments!');
} else {
  console.log('Regex did not match.');
}

const fs = require('fs');
const file = 'C:/Users/patri/OneDrive/Desktop/autorizamed/front/src/components/solicitacoes/NovaSolicitacao.tsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('router.push(/solicitacoes/);')) {
    content = content.replace('router.push(/solicitacoes/);', 'router.push(/solicitacoes/);');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed router.push to use idGuia!');
} else {
    console.log('Could not find router.push exact line');
}

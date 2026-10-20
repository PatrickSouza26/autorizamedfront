import React from 'react';
import { Plus, Clock, CheckCircle2, XCircle, FileText, AlertCircle, Eye } from 'lucide-react';
import styles from './FuncionarioDashboard.module.css';
import Link from 'next/link';

const solicitacoesData = [
  { numeroGuia: '202404000123', tipo: 'Consulta', dataSolicitacao: '07/05/2024', statusAtual: 'AUTORIZADA' },
  { numeroGuia: '202404000122', tipo: 'Exame', dataSolicitacao: '06/05/2024', statusAtual: 'EM_ANALISE' },
  { numeroGuia: '202404000121', tipo: 'Procedimento', dataSolicitacao: '05/05/2024', statusAtual: 'EM_AUDITORIA' },
  { numeroGuia: '202404000124', tipo: 'Consulta', dataSolicitacao: '04/05/2024', statusAtual: 'PENDENCIA' },
  { numeroGuia: '202404000120', tipo: 'InternaÃ§Ã£o', dataSolicitacao: '03/05/2024', statusAtual: 'NEGADA' },
  { numeroGuia: '202404000119', tipo: 'Exame', dataSolicitacao: '02/05/2024', statusAtual: 'AUTORIZADA' },
];

const avisos = [
  { id: 1, titulo: 'Guia aprovada', descricao: 'Guia 202404000123 autorizada', tipo: 'sucesso' },
  { id: 2, titulo: 'Guia em anÃ¡lise', descricao: 'Guia 202404000122', tipo: 'alerta' },
  { id: 3, titulo: 'Documentos pendentes', descricao: 'Guia 202404000125', tipo: 'erro' },
];

export default function FuncionarioDashboard({ userName }: { userName: string }) {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return styles.badgeAprovada;
      case 'EM_ANALISE': 
      case 'EM_AUDITORIA': return styles.badgeAnalise;
      case 'PENDENCIA': return styles.badgePendencia;
      case 'NEGADA': return styles.badgeNegada;
      default: return '';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return 'Autorizada';
      case 'EM_ANALISE': return 'Em AnÃ¡lise';
      case 'EM_AUDITORIA': return 'Em Auditoria';
      case 'PENDENCIA': return 'PendÃªncia';
      case 'NEGADA': return 'Negada';
      default: return status;
    }
  };

  const getAvisoIcon = (tipo: string) => {
    switch (tipo) {
      case 'sucesso': return <CheckCircle2 size={16} className={styles.avisoSucesso} />;
      case 'alerta': return <AlertCircle size={16} className={styles.avisoAlerta} />;
      case 'erro': return <XCircle size={16} className={styles.avisoErro} />;
      default: return null;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header>
        <h1 className={styles.headerTitle}>Bem-vindo, {userName}! ðŸ‘‹</h1>
        <p className={styles.headerSubtitle}>Aqui estÃ¡ o resumo das suas solicitaÃ§Ãµes de guias.</p>
      </header>

      <div className={styles.cardsGrid}>
        <Link href="/solicitacoes/nova" className={styles.cardAction}>
          <div className={styles.cardActionIcon}>
            <Plus size={24} />
          </div>
          <span className={styles.cardActionTitle}>Nova solicitaÃ§Ã£o</span>
          <span className={styles.cardActionSubtitle}>Criar agora</span>
        </Link>

        <div className={styles.cardStat}>
          <div className={styles.cardStatHeader}>
            <div className={`${styles.cardStatIcon} ${styles.iconAndamento}`}>
              <Clock size={24} />
            </div>
          </div>
          <div className={styles.cardStatBody}>
            <h3 className={styles.cardStatValue}>8</h3>
            <p className={styles.cardStatLabel}>Em andamento</p>
          </div>
          <Link href="/solicitacoes?status=EM_ANALISE" className={styles.cardStatLink}>Ver todas</Link>
        </div>

        <div className={styles.cardStat}>
          <div className={styles.cardStatHeader}>
            <div className={`${styles.cardStatIcon} ${styles.iconPendencia}`}>
              <AlertCircle size={24} />
            </div>
          </div>
          <div className={styles.cardStatBody}>
            <h3 className={styles.cardStatValue}>5</h3>
            <p className={styles.cardStatLabel}>PendÃªncias</p>
          </div>
          <Link href="/solicitacoes?status=PENDENCIA" className={styles.cardStatLink}>Ver todas</Link>
        </div>

        <div className={styles.cardStat}>
          <div className={styles.cardStatHeader}>
            <div className={`${styles.cardStatIcon} ${styles.iconAprovadas}`}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className={styles.cardStatBody}>
            <h3 className={styles.cardStatValue}>24</h3>
            <p className={styles.cardStatLabel}>Autorizadas</p>
          </div>
          <Link href="/solicitacoes?status=AUTORIZADA" className={styles.cardStatLink}>Ver todas</Link>
        </div>

        <div className={styles.cardStat}>
          <div className={styles.cardStatHeader}>
            <div className={`${styles.cardStatIcon} ${styles.iconNegadas}`}>
              <XCircle size={24} />
            </div>
          </div>
          <div className={styles.cardStatBody}>
            <h3 className={styles.cardStatValue}>3</h3>
            <p className={styles.cardStatLabel}>Negadas</p>
          </div>
          <Link href="/solicitacoes?status=NEGADA" className={styles.cardStatLink}>Ver todas</Link>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={`${styles.sectionCard} ${styles.tableSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ãšltimas solicitaÃ§Ãµes</h2>
            <Link href="/solicitacoes" className={styles.sectionLink}>Ver todas</Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>NÂº Guia</th>
                  <th>Tipo de solicitaÃ§Ã£o</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {solicitacoesData.map((item, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td className={styles.tableCell}>{item.numeroGuia}</td>
                    <td className={styles.tableCell}>{item.tipo}</td>
                    <td className={styles.tableCell}>{item.dataSolicitacao}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getBadgeStyle(item.statusAtual)}`}>
                        {formatStatus(item.statusAtual)}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                      <Link href={`/solicitacoes/${item.numeroGuia}`} className={styles.btnAction} title="Ver detalhes da guia">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>Avisos</h2>
          <div className={styles.avisosList}>
            {avisos.map((aviso) => (
              <div key={aviso.id} className={styles.avisoItem}>
                <div className={styles.avisoIconContainer}>
                  {getAvisoIcon(aviso.tipo)}
                </div>
                <div>
                  <h4 className={styles.avisoTitle}>{aviso.titulo}</h4>
                  <p className={styles.avisoDesc}>{aviso.descricao}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className={styles.avisosLink}>Ver todos avisos</a>
        </div>
      </div>
    </div>
  );
}

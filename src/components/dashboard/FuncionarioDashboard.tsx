import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle2, AlertCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import styles from './FuncionarioDashboard.module.css';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

export default function FuncionarioDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        let endpoint = '';
        if (user.role === 'PRESTADOR' || user.role === 'FUNCIONARIO_PRESTADOR') {
          const prestadorId = user.prestadorId || user.id;
          endpoint = `/relatorios/prestador/${prestadorId}/dashboard`;
        }

        if (endpoint) {
          const res = await api.get(endpoint);
          setDashboardData(res);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const userName = user?.nome || 'Usuário';

  const getAvisoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'sucesso': return <CheckCircle2 size={16} className={styles.avisoSucesso} />;
      case 'alerta': return <AlertCircle size={16} className={styles.avisoAlerta} />;
      case 'erro': return <XCircle size={16} className={styles.avisoErro} />;
      default: return <AlertCircle size={16} className={styles.avisoAlerta} />;
    }
  };

  const inferirTipoAviso = (aviso: any) => {
    if (aviso.tipoAviso) return aviso.tipoAviso;
    const texto = ((aviso.titulo || '') + ' ' + (aviso.mensagem || '')).toLowerCase();
    if (texto.includes('aprovad') || texto.includes('autorizad') || texto.includes('sucesso')) return 'SUCESSO';
    if (texto.includes('negad') || texto.includes('erro') || texto.includes('falha')) return 'ERRO';
    return 'ALERTA';
  };

  const handleAvisoClick = async (aviso: any) => {
    try {
      if (!aviso.lido) {
        await api.patch(`/avisos/${aviso.id}/lido`, {});
        
        setDashboardData((prev: any) => ({
          ...prev,
          avisosRecentes: {
            ...prev.avisosRecentes,
            content: prev.avisosRecentes.content.map((a: any) => a.id === aviso.id ? { ...a, lido: true } : a)
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao marcar aviso como lido', error);
    }

    if (aviso.guiaId) {
      router.push(`/solicitacoes/${aviso.guiaId}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados do painel...</div>;
  }

  const solicitacoesData = dashboardData?.ultimasSolicitacoes?.content || [];
  const avisos = dashboardData?.avisosRecentes?.content || [];

  return (
    <div className={styles.dashboardContainer}>
      <header>
        <h1 className={styles.headerTitle}>Bem-vindo, {userName}! 👋</h1>
        <p className={styles.headerSubtitle}>Aqui está o resumo das suas solicitações de guias.</p>
      </header>

      <div className={styles.cardsGrid}>
        <Link href="/solicitacoes/nova" className={styles.cardAction}>
          <div className={styles.cardActionIcon}>
            <Plus size={24} />
          </div>
          <span className={styles.cardActionTitle}>Nova solicitação</span>
          <span className={styles.cardActionSubtitle}>Criar agora</span>
        </Link>

        <div className={styles.cardStat}>
          <div className={styles.cardStatHeader}>
            <div className={`${styles.cardStatIcon} ${styles.iconAndamento}`}>
              <Clock size={24} />
            </div>
          </div>
          <div className={styles.cardStatBody}>
            <h3 className={styles.cardStatValue}>{dashboardData?.totalEmAndamento || 0}</h3>
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
            <h3 className={styles.cardStatValue}>{dashboardData?.totalPendencias || 0}</h3>
            <p className={styles.cardStatLabel}>Pendências</p>
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
            <h3 className={styles.cardStatValue}>{dashboardData?.totalAutorizadas || 0}</h3>
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
            <h3 className={styles.cardStatValue}>{dashboardData?.totalNegadas || 0}</h3>
            <p className={styles.cardStatLabel}>Negadas</p>
          </div>
          <Link href="/solicitacoes?status=NEGADA" className={styles.cardStatLink}>Ver todas</Link>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={`${styles.sectionCard} ${styles.tableSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Últimas solicitações</h2>
            <Link href="/solicitacoes" className={styles.sectionLink}>Ver todas</Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>Nº Guia</th>
                  <th>Tipo de solicitação</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {solicitacoesData.length > 0 ? (
                  solicitacoesData.map((item: any, idx: number) => (
                    <tr key={idx} className={styles.tableRow}>
                      <td className={styles.tableCell}>{item.numeroGuia}</td>
                      <td className={styles.tableCell}>{item.tipoGuia || 'Guia SP/SADT'}</td>
                      <td className={styles.tableCell}>{new Date(item.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                      <td className={styles.tableCell}>
                        <StatusBadge status={item.statusAtual || item.status} />
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                        <Link href={`/solicitacoes/${item.id}`} className={styles.btnAction} title="Ver detalhes da guia">
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>Avisos</h2>
          <div className={styles.avisosList}>
            {avisos.length > 0 ? (
              avisos.map((aviso: any, idx: number) => {
                const tipoInferido = inferirTipoAviso(aviso);
                return (
                  <div 
                    key={aviso.id || idx} 
                    className={styles.avisoItem} 
                    onClick={() => handleAvisoClick(aviso)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: aviso.lido ? '#FFFFFF' : '#F0F9FF',
                      borderLeft: aviso.lido ? 'none' : '3px solid #3B82F6',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = aviso.lido ? '#F9FAFB' : '#E0F2FE'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = aviso.lido ? '#FFFFFF' : '#F0F9FF'}
                  >
                    <div className={styles.avisoIconContainer}>
                      {getAvisoIcon(tipoInferido)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 className={styles.avisoTitle} style={{ fontWeight: aviso.lido ? 500 : 600 }}>{aviso.titulo}</h4>
                      <p className={styles.avisoDesc}>{aviso.mensagem}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1rem', color: '#6B7280' }}>
                Sem avisos no momento.
              </div>
            )}
          </div>
          {avisos.length > 0 && (
            <Link href="/avisos" className={styles.avisosLink}>Ver todos avisos</Link>
          )}
        </div>
      </div>
    </div>
  );
}

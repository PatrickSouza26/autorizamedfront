"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search,
  Clock, 
  AlertCircle, 
  Calendar, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import styles from '@/app/auditoria/Auditoria.module.css';

interface GuiaFila {
  idGuia: string;
  numeroGuia: string;
  nomePaciente: string;
  examesSolicitados: string[];
  nomeProfissionalSolicitante: string;
  caraterSolicitacao: string;
  dataSolicitacao: string;
  statusAtual?: string;
  alertaSistema?: string;
}

export default function AuditorFila() {
  const router = useRouter();
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [guias, setGuias] = useState<GuiaFila[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'GERAL' | 'MINHAS'>('GERAL');
  
  // KPIs locais (em uma implementação real, poderiam vir de um endpoint específico)
  const [kpis, setKpis] = useState({
    pendentes: 0,
    urgentes: 0,
    hoje: 0
  });

  const carregarFila = async () => {
    try {
      setLoading(true);
      
      // Carregar a fila principal e os KPIs em paralelo
      const urlFila = subTab === 'GERAL' 
        ? `/auditoria-medica/guias/fila?size=50${filtroPrioridade ? '&filtro=' + filtroPrioridade : ''}${searchTerm ? '&busca=' + encodeURIComponent(searchTerm) : ''}`
        : `/auditoria-medica/guias/minhas-analises?size=50${searchTerm ? '&busca=' + encodeURIComponent(searchTerm) : ''}`;
        
      const [resFila, resKpi] = await Promise.all([
        api.get(urlFila),
        api.get('/auditoria-medica/guias/fila/kpis')
      ]);
      
      if (resFila && resFila.content) {
        setGuias(resFila.content);
      }
      
      if (resKpi) {
        setKpis({
          pendentes: resKpi.totalPendentes || 0,
          urgentes: resKpi.totalUrgentes || 0,
          hoje: resKpi.totalHoje || 0
        });
      }
    } catch (error) {
      console.error("Erro ao carregar fila:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarAuditoria = async (idGuia: string, statusAtual?: string) => {
    try {
      if (statusAtual === 'EM_ANALISE' || statusAtual === 'PENDENCIA_RESPONDIDA') {
        await api.patch(`/auditoria-medica/guias/${idGuia}/iniciar-analise`, {});
      }
      router.push(`/solicitacoes/${idGuia}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar auditoria. A guia já pode estar em análise por outro auditor.');
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarFila();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filtroPrioridade, searchTerm, subTab]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENCIA': return styles.badgeAlta;
      case 'ALTA': return styles.badgeAlta;
      case 'MEDIA': return styles.badgeMedia;
      case 'BAIXA': return styles.badgeBaixa;
      case 'ELETIVA': return styles.badgeMedia;
      default: return styles.badgeMedia;
    }
  };
  
  // Função auxiliar para tempo aguardando
  const calcularTempoAguardando = (dataStr: string) => {
    if (!dataStr) return "-";
    const inicio = new Date(dataStr).getTime();
    const agora = new Date().getTime();
    const diffMs = agora - inicio;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHoras > 24) {
      const dias = Math.floor(diffHoras / 24);
      return `${dias}d ${diffHoras % 24}h`;
    }
    return `${diffHoras}h ${diffMinutos}m`;
  };

  return (
    <div>
      <div className={styles.tabsContainer} style={{ padding: '0', marginBottom: '1.5rem', marginTop: '-1rem' }}>
        <button 
          className={`${styles.tab} ${subTab === 'GERAL' ? styles.tabActive : ''}`} 
          onClick={() => setSubTab('GERAL')}
        >
          Fila Geral
        </button>
        <button 
          className={`${styles.tab} ${subTab === 'MINHAS' ? styles.tabActive : ''}`} 
          onClick={() => setSubTab('MINHAS')}
        >
          Minhas Análises
        </button>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Prioridade</label>
          <select 
            className={styles.filterSelect}
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="URGENCIA">Urgência</option>
            <option value="ELETIVA">Eletiva</option>
          </select>
        </div>
        <div className={styles.searchGroup}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar guia ou paciente..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconYellow}`}>
            <Clock size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pendentes</span>
            <span className={styles.kpiValue}>{kpis.pendentes}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconRed}`}>
            <AlertCircle size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Urgentes</span>
            <span className={styles.kpiValue}>{kpis.urgentes}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconBlue}`}>
            <Calendar size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Hoje</span>
            <span className={styles.kpiValue}>{kpis.hoje}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Protocolo</th>
              <th>Paciente</th>
              <th>Procedimentos</th>
              <th>Solicitante</th>
              <th>Caráter</th>
              <th>Status</th>
              <th>Tempo aguardando</th>
              <th></th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>Carregando fila...</td></tr>
            ) : guias.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>Nenhuma guia pendente na fila!</td></tr>
            ) : (
              guias.map((row) => (
                <tr key={row.idGuia} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.protocolText}`}>
                    <Link href={`/solicitacoes/${row.idGuia}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {row.numeroGuia}
                    </Link>
                  </td>
                  <td className={styles.tableCell}>{row.nomePaciente}</td>
                  <td className={styles.tableCell} style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.examesSolicitados?.join(', ') || '-'}
                  </td>
                  <td className={styles.tableCell}>{row.nomeProfissionalSolicitante}</td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${getPriorityBadge(row.caraterSolicitacao)}`}>
                      {row.caraterSolicitacao}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      {row.statusAtual === 'PENDENCIA_RESPONDIDA' ? (
                        <span className={styles.badge} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>Retorno Pendência</span>
                      ) : row.statusAtual === 'EM_AUDITORIA' ? (
                        <span className={styles.badge} style={{ backgroundColor: '#cce5ff', color: '#004085', border: '1px solid #b8daff' }}>Em Análise (Sua)</span>
                      ) : (
                        <span className={styles.badge} style={{ backgroundColor: '#e2e3e5', color: '#383d41' }}>Nova</span>
                      )}
                      {row.alertaSistema && (
                        <span 
                          className={styles.badge} 
                          style={{ 
                            backgroundColor: '#F5F3FF', 
                            color: '#6D28D9', 
                            border: '1px solid #DDD6FE', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '3px',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            fontWeight: 600
                          }}
                          title={row.alertaSistema}
                        >
                          <Sparkles size={11} /> Triada por IA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.tableCell} style={{ fontWeight: 500 }}>
                    {calcularTempoAguardando(row.dataSolicitacao)}
                  </td>
                  <td className={styles.tableCell}>
                    <button 
                      onClick={() => handleIniciarAuditoria(row.idGuia, row.statusAtual)} 
                      className={styles.actionBtn}
                      style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                      title="Iniciar Análise"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
{styles.tab} 

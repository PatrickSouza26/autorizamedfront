"use client";

import React, { useState, Suspense } from 'react';
import { Search, Plus, Eye, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { api } from '@/services/api';
import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Solicitacoes.module.css';

// Mock mais completo


function SolicitacoesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'TODOS';

  const [allSolicitacoes, setAllSolicitacoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadGuias() {
      try {
        const response = await api.get('/guias');
        const formatted = response.map((g: any) => ({
          id: g.idGuia,
          numeroGuia: g.numeroGuia,
          paciente: g.nomePaciente,
          tipo: g.tipoSolicitacao,
          data: new Date(g.dataSolicitacao).toLocaleDateString('pt-BR'),
          status: g.statusAtual,
          rawData: g.dataSolicitacao,
          isAiFastTrack: g.statusAtual === 'AUTORIZADA' && g.historico?.some((h: any) => 
            h.parecer?.includes('IA médica') || 
            h.parecer?.includes('automaticamente por IA') ||
            h.parecer?.includes('inteligência artificial')
          )
        }));
        setAllSolicitacoes(formatted);
      } catch (err) {
        console.error('Erro ao carregar guias:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGuias();
  }, []);


  // Filtros aplicados
  const filteredData = allSolicitacoes.filter(item => {
    const matchSearch = item.numeroGuia.includes(searchTerm) || item.paciente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'TODOS' || item.status === statusFilter;
    
    // Filtro de data (lógica simples no front-end para demonstração)
    let matchData = true;
    if (dataInicio && dataFim && item.rawData) {
      const dateItem = new Date(item.rawData);
      const dateStart = new Date(dataInicio);
      const dateEnd = new Date(dataFim);
      dateEnd.setHours(23, 59, 59);
      matchData = dateItem >= dateStart && dateItem <= dateEnd;
    }

    return matchSearch && matchStatus && matchData;
  });

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return styles.badgeAprovada;
      case 'EM_ANALISE': 
      case 'EM_AUDITORIA': return styles.badgeAnalise;
      case 'PENDENCIA': return styles.badgePendencia;
      case 'PENDENCIA_RESPONDIDA': return styles.badgePendenciaRespondida;
      case 'NEGADA': return styles.badgeNegada;
      case 'CANCELADA': return styles.badgeCancelada;
      default: return '';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return 'Autorizada';
      case 'EM_ANALISE': return 'Em Análise';
      case 'EM_AUDITORIA': return 'Em Auditoria';
      case 'PENDENCIA': return 'Pendência';
      case 'PENDENCIA_RESPONDIDA': return 'Pendência Respondida';
      case 'NEGADA': return 'Negada';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Solicitações</h1>
          <p className={styles.breadcrumb}>Dashboard &gt; Solicitações</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.filtersLeft}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Buscar por Nº da Guia ou Paciente..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <select 
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="TODOS">Todos os Status</option>
            <option value="AUTORIZADA">Autorizada</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="EM_AUDITORIA">Em Auditoria</option>
            <option value="PENDENCIA">Pendência</option>
            <option value="NEGADA">Negada</option>
          </select>

          <div className={styles.dateFilterWrapper}>
            <input 
              type="date" 
              className={styles.dateInput}
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setCurrentPage(1); }}
            />
            <span className={styles.dateSeparator}>até</span>
            <input 
              type="date" 
              className={styles.dateInput}
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <Link href="/solicitacoes/nova" className={styles.btnPrimary}>
          <Plus size={18} />
          Nova Solicitação
        </Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Nº Guia</th>
                <th>Beneficiário</th>
                <th>Tipo de solicitação</th>
                <th>Data</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {currentData.length > 0 ? (
                currentData.map((item, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td className={styles.tableCell}>{item.numeroGuia}</td>
                    <td className={`${styles.tableCell} ${styles.patientName}`}>{item.paciente}</td>
                    <td className={styles.tableCell}>{item.tipo}</td>
                    <td className={styles.tableCell}>{item.data}</td>
                    <td className={styles.tableCell}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                        <span className={`${styles.badge} ${getBadgeStyle(item.status)}`}>
                          {formatStatus(item.status)}
                        </span>
                        {item.isAiFastTrack && (
                          <span 
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              backgroundColor: '#ECFDF5',
                              color: '#047857',
                              border: '1px solid #A7F3D0',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Zap size={10} fill="#047857" /> Fast-Track IA
                          </span>
                        )}
                      </div>
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                    Nenhuma solicitação encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>
            Mostrando {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} resultados
          </span>
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolicitacoesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Carregando solicitações...</div>}>
      <SolicitacoesContent />
    </Suspense>
  );
}

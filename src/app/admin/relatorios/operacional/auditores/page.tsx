"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import styles from '../../Relatorios.module.css';
import { api } from '@/services/api';

export default function RankingAuditoresPage() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Considerando que a API usa paginação 0-indexed
        const res = await api.get(`/relatorios/operacional/auditores?pagina=${currentPage - 1}&tamanho=${itemsPerPage}`);
        setData(res.content || res.data?.content || []);
        setTotalPages(res.page?.totalPages ?? res.totalPages ?? 1);
        setTotalElements(res.page?.totalElements ?? res.totalElements ?? 0);
      } catch (error) {
        console.error('Erro ao buscar ranking de auditores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  // Se a API não tiver busca nativa no backend, filtramos localmente (limitado à página atual)
  // O ideal seria passar o searchTerm para a API, mas para seguir rápido faremos local no array
  const filteredData = data.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.registro && item.registro.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/admin/relatorios/operacional" style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className={styles.tableTitle} style={{ fontSize: '1.5rem' }}>Ranking Completo: Auditores</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-inter)' }}>
            Listagem detalhada de produtividade por médico auditor
          </p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Buscar por Nome ou Registro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontFamily: 'var(--font-inter)' }}
            />
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Carregando ranking...</div>
          ) : (
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>Posição</th>
                  <th>Nome do Auditor</th>
                  <th>Registro</th>
                  <th>Guias Analisadas</th>
                  <th>Tempo Médio</th>
                  <th>% Aprovação</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={row.idAuditor} className={styles.tableRow}>
                        <td className={styles.tableCell} style={{ color: '#6B7280', fontWeight: 600 }}>#{globalIndex}</td>
                        <td className={styles.tableCell} style={{ fontWeight: 500 }}>{row.nome}</td>
                        <td className={styles.tableCell}>{row.registro || '-'}</td>
                        <td className={styles.tableCell} style={{ fontWeight: 600 }}>{row.guiasAnalisadas}</td>
                        <td className={styles.tableCell}>{row.tempoMedioResposta}</td>
                        <td className={styles.tableCell}>
                          <span style={{ color: row.taxaAprovacao > 70 ? '#2ECC71' : '#E74C3C', fontWeight: 500 }}>
                            {row.taxaAprovacao.toFixed(1)}%
                          </span>
                        </td>
                        <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                          <a href={`/admin/relatorios/dossie/auditor/${row.idAuditor}`} style={{ textDecoration: 'none', color: '#0066CC', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            Detalhes
                            <ChevronRight size={16} />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Nenhum auditor encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-inter)' }}>
            Mostrando página {currentPage} de {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: '#FFF', cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer', opacity: (currentPage === 1 || loading) ? 0.5 : 1 }}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: '#FFF', cursor: (currentPage === totalPages || totalPages === 0 || loading) ? 'not-allowed' : 'pointer', opacity: (currentPage === totalPages || totalPages === 0 || loading) ? 0.5 : 1 }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

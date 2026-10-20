"use client";

import React, { useState } from 'react';
import { Search, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import styles from '../../Relatorios.module.css';

// Mock data to simulate a larger dataset
const fullBeneficiariosData = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  paciente: `Beneficiário ${i + 1} da Silva`,
  carteirinha: `12345678901234${i.toString().padStart(2, '0')}`,
  qtd: Math.floor(Math.random() * 20) + 1,
  principal: ['Fisioterapia', 'Ressonância', 'Consulta', 'Exames Laboratoriais'][Math.floor(Math.random() * 4)],
  tendencia: Math.random() > 0.5 ? 'Em Alta' : 'Estável'
})).sort((a, b) => b.qtd - a.qtd); // sort by highest utilization

export default function RankingBeneficiariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = fullBeneficiariosData.filter(item => 
    item.paciente.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.carteirinha.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTrendBadge = (trend: string) => {
    return trend === 'Em Alta' ? styles.badgeWarning : styles.badgeSuccess; 
  };

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/admin/relatorios/frequencia" style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className={styles.tableTitle} style={{ fontSize: '1.5rem' }}>Ranking Completo: Beneficiários</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-inter)' }}>
            Listagem detalhada de beneficiários por volume de utilização
          </p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou carteirinha..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontFamily: 'var(--font-inter)' }}
            />
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Posição</th>
                <th>Paciente</th>
                <th>Carteirinha</th>
                <th>Qtde Guias (Mês)</th>
                <th>Principal Procedimento</th>
                <th>Tendência</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {paginatedData.map((row, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={row.id} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ color: '#6B7280', fontWeight: 600 }}>#{globalIndex}</td>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>{row.paciente}</td>
                    <td className={styles.tableCell}>{row.carteirinha}</td>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{row.qtd}</td>
                    <td className={styles.tableCell}>{row.principal}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getTrendBadge(row.tendencia)}`}>
                        {row.tendencia}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                      <a href={`/admin/relatorios/dossie/beneficiario/${row.id}`} style={{ textDecoration: 'none', color: '#0066CC', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        Detalhes
                        <ChevronRight size={16} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-inter)' }}>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} resultados
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: '#FFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: '#FFF', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1 }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

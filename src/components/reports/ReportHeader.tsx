import React from 'react';
import styles from './ReportComponents.module.css';

interface ReportHeaderProps {
  title: string;
  breadcrumb: string;
  filtroTempo?: string;
  setFiltroTempo?: (val: string) => void;
}

export default function ReportHeader({ title, breadcrumb, filtroTempo, setFiltroTempo }: ReportHeaderProps) {
  return (
    <div className={styles.headerContainer} style={{ alignItems: 'flex-start' }}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.breadcrumb}>{breadcrumb}</p>
      </div>

      {setFiltroTempo && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <select 
            value={filtroTempo}
            onChange={(e) => setFiltroTempo(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.5rem', 
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
              color: '#4B5563',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="estemes">Este Mês</option>
            <option value="mespassado">Mês Passado</option>
            <option value="ultimos3meses">Últimos 3 Meses</option>
            <option value="esteano">Este Ano</option>
          </select>
          
          <div className={styles.filterGroup}>
            <button 
              className={`${styles.filterBtn} ${filtroTempo === 'ultimos7dias' ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltroTempo('ultimos7dias')}
            >
              Últimos 7 dias
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroTempo === 'ultimos30dias' ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltroTempo('ultimos30dias')}
            >
              Últimos 30 dias
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroTempo === 'estemes' ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltroTempo('estemes')}
            >
              Este Mês
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

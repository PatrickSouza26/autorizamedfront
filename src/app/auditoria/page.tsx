"use client";

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import styles from './Auditoria.module.css';

// Componentes da visão do Auditor
import AuditorFila from '@/components/auditoria/AuditorFila';
import AuditorDashboard from '@/components/auditoria/AuditorDashboard';

export default function AuditoriaPage() {
  const [activeTab, setActiveTab] = useState<'FILA' | 'DASHBOARD'>('FILA');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Auditoria Médica</h1>
          <div className={styles.breadcrumb}>
            Dashboard &gt; Auditoria Médica &gt; {activeTab === 'FILA' ? 'Fila de Autorizações' : 'Meu Desempenho'}
          </div>
        </div>
        <button className={styles.bellButton}>
          <Bell size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'FILA' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('FILA')}
        >
          Fila de Autorizações
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'DASHBOARD' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('DASHBOARD')}
        >
          Meu Desempenho
        </button>
      </div>

      {/* Conteúdo Renderizado Condicionalmente */}
      {activeTab === 'FILA' ? <AuditorFila /> : <AuditorDashboard />}
      
    </div>
  );
}

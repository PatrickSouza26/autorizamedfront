"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/app/auditoria/Auditoria.module.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DecisaoAuditorDTO {
  ano: number;
  mes: number;
  status: string;
  total: number;
}

interface AvaliacaoRecenteDTO {
  numeroGuia: string;
  dataAuditoria: string;
  nomePaciente: string;
  procedimentoFormatado: string;
  tempoAnalise: string;
  veredito: string;
}

interface AuditorDetalhesResponse {
  graficoDecisoes: DecisaoAuditorDTO[];
  ultimasAvaliacoes: {
    content: AvaliacaoRecenteDTO[];
    page?: {
      totalElements: number;
      totalPages: number;
    },
    totalPages?: number;
  } | AvaliacaoRecenteDTO[];
}

export default function AuditorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [detalhes, setDetalhes] = useState<AuditorDetalhesResponse | null>(null);

  useEffect(() => {
    const carregarDashboard = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // O endpoint requer o ID do auditor logado.
        const res = await api.get(`/relatorios/auditor/${user.id}`);
        if (res) {
          setDetalhes(res);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do auditor:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDashboard();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando estatísticas...</div>;
  }

  if (!detalhes) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Não foi possível carregar os dados do painel.</div>;
  }

  // Preparar os dados para o Recharts
  // Agrupar por Mês/Ano e dividir os totais em APROVADA e NEGADA
  const chartDataMap = new Map<string, any>();
  
  detalhes.graficoDecisoes?.forEach(d => {
    const label = `${d.mes.toString().padStart(2, '0')}/${d.ano}`;
    if (!chartDataMap.has(label)) {
      chartDataMap.set(label, { name: label, AUTORIZADA: 0, NEGADA: 0 });
    }
    const entry = chartDataMap.get(label);
    
    // Normalizar status para garantir mapeamento correto
    if (d.status.includes('AUTORIZADA')) {
      entry.AUTORIZADA += d.total;
    } else if (d.status.includes('NEGADA')) {
      entry.NEGADA += d.total;
    }
  });

  const chartData = Array.from(chartDataMap.values());
  
  // Extrair array de avaliações (tratando o formato de página do Spring Boot 3)
  const avaliacoes = Array.isArray(detalhes.ultimasAvaliacoes) 
    ? detalhes.ultimasAvaliacoes 
    : (detalhes.ultimasAvaliacoes?.content || []);

  const getVereditoColor = (veredito: string) => {
    if (veredito.includes('AUTORIZADA')) return '#10B981'; // Green
    if (veredito.includes('NEGADA')) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  return (
    <div>
      <div className={styles.dashboardGrid}>
        
        {/* Gráfico */}
        <div className={styles.dashboardCard}>
          <h3 className={styles.cardTitle}>Decisões - Últimos 6 Meses</h3>
          {chartData.length > 0 ? (
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="AUTORIZADA" name="Autorizadas" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="NEGADA" name="Negadas" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
              Sem dados suficientes de decisões.
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Últimas Avaliações */}
      <div className={styles.tableContainer} style={{ marginTop: 0 }}>
        <h3 className={styles.cardTitle} style={{ padding: '1.5rem 1.5rem 0' }}>Últimas Avaliações Realizadas</h3>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Data/Hora</th>
              <th>Guia</th>
              <th>Paciente</th>
              <th>Procedimento</th>
              <th>Tempo de Análise</th>
              <th>Veredito</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {avaliacoes.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Nenhuma avaliação recente encontrada.</td></tr>
            ) : (
              avaliacoes.map((av, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {av.dataAuditoria 
                      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(av.dataAuditoria)) 
                      : '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.protocolText}`}>{av.numeroGuia}</td>
                  <td className={styles.tableCell}>{av.nomePaciente}</td>
                  <td className={styles.tableCell} style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {av.procedimentoFormatado}
                  </td>
                  <td className={styles.tableCell}>{av.tempoAnalise || '-'}</td>
                  <td className={styles.tableCell} style={{ fontWeight: 600, color: getVereditoColor(av.veredito) }}>
                    {av.veredito}
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

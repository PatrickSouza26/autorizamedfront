"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Activity, Users, ChevronRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from '../Relatorios.module.css';
import ReportHeader from '@/components/reports/ReportHeader';
import KPICard from '@/components/reports/KPICard';
import reportStyles from '@/components/reports/ReportComponents.module.css';
import { api } from '@/services/api';

export default function FrequenciaReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroTempo, setFiltroTempo] = useState('estemes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/relatorios/frequencia-utilizacao?filtroTempo=${filtroTempo}`);
        setData(res);
      } catch (error) {
        console.error('Erro ao buscar dados de frequência e utilização', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filtroTempo]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando relatório...</div>;
  }

  if (!data) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Não foi possível carregar os dados.</div>;
  }

  const topProcedimentos = data.topProcedimentos || [];
  const topPrestadores = data.topPrestadores || [];
  const topBeneficiarios = data.topBeneficiarios || [];

  // Mapear para o BarChart
  const barChartData = topProcedimentos.map((p: any) => ({
    name: p.descricao,
    quantidade: p.totalSolicitado
  }));

  const getTrendBadge = (trend: string) => {
    if (!trend) return styles.badgeSuccess;
    if (trend.toLowerCase().includes('alta') || trend.toLowerCase().includes('crescimento')) return styles.badgeWarning;
    if (trend.toLowerCase().includes('baixa')) return styles.badgeSuccess; // Pode ajustar conforme a lógica visual
    return styles.badgeSuccess; 
  };

  return (
    <div className={styles.pageContainer}>
      <ReportHeader 
        title="Relatório de Frequência e Utilização" 
        breadcrumb="Relatórios > Frequência" 
        filtroTempo={filtroTempo}
        setFiltroTempo={setFiltroTempo}
      />

      <div className={styles.chartsGrid} style={{ marginTop: '1.5rem', gridTemplateColumns: '1fr' }}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top Procedimentos (TUSS) Mais Autorizados</h3>
          <div style={{ width: '100%', height: 350 }}>
            {barChartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} width={150} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 102, 204, 0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => [`${value} solicitações`, 'Quantidade']}
                  />
                  <Bar dataKey="quantidade" fill="#3FA9F5" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                Sem dados de procedimentos no período.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableCard} style={{ marginTop: '1.5rem' }}>
        <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.tableTitle}>Top Prestadores (Maior Volume)</h3>
          <span style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="#6B7280" />
            Ranking
          </span>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Clínica / Hospital</th>
                <th>CNPJ</th>
                <th>Guias (Período)</th>
                <th>Crescimento</th>
                <th>Tendência</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {topPrestadores.length > 0 ? (
                topPrestadores.map((row: any) => (
                  <tr key={row.idPrestador} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>{row.nome}</td>
                    <td className={styles.tableCell}>{row.cnpj}</td>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{row.guiasMes}</td>
                    <td className={styles.tableCell}>{row.crescimentoPercentual.toFixed(1)}%</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getTrendBadge(row.tendencia)}`}>
                        {row.tendencia || 'Estável'}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                      <a href={`/admin/relatorios/dossie/prestador/${row.idPrestador}`} style={{ textDecoration: 'none', color: '#0066CC', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        Detalhes
                        <ChevronRight size={16} />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Sem dados de prestadores no período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.tableCard} style={{ marginTop: '1.5rem' }}>
        <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.tableTitle}>Top Beneficiários (Maior Utilização)</h3>
          <span style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="#6B7280" />
            Ranking
          </span>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Paciente</th>
                <th>Carteirinha</th>
                <th>Qtde Guias</th>
                <th>Principal Procedimento</th>
                <th>Tendência</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {topBeneficiarios.length > 0 ? (
                topBeneficiarios.map((row: any) => (
                  <tr key={row.idBeneficiario} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>{row.nome}</td>
                    <td className={styles.tableCell}>{row.carteirinha}</td>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{row.quantidadeGuias}</td>
                    <td className={styles.tableCell}>{row.principalProcedimento || '-'}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getTrendBadge(row.tendencia)}`}>
                        {row.tendencia || 'Estável'}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                      <a href={`/admin/relatorios/dossie/beneficiario/${row.idBeneficiario}`} style={{ textDecoration: 'none', color: '#0066CC', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        Detalhes
                        <ChevronRight size={16} />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Sem dados de beneficiários no período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import styles from '../Relatorios.module.css';
import ReportHeader from '@/components/reports/ReportHeader';
import KPICard from '@/components/reports/KPICard';
import reportStyles from '@/components/reports/ReportComponents.module.css';
import { api } from '@/services/api';

export default function OperacionalReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroTempo, setFiltroTempo] = useState('estemes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/relatorios/operacional?filtroTempo=${filtroTempo}`);
        setData(res);
      } catch (error) {
        console.error('Erro ao buscar dados operacionais', error);
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

  // Montar KPIs
  const kpiData = [
    { title: "Total de Guias (Período)", value: data.totalGuiasPeriodo, icon: FileText, color: reportStyles.iconDefault },
    { title: "Taxa de Pendências", value: `${data.taxaPendencias.toFixed(1)}%`, icon: Clock, color: reportStyles.iconPurple },
    { title: "Taxa de Negativas", value: `${data.taxaNegativas.toFixed(1)}%`, icon: XCircle, color: reportStyles.iconRed },
    { title: "Tempo Médio (Geral)", value: data.tempoMedioGeral, icon: CheckCircle2, color: reportStyles.iconGreen },
  ];

  // Mesclar dados de evolução diária
  const abertas = data.graficoEvolucaoAbertas || [];
  const resolvidas = data.graficoEvolucaoResolvidas || [];
  const diasSet = new Set([...abertas.map((a: any) => a.dia), ...resolvidas.map((a: any) => a.dia)]);
  const lineChartData = Array.from(diasSet).sort((a, b) => (a as number) - (b as number)).map((dia: any) => {
    const aberto = abertas.find((a: any) => a.dia === dia);
    const resolvida = resolvidas.find((r: any) => r.dia === dia);
    return {
      name: `Dia ${dia}`,
      abertas: aberto ? aberto.total : 0,
      resolvidas: resolvida ? resolvida.total : 0
    };
  });

  // Mapear Cores do PieChart
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return '#2ECC71'; // Verde
      case 'NEGADA': return '#E74C3C'; // Vermelho
      case 'PENDENCIA': return '#8B5CF6'; // Roxo
      case 'EM_ANALISE': return '#F4B400'; // Amarelo
      default: return '#3FA9F5';
    }
  };

  const pieChartData = (data.distribuicaoStatus || []).map((s: any) => ({
    name: s.status,
    value: s.total,
    color: getStatusColor(s.status)
  }));

  const equipeData = data.produtividadeAuditores || [];

  return (
    <div className={styles.pageContainer}>
      <ReportHeader 
        title="Relatório Operacional e Auditoria" 
        breadcrumb="Relatórios > Operacional" 
        filtroTempo={filtroTempo}
        setFiltroTempo={setFiltroTempo}
      />

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className={styles.chartsGrid} style={{ marginTop: '1.5rem' }}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Evolução de Guias (Abertas vs Resolvidas)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="Abertas" dataKey="abertas" stroke="#0066CC" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Resolvidas" dataKey="resolvidas" stroke="#2ECC71" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Distribuição por Status</h3>
          <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {pieChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} guias`, 'Quantidade']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: 'auto' }}>
                  {pieChartData.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#4B5563', fontFamily: 'var(--font-inter)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                      {item.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ margin: 'auto', color: '#6B7280' }}>Sem dados de status.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Produtividade por Auditor (Top 3)</h3>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Nome do Auditor</th>
                <th>Guias Analisadas</th>
                <th>Tempo Médio de Resposta</th>
                <th>% de Aprovação</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {equipeData.length > 0 ? (
                equipeData.map((row: any) => (
                  <tr key={row.idAuditor} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>{row.nome}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Sem dados de auditores no período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
          <a href="/admin/relatorios/operacional/auditores" style={{ textDecoration: 'none', color: '#0066CC', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>Ver Ranking Completo de Auditores →</a>
        </div>
      </div>
    </div>
  );
}

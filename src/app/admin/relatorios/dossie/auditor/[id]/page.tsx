"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Stethoscope, Activity, CheckCircle2, Clock, Eye } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useRouter } from 'next/navigation';
import styles from '../../../Relatorios.module.css';
import { api } from '@/services/api';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function DossieAuditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const auditorId = unwrappedParams.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/relatorios/auditor/${auditorId}`);
        setData(res);
      } catch (error) {
        console.error('Erro ao buscar dossiê do auditor:', error);
      } finally {
        setLoading(false);
      }
    };
    if (auditorId) {
      fetchData();
    }
  }, [auditorId]);

  const getStatusBadge = (status: string) => {
    if (status === 'AUTORIZADA') return styles.badgeSuccess;
    if (status === 'NEGADA') return styles.badgeAlert;
    return styles.badgeWarning;
  };

  // Aggregating backend data {ano, mes, status, total} into Recharts format {mes: 'Jan', aprovadas: X, negadas: Y}
  const chartData = useMemo(() => {
    if (!data || !data.graficoDecisoes) return [];
    const grouped = new Map<string, { mes: string, aprovadas: number, negadas: number }>();
    
    data.graficoDecisoes.forEach((d: any) => {
      const key = `${d.ano}-${d.mes}`;
      if (!grouped.has(key)) {
        grouped.set(key, { 
          mes: `${monthNames[d.mes - 1]}/${d.ano.toString().slice(2)}`, 
          aprovadas: 0, 
          negadas: 0 
        });
      }
      const entry = grouped.get(key)!;
      if (d.status === 'AUTORIZADA') entry.aprovadas += d.total;
      if (d.status === 'NEGADA') entry.negadas += d.total;
    });

    return Array.from(grouped.values());
  }, [data]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dossiê do auditor...</div>;
  }

  if (!data) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Erro ao carregar dados.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.tableTitle} style={{ fontSize: '1.5rem' }}>Detalhes de Produtividade: Auditor</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-inter)' }}>
            Visão detalhada de performance e últimas guias avaliadas
          </p>
        </div>
      </div>

      {/* Header Card */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #F3F4F6', display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066CC' }}>
            <Stethoscope size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2C3E50', fontFamily: 'var(--font-poppins)' }}>{data.nome || 'Auditor'}</h2>
            <span style={{ color: '#6B7280', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>ID: {data.auditorId}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <CheckCircle2 size={14} /> Registro
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{data.registro || '-'}</strong>
          </div>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Activity size={14} /> Especialidade
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{data.especialidade || 'Geral'}</strong>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid} style={{ gridTemplateColumns: '1fr', marginBottom: '1.5rem' }}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Histórico de Decisões (6 meses)</h3>
          <div style={{ width: '100%', height: 250 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 102, 204, 0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="aprovadas" name="Aprovadas" fill="#2ECC71" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="negadas" name="Negadas" fill="#E74C3C" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sem dados no período</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Quality Assurance: Últimas Avaliações</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
            Lista cronológica reversa das últimas guias processadas por este auditor.
          </p>
        </div>
        <div className={styles.tableContainer} style={{ padding: '0' }}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Número da Guia</th>
                <th>Data / Hora</th>
                <th>Paciente</th>
                <th>Procedimento</th>
                <th>Tempo de Análise</th>
                <th>Veredito</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {data.ultimasAvaliacoes && data.ultimasAvaliacoes.length > 0 ? (
                data.ultimasAvaliacoes.map((row: any, index: number) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#2C3E50' }}>{row.numeroGuia}</td>
                    <td className={styles.tableCell} style={{ color: '#6B7280' }}>
                      {row.dataAuditoria ? new Date(row.dataAuditoria).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>{row.nomePaciente}</td>
                    <td className={styles.tableCell}>{row.procedimentoFormatado}</td>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: row.tempoAnalise === '00h 00m' ? '#E74C3C' : '#6B7280' }}>
                        <Clock size={14} />
                        {row.tempoAnalise}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getStatusBadge(row.veredito)}`}>
                        {row.veredito}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Nenhuma avaliação recente encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

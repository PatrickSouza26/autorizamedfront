import React, { useState, useEffect } from 'react';
import { Users, Building2, ShieldCheck, FileText, Percent, BarChart3, PieChart } from 'lucide-react';
import styles from './AdminDashboard.module.css';
import { api } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/relatorios/dashboard-admin')
      .then((res: any) => setDashboardData(res))
      .catch((err: any) => console.error("Erro ao carregar dashboard admin:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados do painel...</div>;
  }

  if (!dashboardData) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Não foi possível carregar os dados.</div>;
  }

  const {
    totalBeneficiarios,
    totalCredenciados,
    totalAuditores,
    solicitacoesPeriodo,
    taxaAprovacao,
    graficoEvolucaoAbertas,
    graficoStatus,
    topProcedimentos
  } = dashboardData;

  const maxValor = topProcedimentos?.length > 0 ? Math.max(...topProcedimentos.map((p: any) => p.totalSolicitado)) : 1;

  // Format line chart data
  const lineChartData = graficoEvolucaoAbertas?.map((d: any) => ({
    data: d.dia,
    solicitacoes: d.total
  })) || [];

  // Format pie chart data
  const pieChartData = graficoStatus?.map((d: any) => ({
    name: d.status,
    value: d.total
  })) || [];

  return (
    <div className={styles.dashboardContainer}>
      <header>
        <h1 className={styles.headerTitle}>Dashboard Administrativo</h1>
        <p className={styles.headerSubtitle}>Visão geral do sistema e principais indicadores.</p>
      </header>

      <div className={styles.kpiGrid}>
        {[
          { title: "Beneficiários", value: totalBeneficiarios || 0, icon: Users, color: "#0066CC" },
          { title: "Credenciados", value: totalCredenciados || 0, icon: Building2, color: "#F4B400" },
          { title: "Auditores", value: totalAuditores || 0, icon: ShieldCheck, color: "#3FA9F5" },
          { title: "Solicitações/Mês", value: solicitacoesPeriodo || 0, icon: FileText, color: "#2ECC71" },
          { title: "Taxa de Aprovação", value: `${Number(taxaAprovacao || 0).toFixed(1)}%`, icon: Percent, color: "#E74C3C" }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={styles.kpiCard}>
              <div className={styles.kpiIconContainer}>
                <div 
                  className={styles.kpiIcon} 
                  style={{ backgroundColor: `${kpi.color}1A`, color: kpi.color }}
                >
                  <Icon size={24} />
                </div>
              </div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>{kpi.value}</h3>
                <p className={styles.kpiLabel}>{kpi.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.chartHeader}>
            <BarChart3 size={20} className={styles.chartIcon} />
            <h3 className={styles.chartTitle}>Solicitações por dia/mês</h3>
          </div>
          <div className={styles.chartPlaceholder}>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="solicitacoes" stroke="#0066CC" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Dados insuficientes no período.
              </div>
            )}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.chartHeader}>
            <PieChart size={20} className={styles.chartIcon} />
            <h3 className={styles.chartTitle}>Status das solicitações</h3>
          </div>
          <div className={styles.chartPlaceholder}>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Dados insuficientes.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Procedimentos mais autorizados</h2>
        <div className={styles.rankingList}>
          {topProcedimentos?.length > 0 ? (
            topProcedimentos.map((proc: any, idx: number) => (
              <div key={idx} className={styles.rankingItem}>
                <div className={styles.rankingHeader}>
                  <span className={styles.rankingName}>{proc.nome || proc.descricao}</span>
                  <span className={styles.rankingValue}>{proc.totalSolicitado} aut.</span>
                </div>
                <div className={styles.rankingBarBg}>
                  <div 
                    className={styles.rankingBarFill} 
                    style={{ width: `${(proc.totalSolicitado / maxValor) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666' }}>Sem dados suficientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

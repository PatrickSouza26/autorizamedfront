"use client";

import React from 'react';
import { ArrowLeft, User, Calendar, CreditCard, Activity, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useRouter } from 'next/navigation';
import styles from '../../../Relatorios.module.css';

// ... (keep mock data as is)
const mockBeneficiario = {
  id: 1,
  nome: 'Carlos Eduardo Souza',
  idade: '45 anos',
  plano: 'Amil Fácil S80',
  carteirinha: '1234567890123456',
  desde: '01/2020',
};

const historicoMensalData = [
  { mes: 'Jan', guias: 2 },
  { mes: 'Fev', guias: 1 },
  { mes: 'Mar', guias: 5 },
  { mes: 'Abr', guias: 14 },
  { mes: 'Mai', guias: 12 },
  { mes: 'Jun', guias: 4 },
];

const timelineData = [
  { data: '15/06/2026', procedimento: 'Fisioterapia Motora (Sessão 4/10)', prestador: 'Clínica Ortopédica Vida', status: 'Realizado' },
  { data: '10/06/2026', procedimento: 'Fisioterapia Motora (Sessão 3/10)', prestador: 'Clínica Ortopédica Vida', status: 'Realizado' },
  { data: '05/06/2026', procedimento: 'Fisioterapia Motora (Sessão 2/10)', prestador: 'Clínica Ortopédica Vida', status: 'Realizado' },
  { data: '01/06/2026', procedimento: 'Fisioterapia Motora (Sessão 1/10)', prestador: 'Clínica Ortopédica Vida', status: 'Realizado' },
  { data: '20/05/2026', procedimento: 'Ressonância Magnética de Joelho', prestador: 'Hospital São José', status: 'Realizado' },
  { data: '15/05/2026', procedimento: 'Consulta Ortopedia', prestador: 'Dr. Roberto Santos', status: 'Realizado' },
];

export default function DossieBeneficiarioPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.tableTitle} style={{ fontSize: '1.5rem' }}>Detalhes de Utilização: Beneficiário</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-inter)' }}>
            Visão detalhada do histórico de uso do plano
          </p>
        </div>
      </div>

      {/* Header Card */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #F3F4F6', display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            <User size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2C3E50', fontFamily: 'var(--font-poppins)' }}>{mockBeneficiario.nome}</h2>
            <span style={{ color: '#6B7280', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>ID: {params.id}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <CreditCard size={14} /> Plano
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{mockBeneficiario.plano}</strong>
          </div>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Activity size={14} /> Carteirinha
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{mockBeneficiario.carteirinha}</strong>
          </div>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Calendar size={14} /> Idade
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{mockBeneficiario.idade}</strong>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid} style={{ gridTemplateColumns: '1fr', marginBottom: '1.5rem' }}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Histórico de Guias Emitidas (6 meses)</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={historicoMensalData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 102, 204, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="guias" fill="#0066CC" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Linha do Tempo Clínica (Timeline)</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
            Últimas autorizações e procedimentos realizados.
          </p>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {timelineData.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                {index !== timelineData.length - 1 && (
                  <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-24px', width: '2px', backgroundColor: '#E5E7EB' }} />
                )}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, marginTop: '2px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0066CC' }} />
                </div>
                <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#2C3E50', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>{item.procedimento}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {item.data}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>Executante: {item.prestador}</span>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

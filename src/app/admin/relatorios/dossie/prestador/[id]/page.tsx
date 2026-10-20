"use client";

import React from 'react';
import { ArrowLeft, Building2, MapPin, Activity, FileText } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { useRouter } from 'next/navigation';
import styles from '../../../Relatorios.module.css';

// ... (keep mock data as is)
const mockPrestador = {
  id: 1,
  nome: 'Clínica Ortopédica Vida Saudável',
  cnpj: '98.765.432/0001-10',
  tipo: 'Clínica Especializada',
  cidade: 'Rio de Janeiro / RJ',
  desde: '03/2018',
};

const historicoFaturamentoData = [
  { mes: 'Jan', guias: 320, negadas: 15 },
  { mes: 'Fev', guias: 280, negadas: 12 },
  { mes: 'Mar', guias: 350, negadas: 22 },
  { mes: 'Abr', guias: 310, negadas: 18 },
  { mes: 'Mai', guias: 390, negadas: 25 },
  { mes: 'Jun', guias: 450, negadas: 40 },
];

const topProcedimentosData = [
  { nome: 'Fisioterapia (Sessão)', qtd: 850 },
  { nome: 'Consulta Ortopedia', qtd: 420 },
  { nome: 'Ressonância Magnética', qtd: 310 },
  { nome: 'Raio-X de Extremidades', qtd: 250 },
  { nome: 'Imobilização', qtd: 110 },
];

export default function DossiePrestadorPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className={styles.pageContainer}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.tableTitle} style={{ fontSize: '1.5rem' }}>Detalhes de Utilização: Prestador</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-inter)' }}>
            Visão detalhada do volume e faturamento emitido
          </p>
        </div>
      </div>

      {/* Header Card */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #F3F4F6', display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '0.5rem', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            <Building2 size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2C3E50', fontFamily: 'var(--font-poppins)' }}>{mockPrestador.nome}</h2>
            <span style={{ color: '#6B7280', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>ID: {params.id}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <FileText size={14} /> CNPJ
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{mockPrestador.cnpj}</strong>
          </div>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Activity size={14} /> Categoria
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{mockPrestador.tipo}</strong>
          </div>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <MapPin size={14} /> Localização
            </span>
            <strong style={{ color: '#2C3E50', fontSize: '1rem' }}>{mockPrestador.cidade}</strong>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Volume de Guias (Aprovadas vs Negadas) - 6 meses</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={historicoFaturamentoData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" name="Guias Solicitadas" dataKey="guias" stroke="#0066CC" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Guias Negadas" dataKey="negadas" stroke="#E74C3C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Procedimentos Favoritos</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topProcedimentosData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }} width={120} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 102, 204, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="qtd" name="Qtd" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

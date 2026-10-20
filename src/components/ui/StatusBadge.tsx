import React from 'react';

type StatusGuia = 'AUTORIZADA' | 'EM_ANALISE' | 'EM_AUDITORIA' | 'PENDENCIA' | 'PENDENCIA_RESPONDIDA' | 'NEGADA' | 'CANCELADA';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = (s: string) => {
    switch (s) {
      case 'AUTORIZADA': return { backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71' };
      case 'EM_ANALISE': 
      case 'EM_AUDITORIA': return { backgroundColor: 'rgba(244, 180, 0, 0.1)', color: '#F4B400' };
      case 'PENDENCIA': return { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' };
      case 'PENDENCIA_RESPONDIDA': return { backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' };
      case 'NEGADA': return { backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C' };
      case 'CANCELADA': return { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const formatStatus = (s: string) => {
    switch (s) {
      case 'AUTORIZADA': return 'Autorizada';
      case 'EM_ANALISE': return 'Em Análise';
      case 'EM_AUDITORIA': return 'Em Auditoria';
      case 'PENDENCIA': return 'Pendência';
      case 'PENDENCIA_RESPONDIDA': return 'Pendência Respondida';
      case 'NEGADA': return 'Negada';
      case 'CANCELADA': return 'Cancelada';
      default: return s;
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span style={{ 
      ...style, 
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontWeight: 500,
      textAlign: 'center',
      display: 'inline-block',
      fontSize: '0.875rem'
    }}>
      {formatStatus(status)}
    </span>
  );
}

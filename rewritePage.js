const fs = require('fs');
const filePath = 'C:/Users/patri/OneDrive/Desktop/autorizamed/front/src/app/solicitacoes/[id]/page.tsx';

const newContent = \"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, User, Activity, Clock, Download, Paperclip, Send, AlertCircle, Printer, CheckCircle2, XCircle, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import styles from './Detalhes.module.css';
import api from '@/services/api';

export default function DetalhesSolicitacaoPage() {
  const params = useParams();
  const idGuia = params?.id as string;
  
  const [guia, setGuia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulando estados de ações na tela para prestador / auditor
  const [respostaEnviada, setRespostaEnviada] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [auditorAcao, setAuditorAcao] = useState<'NENHUMA' | 'AUTORIZADA' | 'NEGADA' | 'PENDENCIA'>('NENHUMA');
  const [justificativaAuditor, setJustificativaAuditor] = useState('');

  useEffect(() => {
    const fetchGuia = async () => {
      try {
        const response = await api.get(\\\/guias/\\\\\\);
        setGuia(response);
      } catch (err: any) {
        console.error("Erro ao buscar guia:", err);
        setError("Não foi possível carregar os dados desta guia.");
      } finally {
        setLoading(false);
      }
    };
    if (idGuia) fetchGuia();
  }, [idGuia]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados da guia...</div>;
  }

  if (error || !guia) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  // Se o auditor tomar alguma ação na tela, simulamos a mudança de status
  const statusEmTela = auditorAcao !== 'NENHUMA' ? auditorAcao : guia.statusAtual;
  const canAuditorAct = statusEmTela === 'EM_ANALISE' || statusEmTela === 'EM_AUDITORIA';

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return styles.badgeAprovada;
      case 'EM_ANALISE': 
      case 'EM_AUDITORIA': return styles.badgeAnalise;
      case 'PENDENCIA': return styles.badgePendencia;
      case 'NEGADA': return styles.badgeNegada;
      default: return '';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return 'Autorizada';
      case 'EM_ANALISE': return 'Em Análise';
      case 'EM_AUDITORIA': return 'Em Auditoria';
      case 'PENDENCIA': return 'Pendência';
      case 'NEGADA': return 'Negada';
      default: return status;
    }
  };

  const handleEnviarResposta = () => {
    if (mensagem.trim() !== '') {
      setRespostaEnviada(true);
      alert('Resposta enviada com sucesso!');
    }
  };

  const handleAuditorAction = (acao: 'AUTORIZADA' | 'NEGADA' | 'PENDENCIA') => {
    if ((acao === 'NEGADA' || acao === 'PENDENCIA') && justificativaAuditor.trim() === '') {
      alert('Por favor, informe a justificativa clínica.');
      return;
    }
    setAuditorAcao(acao);
    alert('Ação registrada com sucesso.');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Guia Nº {guia.numeroGuia || "Gerando..."}</h1>
            <span className={\\\\ \\\\}>
              {formatStatus(statusEmTela)}
            </span>
          </div>
          <p className={styles.breadcrumb}>
            <span style={{ color: '#6B7280' }}>Gestão &gt; Detalhes da Guia</span>
          </p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FileText size={20} className={styles.cardTitleIcon} />
            Dados da Solicitação
          </h2>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Beneficiário</span>
              <span className={styles.detailValue}>{guia.nomePaciente || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Carteirinha</span>
              <span className={styles.detailValue}>{guia.carteirinhaPaciente || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Indicação Clínica</span>
              <span className={styles.detailValue}>{guia.indicacaoClinica || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Data da Solicitação</span>
              <span className={styles.detailValue}>
                {guia.dataSolicitacao ? new Date(guia.dataSolicitacao).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            <Activity size={18} className={styles.cardTitleIcon} />
            Procedimentos Solicitados
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {guia.examesSolicitados && guia.examesSolicitados.length > 0 ? (
              guia.examesSolicitados.map((p: any, idx: number) => (
                <span key={idx} className={styles.detailValue}>• {p}</span>
              ))
            ) : (
              <span className={styles.detailValue}>Nenhum procedimento listado.</span>
            )}
          </div>

          <div className={styles.sectionDivider} />

          <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            <User size={18} className={styles.cardTitleIcon} />
            Médico Solicitante
          </h3>
          <div className={styles.detailsGrid} style={{ marginBottom: '0' }}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Nome</span>
              <span className={styles.detailValue}>{guia.nomeProfissionalSolicitante || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Conselho</span>
              <span className={styles.detailValue}>{guia.conselhoProfissionalSolicitante || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            <Paperclip size={18} className={styles.cardTitleIcon} />
            Arquivos Anexados
          </h3>
          <div className={styles.fileList}>
            {/* O endpoint atual não retorna os anexos no GuiaResponse, mockando caso vazio para manter a interface */}
            <div className={styles.fileItem}>
              <FileText size={20} className={styles.fileIcon} />
              <span className={styles.fileName}>pedido_medico.pdf (mock)</span>
              <button className={styles.btnDownload} title="Baixar anexo">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Clock size={20} className={styles.cardTitleIcon} />
              Histórico da Guia
            </h2>

            <div className={styles.timeline}>
              {guia.historico && guia.historico.length > 0 ? (
                guia.historico.map((evento: any, idx: number) => (
                  <div key={idx} className={styles.timelineEvent}>
                    <div className={\\\\ \\\\\\} />
                    <div className={styles.timelineDate}>
                      {evento.dataOcorrencia ? new Date(evento.dataOcorrencia).toLocaleString('pt-BR') : ''}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>{evento.status || evento.acao}</div>
                      <p className={styles.timelineText}>{evento.observacao || evento.descricao || 'Sem descrição'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.timelineEvent}>
                  <div className={\\\\ \\\\\\} />
                  <div className={styles.timelineDate}>
                    {guia.dataSolicitacao ? new Date(guia.dataSolicitacao).toLocaleString('pt-BR') : ''}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>Solicitação Criada</div>
                    <p className={styles.timelineText}>Guia enviada com sucesso.</p>
                  </div>
                </div>
              )}
            </div>

            {canAuditorAct && (
              <div className={styles.auditorBox}>
                <h3 className={styles.auditorTitle}>
                  <ShieldCheck size={20} color="#0066CC" />
                  Painel de Auditoria
                </h3>
                <textarea 
                  className={styles.textArea} 
                  placeholder="Justificativa clínica (Obrigatório para Negar ou Pendência)..."
                  value={justificativaAuditor}
                  onChange={(e) => setJustificativaAuditor(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <div className={styles.auditorButtons}>
                  <button className={styles.btnApprove} onClick={() => handleAuditorAction('AUTORIZADA')}>
                    <CheckCircle2 size={16} /> Aprovar
                  </button>
                  <button className={styles.btnDeny} onClick={() => handleAuditorAction('NEGADA')}>
                    <XCircle size={16} /> Negar
                  </button>
                  <button className={styles.btnPendency} onClick={() => handleAuditorAction('PENDENCIA')}>
                    <AlertCircle size={16} /> Pedir Pendência
                  </button>
                </div>
              </div>
            )}

            {statusEmTela === 'PENDENCIA' && !respostaEnviada && auditorAcao !== 'PENDENCIA' && (
              <div className={styles.pendencyBox}>
                <h3 className={styles.pendencyTitle}>
                  <AlertCircle size={20} />
                  Responder Pendência
                </h3>
                <textarea 
                  className={styles.textArea} 
                  placeholder="Digite sua justificativa médica ou resposta para o auditor..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
                <div className={styles.pendencyActions}>
                  <button className={styles.btnAttach}>
                    <Paperclip size={16} />
                    Anexar arquivo
                  </button>
                  <button className={styles.btnSubmit} onClick={handleEnviarResposta}>
                    <Send size={16} />
                    Enviar Resposta
                  </button>
                </div>
              </div>
            )}

            {statusEmTela === 'AUTORIZADA' && (
              <button 
                className={styles.btnPrint} 
                onClick={() => window.print()}
              >
                <Printer size={18} />
                Imprimir Guia de Autorização
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
\;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated page.tsx with API integration!');

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, User, Activity, Clock, Download, Paperclip, Send, AlertCircle, Printer, CheckCircle2, XCircle, ShieldCheck, ArrowLeft, Sparkles, Copy
} from 'lucide-react';
import Link from 'next/link';
import styles from './Detalhes.module.css';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DetalhesSolicitacaoPage() {
  const params = useParams();
  const router = useRouter();
  const idGuia = params?.id as string;
  
  const { user } = useAuth();
  const [guia, setGuia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulando estados de ações na tela para prestador / auditor
  const [respostaEnviada, setRespostaEnviada] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [auditorAcao, setAuditorAcao] = useState<'NENHUMA' | 'AUTORIZADA' | 'NEGADA' | 'PENDENCIA'>('NENHUMA');
  const [justificativaAuditor, setJustificativaAuditor] = useState('');

  useEffect(() => {
    const fetchGuia = async () => {
      try {
        const response = await api.get(`/guias/${idGuia}`);
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
  const canAuditorAct = (user?.role === 'AUDITOR' || user?.role === 'ADMIN') && 
    (statusEmTela === 'EM_ANALISE' || statusEmTela === 'EM_AUDITORIA' || statusEmTela === 'PENDENCIA_RESPONDIDA');

  const isPrestador = user?.role === 'PRESTADOR' || user?.role === 'FUNCIONARIO_PRESTADOR';

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return styles.badgeAprovada;
      case 'EM_ANALISE': 
      case 'EM_AUDITORIA': return styles.badgeAnalise;
      case 'PENDENCIA': return styles.badgePendencia;
      case 'PENDENCIA_RESPONDIDA': return styles.badgePendenciaRespondida || styles.badgeAnalise;
      case 'NEGADA': return styles.badgeNegada;
      case 'CANCELADA': return styles.badgeCancelada || styles.badgeNegada;
      default: return '';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'AUTORIZADA': return 'Autorizada';
      case 'EM_ANALISE': return 'Em Análise';
      case 'EM_AUDITORIA': return 'Em Auditoria';
      case 'PENDENCIA': return 'Pendência';
      case 'PENDENCIA_RESPONDIDA': return 'Pendência Respondida';
      case 'NEGADA': return 'Negada';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };

  const handleEnviarResposta = async () => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('arquivo', selectedFile);
        await api.post(`/guias/${idGuia}/anexos`, formData);
      }
      await api.patch(`/guias/${idGuia}/responder-pendencia`, {});
      setRespostaEnviada(true);
      alert('Resposta e anexos enviados com sucesso!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar resposta. Verifique o console.');
    }
  };

  const handleDownloadAnexo = async (anexo: any) => {
    try {
      const response = await api.get(`/guias/anexos/${anexo.idAnexo}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', anexo.nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar anexo", error);
      alert("Não foi possível baixar o anexo. Verifique sua permissão ou se o arquivo existe.");
    }
  };

  const handleDevolverFila = async () => {
    if (confirm('Tem certeza que deseja devolver esta guia para a fila geral? O seu bloqueio de auditoria será desfeito.')) {
      try {
        await api.patch(`/auditoria-medica/guias/${idGuia}/devolver-fila`, {});
        alert('Guia devolvida para a fila com sucesso!');
        router.push('/auditoria');
      } catch (err) {
        console.error(err);
        alert('Erro ao devolver a guia.');
      }
    }
  };

  const handleAuditorAction = async (acao: 'AUTORIZADA' | 'NEGADA' | 'PENDENCIA') => {
    if ((acao === 'NEGADA' || acao === 'PENDENCIA') && justificativaAuditor.trim() === '') {
      alert('Por favor, informe a justificativa clínica.');
      return;
    }
    try {
      let endpoint = '';
      if (acao === 'AUTORIZADA') endpoint = `/auditoria-medica/guias/${idGuia}/aprovar`;
      else if (acao === 'NEGADA') endpoint = `/auditoria-medica/guias/${idGuia}/negar`;
      else if (acao === 'PENDENCIA') endpoint = `/auditoria-medica/guias/${idGuia}/pendencia`;

      await api.patch(endpoint, { motivo: justificativaAuditor });
      
      setAuditorAcao(acao);
      alert('Ação concluída com sucesso!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Erro ao processar a ação. Verifique o console.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#4B5563' }} title="Voltar">
              <ArrowLeft size={24} />
            </button>
            <h1 className={styles.title} style={{ margin: 0 }}>Guia Nº {guia.numeroGuia || "Gerando..."}</h1>
            <span className={`${styles.badge} ${getBadgeStyle(statusEmTela)}`}>
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
            {guia.anexos && guia.anexos.length > 0 ? (
              guia.anexos.map((anexo: any) => (
                <div key={anexo.idAnexo} className={styles.fileItem}>
                  <FileText size={20} className={styles.fileIcon} />
                  <span className={styles.fileName}>{anexo.nomeArquivo}</span>
                  <button
                    onClick={() => handleDownloadAnexo(anexo)}
                    className={styles.btnDownload} 
                    title="Baixar anexo"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066CC' }}
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))
            ) : (
              <span className={styles.detailValue}>Nenhum arquivo anexado.</span>
            )}
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Clock size={20} className={styles.cardTitleIcon} />
              Histórico da Guia
            </h2>

            <div className={styles.timeline}>
              {/* Evento Base: Criação */}
              <div className={styles.timelineEvent}>
                <div className={`${styles.timelineDot} ${styles.timelineDotSuccess}`} />
                <div className={styles.timelineDate}>
                  {guia.dataSolicitacao ? new Date(guia.dataSolicitacao).toLocaleString('pt-BR') : ''}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>Guia Solicitada</div>
                  <p className={styles.timelineText}>
                    Solicitada por: {guia.nomeFuncionarioOperador || guia.nomePrestador || 'Sistema'}
                  </p>
                </div>
              </div>

              {/* Eventos do Histórico do Banco */}
              {guia.historico && guia.historico.length > 0 && (
                [...guia.historico].reverse().map((evento: any, idx: number) => {
                  let dotClass = styles.timelineDotSuccess;
                  if (evento.statusNovo === 'NEGADA') dotClass = styles.timelineDotError;
                  if (evento.statusNovo === 'PENDENCIA') dotClass = styles.timelineDotPendencia;
                  if (evento.statusNovo === 'EM_AUDITORIA') dotClass = styles.timelineDotAlert;

                  const isAiEvent = (evento.parecer && (evento.parecer.includes('IA médica') || evento.parecer.includes('Inteligência Artificial') || evento.parecer.includes('IA identificou') || evento.parecer.includes('inteligência artificial'))) || 
                                    (evento.motivoNegativa && (evento.motivoNegativa.includes('IA') || evento.motivoNegativa.includes('DUT')));

                  const dataFormatada = evento.dataMovimentacao 
                    ? new Date(evento.dataMovimentacao).toLocaleString('pt-BR') 
                    : '';

                  let titulo = 'Atualização de Status';
                  if (evento.statusAnterior === null) {
                    titulo = `Status Inicial: ${formatStatus(evento.statusNovo)}`;
                  } else if (evento.statusNovo) {
                    titulo = `Status Atualizado: ${formatStatus(evento.statusNovo)}`;
                  }

                  let textoObservacao = evento.parecer || evento.motivoNegativa || '';
                  if (!textoObservacao) {
                    textoObservacao = `Ação realizada por: ${evento.nomeUsuario || 'Sistema'} (${evento.perfilUsuario || 'N/A'})`;
                  }

                  return (
                    <div key={idx} className={styles.timelineEvent}>
                      <div 
                        className={`${styles.timelineDot} ${dotClass}`} 
                        style={isAiEvent ? { backgroundColor: '#7C3AED', boxShadow: '0 0 0 4px #EDE9FE' } : undefined}
                      />
                      <div className={styles.timelineDate}>
                        {dataFormatada}
                      </div>
                      <div 
                        className={styles.timelineContent}
                        style={isAiEvent ? { backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '8px', padding: '0.75rem', marginTop: '0.25rem' } : undefined}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <div className={styles.timelineHeader}>{titulo}</div>
                          {isAiEvent && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              backgroundColor: '#EDE9FE',
                              color: '#6D28D9',
                              borderRadius: '9999px',
                              fontSize: '0.7rem',
                              padding: '1px 8px',
                              fontWeight: 600
                            }}>
                              <Sparkles size={11} /> Automação Inteligente (IA)
                            </span>
                          )}
                        </div>
                        <p className={styles.timelineText} style={isAiEvent ? { color: '#4B5563', margin: 0 } : undefined}>{textoObservacao}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {canAuditorAct && (
              <div className={styles.auditorBox}>
                <h3 className={styles.auditorTitle}>
                  <ShieldCheck size={20} color="#0066CC" />
                  Painel de Auditoria
                </h3>

                {/* Banner com Parecer da IA e Botão de Ação Rápida */}
                {guia.alertaSistema && (
                  <div style={{
                    backgroundColor: '#F5F3FF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6D28D9', fontWeight: 600, fontSize: '0.9rem' }}>
                      <Sparkles size={18} />
                      <span>Parecer da Inteligência Artificial (Triagem)</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>
                      {guia.alertaSistema}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const textoLimpo = guia.alertaSistema.replace(/^Sugestão da IA para negar:\s*/i, '');
                        setJustificativaAuditor(textoLimpo);
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        background: '#7C3AED',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        marginTop: '0.25rem'
                      }}
                    >
                      <Copy size={14} />
                      Usar Parecer da IA como Justificativa
                    </button>
                  </div>
                )}

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
                  <button 
                    style={{ background: '#f87171', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }} 
                    onClick={handleDevolverFila}
                  >
                    <XCircle size={16} /> Devolver à Fila
                  </button>
                </div>
              </div>
            )}

            {isPrestador && statusEmTela === 'PENDENCIA' && !respostaEnviada && auditorAcao !== 'PENDENCIA' && (
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
                  <label className={styles.btnAttach} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={16} />
                    {selectedFile ? selectedFile.name : 'Anexar arquivo'}
                    <input type="file" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  </label>
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

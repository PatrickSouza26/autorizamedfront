"use client";

import React, { useState, useRef } from 'react';
import { Check, X, Search, Plus, Trash2, UploadCloud, FileText } from 'lucide-react';
import styles from './NovaSolicitacao.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

type StepStatus = 'idle' | 'current' | 'valid' | 'invalid';

interface Step {
  id: number;
  title: string;
  subtitle: string;
}

const STEPS: Step[] = [
  { id: 1, title: 'Beneficiário', subtitle: 'Dados pessoais' },
  { id: 2, title: 'Procedimento', subtitle: 'O que será realizado' },
  { id: 3, title: 'Médico Solicitante', subtitle: 'Quem está solicitando' },
  { id: 4, title: 'Anexos', subtitle: 'Documentos necessários' },
  { id: 5, title: 'Revisão', subtitle: 'Revise e envie' },
];

export default function NovaSolicitacao() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  // Step 1 - Beneficiário
  const [beneficiarioSearch, setBeneficiarioSearch] = useState('');
  const [beneficiario, setBeneficiario] = useState<any>(null);

  // Step 2 - Procedimentos
  const [procedimentoSearch, setProcedimentoSearch] = useState('');
  const [procedimentoQtd, setProcedimentoQtd] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProcedimentoTemp, setSelectedProcedimentoTemp] = useState<any>(null);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [indicacaoClinica, setIndicacaoClinica] = useState('');

  // Novos campos Backend
  const [caraterSolicitacao, setCaraterSolicitacao] = useState('ELETIVA');
  const [tipoSolicitacao, setTipoSolicitacao] = useState('CONSULTA');
  const [atendimentoRn, setAtendimentoRn] = useState(false);
  const [declaracaoAcidente, setDeclaracaoAcidente] = useState(false);

  // Step 3 - Profissional
  const [profNumeroConselho, setProfNumeroConselho] = useState('');
  const [profSiglaConselho, setProfSiglaConselho] = useState('CRM');
  const [profUfConselho, setProfUfConselho] = useState('SP');
  const [profNome, setProfNome] = useState('');
  const [profCboCodigo, setProfCboCodigo] = useState('');
  const [profCboTitulo, setProfCboTitulo] = useState('');
  
  // CBO Search state
  const [cboSearch, setCboSearch] = useState('');
  const [opcoesCbo, setOpcoesCbo] = useState<any[]>([]);
  const [showCboDropdown, setShowCboDropdown] = useState(false);

  const [isSearchingProfissional, setIsSearchingProfissional] = useState(false);
  const [isProfissionalAutoFilled, setIsProfissionalAutoFilled] = useState(false);
  const [isSearchingCbo, setIsSearchingCbo] = useState(false);

  // Step 4 - Anexos
  const [anexos, setAnexos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Mock Data
  const mockProcedimentos = [
    { codigo: '10101012', nome: 'Consulta' },
    { codigo: '20104235', nome: 'Eletrocardiograma' },
    { codigo: '40901114', nome: 'Ultrassonografia' },
  ];

  const getStepStatus = (stepId: number): StepStatus => {
    let isValid = false;
    if (stepId === 1) isValid = beneficiario !== null;
    if (stepId === 2) isValid = procedimentos.length > 0 && indicacaoClinica.trim() !== '';
    if (stepId === 3) isValid = profNumeroConselho.trim() !== '' && profNome.trim() !== '' && profCboCodigo.trim() !== '' && profCboTitulo.trim() !== '';
    if (stepId === 4) isValid = anexos.length > 0 || currentStep > 4;
    
    if (isValid) return 'valid';
    if (errors[stepId]) return 'invalid';
    if (currentStep === stepId) return 'current';
    return 'idle';
  };

  const [isSearchingBeneficiario, setIsSearchingBeneficiario] = useState(false);
  const [beneficiarioSearchError, setBeneficiarioSearchError] = useState('');
  const handleSearchBeneficiario = async () => {
    if (beneficiarioSearch.trim() !== '') {
      setIsSearchingBeneficiario(true);
        setBeneficiarioSearchError('');
      setErrors(prev => ({ ...prev, 1: false }));
      try {
        const prestadorId = user?.prestadorId || user?.id || '00000000-0000-0000-0000-000000000000';
        
        const data = await api.get(`/beneficiarios/${beneficiarioSearch}/elegibilidade?prestadorId=${prestadorId}`);

        setBeneficiario({
          ...data.beneficiario,
          plano: data.beneficiario?.tipoPlano || 'Não informado',
          celular: data.beneficiario?.telefone || 'Não informado',
          elegivel: data.elegivel,
          motivo: data.motivo
        });
      } catch (err: any) {
        console.error(err);
        setErrors(prev => ({ ...prev, 1: true }));
        setBeneficiario(null);
        setBeneficiarioSearchError(err.response?.data?.message || err.message || 'Beneficiário não encontrado pela carteirinha informada.');
      } finally {
        setIsSearchingBeneficiario(false);
      }
    }
  };
  const [opcoesProcedimento, setOpcoesProcedimento] = useState<any[]>([]);

  const handleProcedimentoSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setProcedimentoSearch(term);
    setSelectedProcedimentoTemp(null);

    if (term.length >= 3) {
      try {
        const data = await api.get(`/procedimentos/${term}`);
        const results = Array.isArray(data) ? data : [data];
        setOpcoesProcedimento(results);
        setShowDropdown(true);
      } catch (err: any) {
        setOpcoesProcedimento([]);
        setShowDropdown(false);
      }
    } else {
      setOpcoesProcedimento([]);
      setShowDropdown(false);
    }
  };

  const handleConselhoChange = async (numero: string) => {
    setProfNumeroConselho(numero);
    if (numero.trim().length >= 4) {
      setIsSearchingProfissional(true);
      try {
        const data = await api.get(`/profissionais-solicitantes/conselho/${numero}`);
        if (data && data.nome) {
          setProfNome(data.nome);
          setProfSiglaConselho(data.siglaConselho || 'CRM');
          setProfUfConselho(data.ufConselho || 'SP');
          setIsProfissionalAutoFilled(true);
          if (data.cbo) {
            setProfCboCodigo(data.cbo.codigo || '');
            setProfCboTitulo(data.cbo.titulo || '');
            setCboSearch(`${data.cbo.codigo} - ${data.cbo.titulo}`);
          }
          setErrors(prev => ({ ...prev, 3: false }));
        }
      } catch (err: any) {
        try {
            const data2 = await api.get(`/conselho/${numero}`);
            if (data2 && data2.nome) {
              setProfNome(data2.nome);
              setProfSiglaConselho(data2.siglaConselho || 'CRM');
              setProfUfConselho(data2.ufConselho || 'SP');
              setIsProfissionalAutoFilled(true);
              if (data2.cbo) {
                setProfCboCodigo(data2.cbo.codigo || '');
                setProfCboTitulo(data2.cbo.titulo || '');
                setCboSearch(`${data2.cbo.codigo} - ${data2.cbo.titulo}`);
              }
              setErrors(prev => ({ ...prev, 3: false }));
            }
        } catch (err2) {
          console.error(err2);
          setIsProfissionalAutoFilled(false);
        }
      } finally {
        setIsSearchingProfissional(false);
      }
    } else {
      setIsProfissionalAutoFilled(false);
    }
  };

  const handleCboSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCboSearch(term);
    setProfCboCodigo('');
    setProfCboTitulo('');

    if (term.trim().length >= 3) {
      setIsSearchingCbo(true);
      try {
        const data = await api.get(`/cbos/codigo/${term}`);
        const results = Array.isArray(data) ? data : [data];
        setOpcoesCbo(results);
        setShowCboDropdown(true);
      } catch (err: any) {
        try {
          const data2 = await api.get(`/codigo/${term}`);
          const results2 = Array.isArray(data2) ? data2 : [data2];
          setOpcoesCbo(results2);
          setShowCboDropdown(true);
        } catch (err2) {
          setOpcoesCbo([]);
          setShowCboDropdown(false);
        }
      } finally {
        setIsSearchingCbo(false);
      }
    } else {
      setOpcoesCbo([]);
      setShowCboDropdown(false);
    }
  };

  const handleAddProcedimento = () => {
    if (selectedProcedimentoTemp && procedimentoQtd > 0) {
      setProcedimentos(prev => {
        const existe = prev.find(p => p.codigo === selectedProcedimentoTemp.codigo);
        if (existe) {
          return prev.map(p => 
            p.codigo === selectedProcedimentoTemp.codigo 
              ? { ...p, quantidade: p.quantidade + procedimentoQtd } 
              : p
          );
        }
        return [...prev, { ...selectedProcedimentoTemp, quantidade: procedimentoQtd }];
      });
      setProcedimentoSearch('');
      setSelectedProcedimentoTemp(null);
      setProcedimentoQtd(1);
      setShowDropdown(false);
      setErrors(prev => ({ ...prev, 2: false }));
    }
  };


  const handleRemoveProcedimento = (index: number) => {
    setProcedimentos(procedimentos.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const selectedFiles = Array.from(e.target.files);
      const validFiles = [];

      for (const file of selectedFiles) {
        if (file.size > MAX_SIZE) {
          alert(`O arquivo "${file.name}" excede o limite máximo de 10MB e não será anexado.`);
        } else {
          validFiles.push({
            file: file,
            nome: file.name,
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          });
        }
      }

      if (validFiles.length > 0) {
        setAnexos([...anexos, ...validFiles]);
        setErrors(prev => ({ ...prev, 4: false }));
      }
    }
  };

  const handleRemoveAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) isValid = beneficiario !== null;
    else if (currentStep === 2) isValid = procedimentos.length > 0 && indicacaoClinica.trim() !== '';
    else if (currentStep === 3) isValid = profNumeroConselho.trim() !== '' && profNome.trim() !== '' && profCboCodigo.trim() !== '' && profCboTitulo.trim() !== '';
    else if (currentStep === 4) isValid = true;
    else if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        setSubmitError('');
        
        const token = localStorage.getItem('token');
        const payload = {
          carteirinhaBeneficiario: beneficiario.carteirinha,
          prestadorId: user?.prestadorId || user?.id || null,
          funcionarioId: user?.role === 'FUNCIONARIO_PRESTADOR' ? user?.id : null,
          profissionalSolicitante: {
            nome: profNome,
            siglaConselho: profSiglaConselho,
            numeroConselho: profNumeroConselho,
            ufConselho: profUfConselho,
            cbo: {
              codigo: profCboCodigo,
              titulo: profCboTitulo
            }
          },
          procedimentos: procedimentos.map(p => ({ codigoTuss: p.codigo, quantidade: p.quantidade })),
          caraterSolicitacao,
          atendimentoRn,
          declaracaoAcidente,
          indicacaoClinica,
          tipoSolicitacao
        };

        try {
                    const data = await api.post('/guias/solicitar', payload);
          
          if (anexos.length > 0 && data && data.id) {
            for (const anexo of anexos) {
              const formData = new FormData();
              formData.append('arquivo', anexo.file);
              await api.post(`/guias/${data.id}/anexos`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
            }
          }
          console.log('Guia solicitada:', data);
          router.push(`/solicitacoes/${data.idGuia || data.id}`);
        } catch (err: any) {
          console.error(err);
          setSubmitError(err.message || 'Erro ao criar a guia');
        } finally {
          setIsSubmitting(false);
        }
        return;
      } catch (err: any) {
        setSubmitError(err.message);
        return; // não avança
      } finally {
        setIsSubmitting(false);
      }
    }

    if (isValid) {
      setErrors(prev => ({ ...prev, [currentStep]: false }));
      setCurrentStep(prev => prev + 1);
    } else {
      setErrors(prev => ({ ...prev, [currentStep]: true }));
    }
  };


  let isNextDisabled = false;
  if (currentStep === 1) isNextDisabled = beneficiario === null;
  else if (currentStep === 2) isNextDisabled = procedimentos.length === 0 || indicacaoClinica.trim() === '';
  else if (currentStep === 3) isNextDisabled = profNumeroConselho.trim() === '' || profNome.trim() === '' || profCboCodigo.trim() === '';
  else if (currentStep === 5) isNextDisabled = isSubmitting;

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nova Solicitação</h1>
        <p className={styles.breadcrumb}>Dashboard &gt; Solicitações &gt; Nova Solicitação</p>
      </div>

      <div className={styles.stepperContainer}>
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === STEPS.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className={styles.stepWrapper}>
                <div className={styles.stepItem}>
                  <div className={`
                    ${styles.stepCircle}
                    ${status === 'current' ? styles.stepCircleCurrent : ''}
                    ${status === 'valid' ? styles.stepCircleValid : ''}
                    ${status === 'invalid' ? styles.stepCircleInvalid : ''}
                    ${status === 'idle' ? styles.stepCircleIdle : ''}
                  `}>
                    {status === 'valid' ? <Check size={14} /> : status === 'invalid' ? <X size={14} /> : step.id}
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <span className={styles.stepSubtitle}>{step.subtitle}</span>
                  </div>
                </div>
                {!isLast && (
                  <div className={`
                    ${styles.stepLine} 
                    ${getStepStatus(step.id) === 'valid' ? styles.stepLineValid : ''}
                    ${getStepStatus(step.id) === 'invalid' ? styles.stepLineInvalid : ''}
                  `} />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className={styles.formCard}>
        {/* Passo 1 */}
        {currentStep === 1 && (
          <div>
            <h2 className={styles.formSectionTitle}>1. Dados do beneficiário</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>CPF ou Carteirinha</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Digite o CPF ou número da carteirinha"
                  value={beneficiarioSearch}
                  onChange={(e) => { setBeneficiarioSearch(e.target.value); setBeneficiarioSearchError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchBeneficiario()}
                />
                <button className={styles.inputButton} onClick={handleSearchBeneficiario} disabled={isSearchingBeneficiario}>
                  {isSearchingBeneficiario ? <span style={{ fontSize: '0.8rem' }}>...</span> : <Search size={18} />}
                </button>
                </div>
                {beneficiarioSearchError && (
                  <div style={{ marginTop: '0.75rem', color: '#DC2626', fontSize: '0.875rem', fontWeight: 500 }}>
                    {beneficiarioSearchError}
                  </div>
                )}
              </div>

              {beneficiario && (
              <div className={styles.resultCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827', fontFamily: 'var(--font-inter)' }}>Elegibilidade</h3>
                  {beneficiario.elegivel ? (
                    <span style={{ backgroundColor: '#DEF7EC', color: '#03543F', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-inter)' }}>
                      Ativo / Elegível
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-inter)' }}>
                      Não Elegível - {beneficiario.motivo || 'Plano inativo'}
                    </span>
                  )}
                </div>
                <div className={styles.grid2Col}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nome completo</span>
                    <span className={styles.infoValue}>{beneficiario.nome}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>CPF</span>
                    <span className={styles.infoValue}>{beneficiario.cpf}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Data de nascimento</span>
                    <span className={styles.infoValue}>{beneficiario.dataNascimento}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Plano de saúde</span>
                    <span className={styles.infoValue}>{beneficiario.plano}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Carteirinha</span>
                    <span className={styles.infoValue}>{beneficiario.carteirinha}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Celular</span>
                    <span className={styles.infoValue}>{beneficiario.celular}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passo 2 */}
        {currentStep === 2 && (
          <div>
            <h2 className={styles.formSectionTitle}>2. Adicionar Procedimentos e Indicação Clínica</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Buscar Procedimento</label>
              <div className={styles.inputWrapper} style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Busque pelo código TUSS ou nome..."
                      value={procedimentoSearch}
                      onChange={handleProcedimentoSearchChange}
                      style={{ width: '100%' }}
                    />
                    {showDropdown && opcoesProcedimento.length > 0 && (
                      <div className={styles.dropdown}>
                        {opcoesProcedimento.map(p => (
                          <div 
                            key={p.codigoTuss} 
                            className={styles.dropdownItem}
                            onClick={() => {
                              setSelectedProcedimentoTemp({
                                codigo: p.codigoTuss,
                                nome: p.descricao
                              });
                              setProcedimentoSearch(`${p.codigoTuss} - ${p.descricao}`);
                              setShowDropdown(false);
                              setOpcoesProcedimento([]);
                            }}
                          >
                            <strong>{p.codigoTuss}</strong> - {p.descricao}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                <input 
                  type="number"
                  min="1"
                  className={styles.input}
                  style={{ width: '80px', maxWidth: '80px', flex: '0 0 80px', textAlign: 'center' }}
                  value={procedimentoQtd}
                  onChange={(e) => setProcedimentoQtd(parseInt(e.target.value) || 1)}
                  title="Quantidade"
                />
                <button className={styles.inputButton} onClick={handleAddProcedimento}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

              {procedimentos.length > 0 && (
                <div className={styles.listContainer} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>Procedimentos Selecionados</label>
                  <div style={{ marginTop: '0.5rem' }}>
                    {procedimentos.map((p, index) => (
                      <div key={index} className={styles.listItem}>
                        <span className={styles.listItemText}><strong>{p.quantidade}x</strong> {p.codigo} - {p.nome}</span>
                        <button className={styles.removeButton} onClick={() => handleRemoveProcedimento(index)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.grid2Col} style={{ marginTop: '1.5rem', gap: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tipo de Solicitação <span style={{ color: '#E74C3C' }}>*</span></label>
                  <select className={styles.input} value={tipoSolicitacao} onChange={(e) => setTipoSolicitacao(e.target.value)}>
                    <option value="CONSULTA">Consulta</option>
                    <option value="EXAME">Exame</option>
                    <option value="INTERNACAO">Internação</option>
                    <option value="CIRURGIA">Cirurgia</option>
                    <option value="PROCEDIMENTO_ESPECIAL">Procedimento Especial</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Caráter <span style={{ color: '#E74C3C' }}>*</span></label>
                  <select className={styles.input} value={caraterSolicitacao} onChange={(e) => setCaraterSolicitacao(e.target.value)}>
                    <option value="ELETIVA">Eletiva</option>
                    <option value="URGENCIA">Urgência</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={atendimentoRn} onChange={(e) => setAtendimentoRn(e.target.checked)} />
                  Atendimento a Recém Nascido (RN)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={declaracaoAcidente} onChange={(e) => setDeclaracaoAcidente(e.target.checked)} />
                  Declaração de Acidente
                </label>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                <label className={styles.label}>Indicação Clínica <span style={{ color: '#E74C3C' }}>*</span></label>
                <textarea 
                  className={styles.input} 
                  style={{ resize: 'vertical', minHeight: '80px', padding: '0.75rem', fontFamily: 'var(--font-inter)' }}
                  placeholder="Descreva a justificativa clínica para a solicitação destes procedimentos..."
                  value={indicacaoClinica}
                  onChange={(e) => {
                    setIndicacaoClinica(e.target.value);
                    setErrors(prev => ({ ...prev, 2: false }));
                  }}
                />
              </div>
          </div>
        )}

        {/* Passo 3 */}
        {currentStep === 3 && (
          <div>
            <h2 className={styles.formSectionTitle}>3. Médico Solicitante</h2>
            
            <div className={styles.grid2Col} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Número do Conselho <span style={{ color: '#E74C3C' }}>*</span></label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Ex: 123456"
                    value={profNumeroConselho}
                    onChange={(e) => handleConselhoChange(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {isSearchingProfissional && <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Buscando...</span>}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row', width: '100%' }}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Conselho <span style={{ color: '#E74C3C' }}>*</span></label>
                  <select className={styles.input} value={profSiglaConselho} onChange={e => setProfSiglaConselho(e.target.value)} disabled={isProfissionalAutoFilled}>
                    <option value="CRM">CRM</option>
                    <option value="CRO">CRO</option>
                    <option value="COREN">COREN</option>
                    <option value="CRFA">CRFA</option>
                    <option value="CRP">CRP</option>
                    <option value="CREFITO">CREFITO</option>
                  </select>
                </div>
                <div className={styles.inputGroup} style={{ width: '80px' }}>
                  <label className={styles.label}>UF <span style={{ color: '#E74C3C' }}>*</span></label>
                  <select className={styles.input} value={profUfConselho} onChange={e => setProfUfConselho(e.target.value)} disabled={isProfissionalAutoFilled}>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="PR">PR</option>
                    <option value="SC">SC</option>
                    <option value="RS">RS</option>
                    <option value="BA">BA</option>
                    <option value="PE">PE</option>
                    <option value="CE">CE</option>
                    <option value="GO">GO</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
              <label className={styles.label}>Nome do Profissional <span style={{ color: '#E74C3C' }}>*</span></label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Nome completo"
                value={profNome}
                onChange={e => setProfNome(e.target.value)} disabled={isProfissionalAutoFilled}
              />
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
              <label className={styles.label}>CBO <span style={{ color: '#E74C3C' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Digite o código ou nome do CBO"
                    value={cboSearch}
                    onChange={handleCboSearchChange}
                    style={{ flex: 1 }}
                  />
                  {isSearchingCbo && <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Buscando...</span>}
                </div>
                {showCboDropdown && opcoesCbo.length > 0 && (
                  <div className={styles.dropdown}>
                    {opcoesCbo.map(c => (
                      <div 
                        key={c.codigo} 
                        className={styles.dropdownItem}
                        onClick={() => {
                          setProfCboCodigo(c.codigo);
                          setProfCboTitulo(c.titulo);
                          setCboSearch(`${c.codigo} - ${c.titulo}`);
                          setShowCboDropdown(false);
                          setOpcoesCbo([]);
                        }}
                      >
                        <strong>{c.codigo}</strong> - {c.titulo}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Passo 4 */}
        {currentStep === 4 && (
          <div>
            <h2 className={styles.formSectionTitle}>4. Anexar Documentos</h2>
            <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={32} className={styles.dropzoneIcon} />
              <span className={styles.dropzoneText}>Clique para selecionar arquivos</span>
              <span className={styles.dropzoneSubtext}>Tamanho máximo: 10MB por arquivo (PDF, JPG, PNG)</span>
              <input 
                type="file" 
                multiple 
                className={styles.hiddenInput} 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {anexos.length > 0 && (
              <div className={styles.listContainer}>
                <label className={styles.label}>Arquivos Anexados</label>
                <div style={{ marginTop: '0.5rem' }}>
                  {anexos.map((file, index) => (
                    <div key={index} className={styles.listItem}>
                      <div className={styles.fileItem}>
                        <FileText size={20} className={styles.fileIcon} />
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>{file.nome}</span>
                          <span className={styles.fileTime}>Anexado às {file.horario}</span>
                        </div>
                      </div>
                      <button className={styles.removeButton} onClick={() => handleRemoveAnexo(index)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passo 5 */}
        {currentStep === 5 && (
          <div>
            <h2 className={styles.formSectionTitle}>5. Revisão da Solicitação</h2>
            
            <div className={styles.summarySection}>
              <h3 className={styles.summaryTitle}>Dados do Beneficiário</h3>
              <div className={styles.grid2Col}>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Nome</span><span className={styles.infoValue}>{beneficiario?.nome}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Carteirinha</span><span className={styles.infoValue}>{beneficiario?.carteirinha}</span></div>
              </div>
            </div>

            <div className={styles.summarySection}>
              <h3 className={styles.summaryTitle}>Procedimentos</h3>
              {procedimentos.map((p, i) => (
                <div key={i} className={styles.infoItem} style={{ marginBottom: '0.5rem' }}>
                  <span className={styles.infoValue}>• {p.quantidade}x {p.codigo} - {p.nome}</span>
                </div>
              ))}
              <div className={styles.infoItem} style={{ marginTop: '1rem' }}>
                <span className={styles.infoLabel}>Indicação Clínica</span>
                <span className={styles.infoValue}>{indicacaoClinica}</span>
              </div>
            </div>

            <div className={styles.summarySection}>
              <h3 className={styles.summaryTitle}>Médico Solicitante</h3>
              <div className={styles.grid2Col}>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Nome</span><span className={styles.infoValue}>{profNome}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>Conselho</span><span className={styles.infoValue}>{profSiglaConselho} {profNumeroConselho}</span></div>
              </div>
            </div>

            <div className={styles.summarySection}>
              <h3 className={styles.summaryTitle}>Anexos</h3>
              {anexos.map((a, i) => (
                <div key={i} className={styles.infoItem} style={{ marginBottom: '0.5rem' }}>
                  <span className={styles.infoValue}>• {a.nome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {currentStep > 1 && (
            <button className={styles.btnSecondary} onClick={handlePrev}>
              Voltar
            </button>
          )}
          <button className={styles.btnPrimary} onClick={handleNext} disabled={isNextDisabled}>
            {currentStep === 5 ? 'Enviar Solicitação' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}


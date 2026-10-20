"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, X, CheckCircle, Upload, FileText, Download, Power } from 'lucide-react';
import { api } from '@/services/api';
import styles from '../Admin.module.css';

export default function PrestadoresAdmin() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DADOS' | 'TUSS' | 'EQUIPE'>('DADOS');

  // Rede Credenciada / TUSS State
  const [tussList, setTussList] = useState<any[]>([]);
  const [loadingTuss, setLoadingTuss] = useState(false);
  const [tussSearch, setTussSearch] = useState('');
  const [tussResults, setTussResults] = useState<any[]>([]);
  const [isSearchingTuss, setIsSearchingTuss] = useState(false);
  const [showTussDropdown, setShowTussDropdown] = useState(false);
  const [isLinkingTuss, setIsLinkingTuss] = useState(false);
  const [tussFilter, setTussFilter] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nome: '', 
    email: '',
    telefone: '',
    documento: '', // CNPJ ou CPF
    ativo: true,
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const carregarPrestadores = async () => {
    try {
      setLoading(true);
      let endpoint = '/prestadores?size=50';
      if (searchTerm) {
        endpoint += `&busca=${encodeURIComponent(searchTerm)}`;
      }
      if (statusFilter === 'ATIVOS') {
        endpoint += '&ativo=true';
      } else if (statusFilter === 'INATIVOS') {
        endpoint += '&ativo=false';
      }
      
      const res = await api.get(endpoint);
      setData(res.content || res || []);
    } catch (error) {
      console.error("Erro ao buscar prestadores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPrestadores();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarPrestadores();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nome: item.nome || '',
        email: item.email || '',
        telefone: item.telefone || '',
        documento: item.documento || '',
        ativo: item.ativo ?? true,
        endereco: {
          logradouro: item.endereco?.logradouro || '',
          numero: item.endereco?.numero || '',
          complemento: item.endereco?.complemento || '',
          bairro: item.endereco?.bairro || '',
          cidade: item.endereco?.cidade || '',
          estado: item.endereco?.estado || '',
          cep: item.endereco?.cep || ''
        }
      });
      carregarContratosTuss(item.id);
    } else {
      setEditingId(null);
      setFormData({
        nome: '', email: '', telefone: '', documento: '', ativo: true,
        endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }
      });
      setTussList([]);
    }
    setTussSearch('');
    setShowTussDropdown(false);
    setImportStatus(null);
    setTussFilter('');
    setActiveTab('DADOS');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTussList([]);
    setTussSearch('');
    setShowTussDropdown(false);
    setImportStatus(null);
    setTussFilter('');
  };

  const carregarContratosTuss = async (prestadorId: string) => {
    try {
      setLoadingTuss(true);
      const res = await api.get(`/rede-credenciada/prestador/${prestadorId}`);
      setTussList(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Erro ao carregar contratos TUSS:", error);
      setTussList([]);
    } finally {
      setLoadingTuss(false);
    }
  };

  const handleBuscarProcedimento = async (termo: string) => {
    setTussSearch(termo);
    if (termo.trim().length >= 2) {
      setIsSearchingTuss(true);
      try {
        const res = await api.get(`/procedimentos/${encodeURIComponent(termo.trim())}`);
        setTussResults(Array.isArray(res) ? res : (res ? [res] : []));
        setShowTussDropdown(true);
      } catch (err) {
        setTussResults([]);
      } finally {
        setIsSearchingTuss(false);
      }
    } else {
      setTussResults([]);
      setShowTussDropdown(false);
    }
  };

  const vincularProcedimento = async (procedimento: any) => {
    if (!editingId) return;
    try {
      setIsLinkingTuss(true);
      await api.post('/rede-credenciada', {
        prestadorId: editingId,
        procedimentoId: procedimento.id,
        planosAceitos: ['BASICO', 'INTERMEDIARIO', 'PREMIUM']
      });
      setShowTussDropdown(false);
      setTussSearch('');
      await carregarContratosTuss(editingId);
    } catch (err: any) {
      alert(err.message || 'Erro ao vincular procedimento.');
    } finally {
      setIsLinkingTuss(false);
    }
  };

  const alternarStatusTuss = async (contratoId: string, ativoAtual: boolean) => {
    try {
      if (ativoAtual) {
        await api.patch(`/rede-credenciada/${contratoId}/inativar`, {});
      } else {
        await api.patch(`/rede-credenciada/${contratoId}/reativar`, {});
      }
      if (editingId) carregarContratosTuss(editingId);
    } catch (err: any) {
      console.error("Erro ao alterar status do vínculo:", err);
      alert(err.message || 'Erro ao alterar status do vínculo.');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

    setCsvImporting(true);
    setImportStatus({ message: 'Lendo arquivo CSV...' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length <= 1) {
          setImportStatus({ message: 'Arquivo CSV vazio ou sem dados.', isError: true });
          setCsvImporting(false);
          return;
        }

        const parseLine = (l: string) => l.split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const headers = parseLine(lines[0]).map(h => h.toLowerCase());

        let tussIdx = headers.findIndex(h => h.includes('tuss') || h.includes('codigo') || h === 'id');
        if (tussIdx === -1) tussIdx = 0;

        const codigosParaVincular: string[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (cols[tussIdx]) {
            codigosParaVincular.push(cols[tussIdx]);
          }
        }

        if (codigosParaVincular.length === 0) {
          setImportStatus({ message: 'Nenhum código TUSS válido encontrado.', isError: true });
          setCsvImporting(false);
          return;
        }

        setImportStatus({ message: `Processando ${codigosParaVincular.length} procedimentos...` });

        let vinculados = 0;
        let jaExistiam = 0;
        let naoEncontrados = 0;

        for (const cod of codigosParaVincular) {
          try {
            const procRes = await api.get(`/procedimentos/${encodeURIComponent(cod)}`);
            const procs = Array.isArray(procRes) ? procRes : (procRes ? [procRes] : []);
            const proc = procs.find((p: any) => p.codigoTuss === cod) || procs[0];

            if (!proc || !proc.id) {
              naoEncontrados++;
              continue;
            }

            await api.post('/rede-credenciada', {
              prestadorId: editingId,
              procedimentoId: proc.id,
              planosAceitos: ['BASICO', 'INTERMEDIARIO', 'PREMIUM']
            });
            vinculados++;
          } catch (err: any) {
            jaExistiam++;
          }
        }

        setImportStatus({
          message: `Concluído: ${vinculados} vinculados, ${jaExistiam} já existiam, ${naoEncontrados} não localizados no TUSS.`
        });
        await carregarContratosTuss(editingId);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        console.error("Erro na importação CSV:", err);
        setImportStatus({ message: `Erro ao importar: ${err.message || 'Falha no processamento'}`, isError: true });
      } finally {
        setCsvImporting(false);
      }
    };
    reader.readAsText(file, 'Windows-1252');
  };

  const baixarModeloCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent("codigo_tuss;descricao\n10101012;Consulta em consultorio\n40301633;Hemograma completo\n40302583;Ureia dosagem\n");
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", "modelo_contrato_tuss.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredTussList = tussList.filter(item => {
    if (!tussFilter) return true;
    const term = tussFilter.toLowerCase();
    return (
      (item.codigoTuss && item.codigoTuss.toLowerCase().includes(term)) ||
      (item.descricaoProcedimento && item.descricaoProcedimento.toLowerCase().includes(term))
    );
  });

  const alternarStatus = async (id: string, ativoAtual: boolean) => {
    try {
      if (ativoAtual) {
        await api.patch(`/prestadores/${id}/inativar`, {});
      } else {
        await api.patch(`/prestadores/${id}/reativar`, {});
      }
      carregarPrestadores();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        login: formData.email, 
        endereco: {
          ...formData.endereco,
          uf: formData.endereco.estado 
        }
      };

      if (editingId) {
        await api.patch(`/prestadores/${editingId}`, payload);
      } else {
        await api.post('/prestadores', payload);
      }
      closeModal();
      carregarPrestadores();
    } catch (error) {
      console.error("Erro ao salvar prestador:", error);
      alert("Erro ao salvar prestador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Prestadores (Rede Credenciada)</h1>
          <p className={styles.breadcrumb}>Gerencie clínicas, hospitais e laboratórios conveniados</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Razão Social ou CNPJ/CPF..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          <span>Novo Prestador</span>
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tabsContainer} style={{ padding: '0 1.5rem', paddingTop: '1.5rem', marginBottom: '0' }}>
          <button 
            className={`${styles.tabButton} ${statusFilter === 'TODOS' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('TODOS')}
          >
            Todos
          </button>
          <button 
            className={`${styles.tabButton} ${statusFilter === 'ATIVOS' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('ATIVOS')}
          >
            Ativos
          </button>
          <button 
            className={`${styles.tabButton} ${statusFilter === 'INATIVOS' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('INATIVOS')}
          >
            Inativos
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Nome / Razão Social</th>
                <th>CNPJ/CPF</th>
                <th>Código Prestador</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum prestador encontrado.</td></tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{item.nome}</td>
                    <td className={styles.tableCell}>{item.documento}</td>
                    <td className={styles.tableCell}>{item.numeroPrestador}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${item.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                      <div className={styles.actions}>
                        <button className={styles.btnAction} onClick={() => openModal(item)} title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={styles.btnAction} 
                          onClick={() => alternarStatus(item.id, item.ativo)}
                          title={item.ativo ? "Inativar" : "Reativar"}
                        >
                          {item.ativo ? <X size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalContentLarge}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? 'Editar Prestador' : 'Novo Prestador'}
              </h2>
              <button className={styles.btnClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.tabsContainer}>
              <button 
                type="button"
                className={`${styles.tabButton} ${activeTab === 'DADOS' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('DADOS')}
              >
                Dados Gerais
              </button>
              <button 
                type="button"
                className={`${styles.tabButton} ${activeTab === 'TUSS' ? styles.tabActive : ''}`}
                style={!editingId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                disabled={!editingId}
                title={!editingId ? "Salve os dados gerais do prestador antes de gerenciar a rede credenciada" : ""}
                onClick={() => {
                  if (editingId) {
                    setActiveTab('TUSS');
                    carregarContratosTuss(editingId);
                  }
                }}
              >
                Contrato e TUSS {editingId && tussList.length > 0 ? `(${tussList.length})` : ''}
              </button>
            </div>

            {activeTab === 'DADOS' && (
              <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Razão Social / Nome Fantasia *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.nome} 
                    onChange={e => setFormData({...formData, nome: e.target.value})} 
                    required 
                  />
                </div>
                
                <div className={styles.grid2Col}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CNPJ / CPF *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.documento} 
                      onChange={e => setFormData({...formData, documento: e.target.value})} 
                      required 
                      disabled={!!editingId}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefone Comercial</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.telefone} 
                      onChange={e => setFormData({...formData, telefone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>E-mail Institucional *</label>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                  />
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2C3E50' }}>Endereço</h3>
                </div>

                <div className={styles.grid2Col}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CEP *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.endereco.cep} 
                      onChange={e => setFormData({...formData, endereco: {...formData.endereco, cep: e.target.value}})} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Logradouro *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.endereco.logradouro} 
                      onChange={e => setFormData({...formData, endereco: {...formData.endereco, logradouro: e.target.value}})} 
                      required 
                    />
                  </div>
                </div>

                <div className={styles.grid2Col}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Número</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.endereco.numero} 
                      onChange={e => setFormData({...formData, endereco: {...formData.endereco, numero: e.target.value}})} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Complemento</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.endereco.complemento} 
                      onChange={e => setFormData({...formData, endereco: {...formData.endereco, complemento: e.target.value}})} 
                    />
                  </div>
                </div>

                <div className={styles.grid2Col}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Bairro *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.endereco.bairro} 
                      onChange={e => setFormData({...formData, endereco: {...formData.endereco, bairro: e.target.value}})} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cidade / UF *</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className={styles.input} 
                        style={{ flex: 3 }}
                        placeholder="Cidade"
                        value={formData.endereco.cidade} 
                        onChange={e => setFormData({...formData, endereco: {...formData.endereco, cidade: e.target.value}})} 
                        required 
                      />
                      <input 
                        type="text" 
                        className={styles.input} 
                        style={{ flex: 1 }}
                        placeholder="UF"
                        value={formData.endereco.estado} 
                        onChange={e => setFormData({...formData, endereco: {...formData.endereco, estado: e.target.value}})} 
                        required 
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Prestador'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'TUSS' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {/* Banner Informativo */}
                <div style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} color="#0066CC" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#1E40AF', fontSize: '0.9rem' }}>
                        Rede Credenciada TUSS - {formData.nome}
                      </div>
                      <div style={{ color: '#3B82F6', fontSize: '0.8rem' }}>
                        Procedimentos vinculados são liberados para realização independente da categoria de plano.
                      </div>
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: '#DBEAFE',
                    color: '#1D4ED8',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {tussList.length} {tussList.length === 1 ? 'procedimento' : 'procedimentos'}
                  </span>
                </div>

                {/* Seção de Ações Rápidas (Adição Manual + Importação CSV) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 1fr',
                  gap: '1.25rem',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  padding: '1.25rem'
                }}>
                  {/* Coluna 1: Adição Manual Rápida */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
                      Vincular Procedimento Individual
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                      <input
                        type="text"
                        className={styles.input}
                        style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                        placeholder="Digite código TUSS ou nome (ex: 10101012, Consulta)..."
                        value={tussSearch}
                        onChange={(e) => handleBuscarProcedimento(e.target.value)}
                        onFocus={() => {
                          if (tussResults.length > 0) setShowTussDropdown(true);
                        }}
                      />
                      {isSearchingTuss && (
                        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#6B7280' }}>
                          Buscando...
                        </span>
                      )}
                    </div>

                    {/* Dropdown Flutuante de Resultados */}
                    {showTussDropdown && (
                      <>
                        <div 
                          style={{ position: 'fixed', inset: 0, zIndex: 25 }} 
                          onClick={() => setShowTussDropdown(false)} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 30,
                          backgroundColor: '#FFFFFF',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          border: '1px solid #E5E7EB',
                          maxHeight: '230px',
                          overflowY: 'auto',
                          marginTop: '0.25rem'
                        }}>
                          {tussResults.length === 0 ? (
                            <div style={{ padding: '0.85rem', textAlign: 'center', color: '#6B7280', fontSize: '0.825rem' }}>
                              Nenhum procedimento encontrado.
                            </div>
                          ) : (
                            tussResults.map((proc: any) => {
                              const jaVinculado = tussList.some((t: any) => t.codigoTuss === proc.codigoTuss);
                              return (
                                <div
                                  key={proc.id}
                                  style={{
                                    padding: '0.65rem 0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #F3F4F6',
                                    gap: '0.5rem',
                                    fontSize: '0.825rem'
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: '#1F2937' }}>
                                      <code style={{ color: '#0066CC', background: '#F0F9FF', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{proc.codigoTuss}</code> {proc.descricao}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.15rem' }}>
                                      {proc.categoria || 'Geral'} {proc.requerAutorizacao ? '• Requer Autorização' : ''}
                                    </div>
                                  </div>
                                  {jaVinculado ? (
                                    <span style={{ fontSize: '0.72rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                                      Já vinculado
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className={styles.btnPrimary}
                                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem' }}
                                      disabled={isLinkingTuss}
                                      onClick={() => vincularProcedimento(proc)}
                                    >
                                      <Plus size={14} /> Vincular
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Coluna 2: Importação em Lote via CSV */}
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
                      Importação em Lote (.CSV)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCsvUpload}
                        accept=".csv"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ flex: 1, fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem' }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={csvImporting}
                      >
                        <Upload size={15} />
                        {csvImporting ? 'Processando...' : 'Importar CSV'}
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem' }}
                        onClick={baixarModeloCsv}
                        title="Baixar modelo de CSV de exemplo"
                      >
                        <Download size={15} /> Modelo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mensagem de Status de Importação */}
                {importStatus && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: importStatus.isError ? '#FEF2F2' : '#F0FDF4',
                    border: `1px solid ${importStatus.isError ? '#FECACA' : '#BBF7D0'}`,
                    color: importStatus.isError ? '#991B1B' : '#166534'
                  }}>
                    <span>{importStatus.message}</span>
                    <button
                      type="button"
                      onClick={() => setImportStatus(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {/* Tabela de Procedimentos Credenciados */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.925rem', color: '#2C3E50', fontWeight: 600 }}>
                      Procedimentos Credenciados
                    </h4>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ maxWidth: '240px', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                      placeholder="Filtrar nesta lista..."
                      value={tussFilter}
                      onChange={(e) => setTussFilter(e.target.value)}
                    />
                  </div>

                  <div style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {loadingTuss ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                        Carregando procedimentos credenciados...
                      </div>
                    ) : filteredTussList.length === 0 ? (
                      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#6B7280' }}>
                        <FileText size={36} color="#9CA3AF" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>
                          Nenhum procedimento credenciado encontrado
                        </div>
                        <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                          {tussFilter ? 'Nenhum item corresponde ao filtro digitado.' : 'Busque um procedimento acima para vincular manualmente ou importe uma planilha CSV.'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table className={styles.table} style={{ width: '100%' }}>
                          <thead className={styles.tableHead} style={{ position: 'sticky', top: 0, backgroundColor: '#F9FAFB', zIndex: 10 }}>
                            <tr>
                              <th style={{ padding: '0.65rem 1rem' }}>Código TUSS</th>
                              <th style={{ padding: '0.65rem 1rem' }}>Procedimento</th>
                              <th style={{ padding: '0.65rem 1rem' }}>Planos</th>
                              <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>Status</th>
                              <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>Ação</th>
                            </tr>
                          </thead>
                          <tbody className={styles.tableBody}>
                            {filteredTussList.map((item: any) => (
                              <tr key={item.id} className={styles.tableRow}>
                                <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: '#1E293B' }}>
                                  {item.codigoTuss}
                                </td>
                                <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                                  {item.descricaoProcedimento}
                                </td>
                                <td style={{ padding: '0.65rem 1rem' }}>
                                  <span style={{ backgroundColor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500 }}>
                                    Todos os Planos
                                  </span>
                                </td>
                                <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                                  <span className={`${styles.badge} ${item.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                                    {item.ativo ? 'Ativo' : 'Suspenso'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className={styles.btnAction}
                                    onClick={() => alternarStatusTuss(item.id, item.ativo)}
                                    title={item.ativo ? 'Suspender credenciamento' : 'Reativar credenciamento'}
                                    style={{ color: item.ativo ? '#EF4444' : '#10B981' }}
                                  >
                                    <Power size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

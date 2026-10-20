"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, X, CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import styles from '../Admin.module.css';

export default function CbosAdmin() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    codigo: '', 
    titulo: '',
    ativo: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importStatus, setImportStatus] = useState<{message: string, isError: boolean} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarCbos = async (page = 0) => {
    try {
      setLoading(true);
      let endpoint = `/cbos?page=${page}&size=50`;
      if (searchTerm) {
        endpoint = `/cbos/codigo/${encodeURIComponent(searchTerm)}`;
      }
      
      const res = await api.get(endpoint);
        if (res && res.content) {
          setData(res.content);
          const total = res.page ? res.page.totalPages : res.totalPages;
          setTotalPages(total || 1);
          const num = res.page ? res.page.number : res.number;
          setCurrentPage(num || 0);
        } else if (Array.isArray(res)) {
        setData(res);
        setTotalPages(1);
        setCurrentPage(0);
      } else if (res && res.id) {
        setData([res]);
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Erro ao buscar CBOs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCbos(0);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarCbos(0);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        codigo: item.codigo || '',
        titulo: item.titulo || '',
        ativo: item.ativo ?? true
      });
    } else {
      setEditingId(null);
      setFormData({
        codigo: '', titulo: '', ativo: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const alternarStatus = async (id: string, ativoAtual: boolean) => {
    try {
      if (ativoAtual) {
        await api.patch(`/cbos/${id}/inativar`, {});
      } else {
        await api.patch(`/cbos/${id}/reativar`, {});
      }
      carregarCbos(0);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.put(`/cbos/${editingId}`, formData);
      } else {
        await api.post('/cbos', formData);
      }
      closeModal();
      carregarCbos(0);
    } catch (error) {
      console.error("Erro ao salvar CBO:", error);
      alert("Erro ao salvar CBO.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ message: 'Lendo arquivo...', isError: false });
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length <= 1) {
          setImportStatus({ message: 'Arquivo CSV vazio ou sem dados.', isError: true });
          return;
        }

        const payload = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(';').map(c => c.trim().replace(/^"|"$/g, ''));
          const cols2 = cols.length < 2 ? lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, '')) : cols;
          
          if (cols2.length >= 2) {
            payload.push({
              codigo: cols2[0],
              titulo: cols2[1]
            });
          }
        }

        setImportStatus({ message: `Enviando ${payload.length} CBOs para o servidor...`, isError: false });
        
        await api.post('/cbos/lote', payload);
        
        setImportStatus({ message: `${payload.length} CBOs importados com sucesso!`, isError: false });
        if (fileInputRef.current) fileInputRef.current.value = '';
        carregarCbos(0);
        
      } catch (error: any) {
        console.error('Erro na importação:', error);
        setImportStatus({ message: `Erro ao importar: ${error.message || 'Verifique o formato do arquivo'}`, isError: true });
      }
    };
    reader.readAsText(file, 'Windows-1252'); // Resolve problema de acentuação do Excel/BR
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Especialidades (CBO)</h1>
          <p className={styles.breadcrumb}>Cadastros Gerais &gt; Especialidades e CBOs</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por código exato..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.btnSecondary} onClick={() => setIsImportModalOpen(true)}>
            <Upload size={18} />
            <span>Importar CSV</span>
          </button>
          <button className={styles.btnPrimary} onClick={() => openModal()}>
            <Plus size={18} />
            <span>Nova Especialidade</span>
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Código CBO</th>
                  <th>Título / Especialidade</th>
                <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma especialidade encontrada.</td></tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{item.codigo}</td>
                    <td className={styles.tableCell}>{item.titulo}</td>
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


      {/* Paginação */}
      {!searchTerm && totalPages > 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1rem", padding: "1rem" }}>
          <button 
            className={styles.btnSecondary} 
            disabled={currentPage === 0}
            onClick={() => carregarCbos(currentPage - 1)}
          >
            Anterior
          </button>
          <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>Página {currentPage + 1} de {totalPages}</span>
          <button 
            className={styles.btnSecondary} 
            disabled={currentPage >= totalPages - 1}
            onClick={() => carregarCbos(currentPage + 1)}
          >
            Próxima
          </button>
        </div>
      )}

      {/* MODAL DE IMPORTAÇÃO CSV */}
      {isImportModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Importar CBOs (CSV)</h2>
              <button className={styles.btnClose} onClick={() => setIsImportModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                O arquivo CSV deve possuir cabeçalho e ser separado por ponto e vírgula (;) ou vírgula (,). As colunas aceitas são:
              </p>
              
              <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                codigo;titulo<br/>
                225125;Médico Clínico<br/>
                225250;Médico Ginecologista e Obstetra
              </div>

              <div style={{ 
                border: '2px dashed #D1D5DB', 
                borderRadius: '0.5rem', 
                padding: '2rem', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
                marginTop: '1rem',
                gap: '1rem'
              }}>
                <FileText size={32} color="#9CA3AF" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0066CC', color: 'white', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>
                  <Upload size={18} />
                  Selecionar Arquivo CSV
                  <input 
                    type="file" 
                    accept=".csv, text/csv" 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </label>
              </div>

              {importStatus && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  borderRadius: '0.375rem', 
                  background: importStatus.isError ? '#FEF2F2' : '#ECFDF5',
                  color: importStatus.isError ? '#DC2626' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {importStatus.isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                  {importStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? 'Editar Especialidade (CBO)' : 'Nova Especialidade (CBO)'}
              </h2>
              <button className={styles.btnClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Código CBO *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.codigo} 
                  onChange={e => setFormData({...formData, codigo: e.target.value})} 
                  required 
                  disabled={!!editingId}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Título / Especialidade *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.titulo} 
                  onChange={e => setFormData({...formData, titulo: e.target.value})} 
                  required 
                />
              </div>

              <div className={styles.modalFooter} style={{ marginTop: '1rem' }}>
                <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, X, CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import styles from '../Admin.module.css';

export default function ProcedimentosAdmin() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // Initially false because we might not have a pagination endpoint yet, just searching
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    codigoTuss: '', 
    descricao: '',
    categoria: 'CONSULTA',
    requerAutorizacao: false,
    ativo: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importStatus, setImportStatus] = useState<{message: string, isError: boolean} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarProcedimentos = async (page = 0) => {
    try {
      setLoading(true);
      const endpoint = searchTerm ? `/procedimentos/${encodeURIComponent(searchTerm)}` : `/procedimentos?page=${page}&size=50`;
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
      console.error("Erro ao buscar procedimentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProcedimentos(0); // Initial load
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarProcedimentos(0);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        codigoTuss: item.codigoTuss || '',
        descricao: item.descricao || '',
        categoria: item.categoria || 'CONSULTA',
        requerAutorizacao: item.requerAutorizacao || false,
        ativo: item.ativo ?? true
      });
    } else {
      setEditingId(null);
      setFormData({
        codigoTuss: '', descricao: '', categoria: 'CONSULTA', requerAutorizacao: false, ativo: true
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
        await api.patch(`/procedimentos/${id}/inativar`, {});
      } else {
        await api.patch(`/procedimentos/${id}/reativar`, {});
      }
      carregarProcedimentos(0);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.patch(`/procedimentos/${editingId}`, formData);
      } else {
        await api.post('/procedimentos', formData);
      }
      closeModal();
      if (searchTerm) carregarProcedimentos(0);
    } catch (error) {
      console.error("Erro ao salvar procedimento:", error);
      alert("Erro ao salvar procedimento.");
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

        // Função robusta para ler CSV respeitando ponto e vírgula dentro de aspas
        const parseCsvLine = (line: string) => {
          let result = [];
          let inQuote = false;
          let value = '';
          for (let i = 0; i < line.length; i++) {
            let char = line[i];
            if (inQuote) {
              if (char === '"') {
                if (i < line.length - 1 && line[i + 1] === '"') { value += '"'; i++; } 
                else { inQuote = false; }
              } else { value += char; }
            } else {
              if (char === '"') { inQuote = true; } 
              else if (char === ';' || char === ',') { result.push(value.trim()); value = ''; } 
              else { value += char; }
            }
          }
          result.push(value.trim());
          return result;
        };

        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
        
        // Identificar colunas (Suporta tanto o padrão TUSS da ANS quanto o modelo simples antigo)
        let idIdx = headers.indexOf('id');
        if (idIdx === -1) idIdx = headers.indexOf('codigotuss');
        
        let descIdx = headers.indexOf('display_name');
        if (descIdx === -1) descIdx = headers.indexOf('descricao');
        
        let catIdx = headers.indexOf('categoria');
        let authIdx = headers.indexOf('requerautorizacao');

        if (idIdx === -1 || descIdx === -1) {
          throw new Error('Não foi possível encontrar as colunas de Código (id) e Descrição (display_name) no cabeçalho.');
        }

        const payload = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (cols.length > Math.max(idIdx, descIdx)) {
            const codigo = cols[idIdx];
            const descricao = cols[descIdx];
            
            if (!codigo) continue;

            // Inteligência para inferir categoria pelo primeiro dígito TUSS
            let categoria = 'OUTROS';
            let requerAuth = true;

            if (catIdx !== -1 && cols[catIdx]) {
              categoria = cols[catIdx];
            } else {
              if (codigo.startsWith('1')) { categoria = 'CONSULTA'; requerAuth = false; }
              else if (codigo.startsWith('2')) { categoria = 'PROCEDIMENTO_CLINICO'; requerAuth = true; }
              else if (codigo.startsWith('3')) { categoria = 'CIRURGIA'; requerAuth = true; }
              else if (codigo.startsWith('4')) { 
                // TUSS Capítulo 4 (Exames)
                // 4.01 é Laboratório in vitro
                if (codigo.startsWith('401')) {
                  categoria = 'EXAME_LABORATORIAL';
                } else {
                  categoria = 'EXAME_IMAGEM';
                }
                requerAuth = true; 
              }
            }

            if (authIdx !== -1 && cols[authIdx]) {
              requerAuth = cols[authIdx] === 'true' || cols[authIdx] === '1' || cols[authIdx].toLowerCase() === 'sim';
            }

            payload.push({
              codigoTuss: codigo,
              descricao: descricao,
              categoria: categoria,
              requerAutorizacao: requerAuth
            });
          }
        }

        setImportStatus({ message: `Enviando ${payload.length} procedimentos para o servidor... (isso pode levar alguns segundos)`, isError: false });
        
        // Em um cenário real com milhares de linhas, seria ideal enviar em chunks (lotes de 500).
        // Aqui estamos enviando tudo de uma vez assumindo um MVP.
        const chunkSize = 500;
        let importados = 0;
        
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          await api.post('/procedimentos/lote', chunk);
          importados += chunk.length;
        }
        
        setImportStatus({ message: `${importados} procedimentos importados com sucesso!`, isError: false });
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (searchTerm) carregarProcedimentos(0);
        
      } catch (error: any) {
        console.error('Erro na importação:', error);
        setImportStatus({ message: `Erro ao importar: ${error.message || 'Verifique o formato do arquivo'}`, isError: true });
      }
    };
    reader.readAsText(file, 'Windows-1252'); // Lê acentos corretamente no padrão Excel BR
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Procedimentos Médicos (TUSS)</h1>
          <p className={styles.breadcrumb}>Cadastros Gerais &gt; Procedimentos</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Buscar procedimento por código ou descrição..." 
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
            <span>Novo Procedimento</span>
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Código TUSS</th>
                  <th>Descrição</th>
                <th>Categoria</th>
                <th>Requer Aut.</th>
                <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Pesquisando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres para pesquisar.' : 'Nenhum procedimento encontrado.'}
                </td></tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{item.codigoTuss}</td>
                    <td className={styles.tableCell}>{item.descricao}</td>
                    <td className={styles.tableCell}>
                      {item.categoria === 'EXAME_LABORATORIAL' ? 'Exame Lab.' :
                       item.categoria === 'EXAME_IMAGEM' ? 'Exame Imagem' :
                       item.categoria === 'PROCEDIMENTO_CLINICO' ? 'Procedimento' :
                       item.categoria === 'INTERNACAO' ? 'Internação' :
                       item.categoria === 'CONSULTA' ? 'Consulta' :
                       item.categoria === 'CIRURGIA' ? 'Cirurgia' : 'Outros'}
                    </td>
                    <td className={styles.tableCell}>{item.requerAutorizacao ? 'Sim' : 'Não'}</td>
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
            onClick={() => carregarProcedimentos(currentPage - 1)}
          >
            Anterior
          </button>
          <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>Página {currentPage + 1} de {totalPages}</span>
          <button 
            className={styles.btnSecondary} 
            disabled={currentPage >= totalPages - 1}
            onClick={() => carregarProcedimentos(currentPage + 1)}
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
              <h2 className={styles.modalTitle}>Importar Procedimentos (CSV)</h2>
              <button className={styles.btnClose} onClick={() => setIsImportModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Você pode fazer o upload direto do arquivo CSV oficial da ANS (TUSS). O sistema identificará automaticamente as colunas <strong>id</strong> e <strong>display_name</strong>, e inferirá a categoria.
              </p>
              
              <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                id;source;display_name;extras_fim_vigencia...<br/>
                "30918090";"tuss-22";"Ablação percutânea...";"-"<br/>
                "10101012";"tuss-22";"Consulta em consultório";"-"
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
                {editingId ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h2>
              <button className={styles.btnClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Código TUSS *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.codigoTuss} 
                  onChange={e => setFormData({...formData, codigoTuss: e.target.value})} 
                  required 
                  disabled={!!editingId}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.descricao} 
                  onChange={e => setFormData({...formData, descricao: e.target.value})} 
                  required 
                />
              </div>

              <div className={styles.grid2Col}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Categoria *</label>
                  <select 
                    className={styles.input} 
                    value={formData.categoria} 
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="CONSULTA">Consulta</option>
                    <option value="PROCEDIMENTO_CLINICO">Procedimento Clínico / Ambulatorial</option>
                    <option value="EXAME_LABORATORIAL">Exame Laboratorial</option>
                    <option value="EXAME_IMAGEM">Exame de Imagem</option>
                    <option value="CIRURGIA">Cirurgia</option>
                    <option value="INTERNACAO">Internação</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Requer Autorização Prévia?</label>
                  <select 
                    className={styles.input} 
                    value={formData.requerAutorizacao ? 'true' : 'false'} 
                    onChange={e => setFormData({...formData, requerAutorizacao: e.target.value === 'true'})}
                  >
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                </div>
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


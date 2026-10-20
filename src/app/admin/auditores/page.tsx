"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, X, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';
import styles from '../Admin.module.css';

export default function AuditoresAdmin() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '', 
    email: '',
    telefone: '',
    cpf: '',
    numeroConselho: '',
    tipoConselho: 'CRM',
    ufConselho: 'SP',
    especialidade: '',
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

  const carregarAuditores = async () => {
    try {
      setLoading(true);
      let endpoint = '/auditoria-medica?size=50';
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
      console.error("Erro ao carregar auditores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAuditores();
  }, [searchTerm, statusFilter]);

  const openModal = (auditor?: any) => {
    if (auditor) {
      setEditingId(auditor.id);
      setFormData({
        ...auditor,
        endereco: auditor.endereco || { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '', email: '', telefone: '', cpf: '', numeroConselho: '', tipoConselho: 'CRM', ufConselho: 'SP', especialidade: '', ativo: true,
        endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }
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
        await api.patch(`/auditoria-medica/${id}/inativar`, {});
      } else {
        await api.patch(`/auditoria-medica/${id}/reativar`, {});
      }
      carregarAuditores();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: any = {
        ...formData,
      };
      
      delete payload.endereco;

      if (editingId) {
        await api.patch(`/auditoria-medica/${editingId}`, payload);
      } else {
        await api.post('/auditoria-medica', payload);
      }
      closeModal();
      carregarAuditores();
    } catch (error) {
      console.error("Erro ao salvar auditor:", error);
      alert("Erro ao salvar auditor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Médicos Auditores</h1>
          <p className={styles.breadcrumb}>Configurações &gt; Equipe Médica Interna</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Nome, CRM ou CPF..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          <span>Novo Auditor</span>
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
                <th>Nome Completo</th>
                <th>Conselho</th>
                <th>Especialidade</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum auditor encontrado.</td></tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 600 }}>{item.nome}</td>
                    <td className={styles.tableCell}>{item.tipoConselho} {item.numeroConselho}/{item.ufConselho}</td>
                    <td className={styles.tableCell}>{item.especialidade}</td>
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
                {editingId ? 'Editar Auditor' : 'Novo Auditor'}
              </h2>
              <button className={styles.btnClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome Completo *</label>
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
                    <label className={styles.label}>CPF *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.cpf} 
                      onChange={e => setFormData({...formData, cpf: e.target.value})} 
                      required 
                      disabled={!!editingId}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefone</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.telefone} 
                      onChange={e => setFormData({...formData, telefone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>E-mail (Login) *</label>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                  />
                </div>

                <div className={styles.grid3Col} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Conselho *</label>
                    <select 
                      className={styles.input} 
                      value={formData.tipoConselho} 
                      onChange={e => setFormData({...formData, tipoConselho: e.target.value})}
                    >
                      <option value="CRM">CRM</option>
                      <option value="CRO">CRO</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nº Conselho *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.numeroConselho} 
                      onChange={e => setFormData({...formData, numeroConselho: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>UF *</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.ufConselho} 
                      onChange={e => setFormData({...formData, ufConselho: e.target.value})} 
                      required 
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Especialidade Médica Principal</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.especialidade} 
                    onChange={e => setFormData({...formData, especialidade: e.target.value})} 
                  />
                </div>
              </div>

              <div className={styles.modalFooter} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Auditor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

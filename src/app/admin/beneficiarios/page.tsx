"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, X, Trash2, CheckCircle } from 'lucide-react';
import styles from '../Admin.module.css';
import { api } from '@/services/api';

export default function BeneficiariosAdmin() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '', 
    cpf: '', 
    dataNascimento: '', 
    carteirinha: '', 
    tipoPlano: 'BASICO',
    email: '',
    telefone: '',
    planoAtivo: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const carregarBeneficiarios = async () => {
    try {
      setLoading(true);
      let endpoint = '/beneficiarios?size=50';
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
      console.error("Erro ao buscar beneficiários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarBeneficiarios();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarBeneficiarios();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    carregarBeneficiarios();
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nome: item.nome || '',
        cpf: item.cpf || '',
        dataNascimento: item.dataNascimento || '',
        carteirinha: item.carteirinha || '',
        tipoPlano: item.tipoPlano || 'BASICO',
        email: item.email || '',
        telefone: item.telefone || '',
        planoAtivo: item.planoAtivo ?? true
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '', 
        cpf: '', 
        dataNascimento: '', 
        carteirinha: '', 
        tipoPlano: 'BASICO',
        email: '',
        telefone: '',
        planoAtivo: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        // Atualizar
        await api.patch(`/beneficiarios/${editingId}`, {
          nome: formData.nome,
          tipoPlano: formData.tipoPlano
        });
      } else {
        // Criar
        await api.post('/beneficiarios', {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
          dataNascimento: formData.dataNascimento,
          
          
          tipoPlano: formData.tipoPlano,
          dataAdesao: new Date().toISOString().split('T')[0]
        });
      }
      closeModal();
      carregarBeneficiarios();
    } catch (error) {
      console.error("Erro ao salvar beneficiário:", error);
      alert("Erro ao salvar beneficiário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const alternarStatus = async (id: string, ativoAtual: boolean) => {
    try {
      if (ativoAtual) {
        await api.patch(`/beneficiarios/${id}/inativar`, {});
      } else {
        await api.patch(`/beneficiarios/${id}/reativar`, {});
      }
      carregarBeneficiarios();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Beneficiários</h1>
          <p className={styles.breadcrumb}>Gerencie os beneficiários dos planos de saúde</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou carteirinha..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          <span>Novo Beneficiário</span>
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
                <th>Nome</th>
                <th>Carteirinha</th>
                <th>CPF</th>
                <th>Plano</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 500, color: '#111827' }}>{item.nome}</td>
                    <td className={styles.tableCell}>{item.carteirinha}</td>
                    <td className={styles.tableCell}>{item.cpf}</td>
                    <td className={styles.tableCell}>{item.tipoPlano}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${item.planoAtivo ? styles.badgeAtivo : styles.badgeInativo}`}>
                        {item.planoAtivo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                      <div className={styles.actions}>
                        <button className={styles.btnAction} onClick={() => openModal(item)} title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={styles.btnAction} 
                          onClick={() => alternarStatus(item.id, item.planoAtivo)}
                          title={item.planoAtivo ? "Inativar" : "Reativar"}
                        >
                          {item.planoAtivo ? <X size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                    Nenhum beneficiário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? 'Editar Beneficiário' : 'Novo Beneficiário'}
              </h2>
              <button className={styles.btnClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form className={styles.modalForm} onSubmit={handleSubmit}>
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
                  <label className={styles.label}>CPF {!editingId && '*'}</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.cpf} 
                    onChange={e => setFormData({...formData, cpf: e.target.value})} 
                    disabled={!!editingId}
                    required={!editingId}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Data de Nascimento {!editingId && '*'}</label>
                  <input 
                    type="date" 
                    className={styles.input} 
                    value={formData.dataNascimento} 
                    onChange={e => setFormData({...formData, dataNascimento: e.target.value})} 
                    disabled={!!editingId}
                    required={!editingId}
                  />
                </div>
              </div>

              {editingId && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nº Carteirinha (Gerada automaticamente)</label>
                  <input type="text" className={styles.input} value={formData.carteirinha} disabled />
                </div>
              )}

              <div className={styles.grid2Col}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Plano *</label>
                  <select 
                    className={styles.input} 
                    value={formData.tipoPlano} 
                    onChange={e => setFormData({...formData, tipoPlano: e.target.value})}
                    required
                  >
                    <option value="BASICO">Básico</option>
                    <option value="INTERMEDIARIO">Intermediário</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
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

              {!editingId && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>E-mail *</label>
                    <input 
                      type="email" 
                      className={styles.input} 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      required 
                    />
                  </div>
                </>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Beneficiário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Power, PowerOff } from 'lucide-react';
import styles from './Equipe.module.css';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EquipePage() {
  const { user, isLoading: authLoading } = useAuth();
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const initialFormState = {
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (user?.prestadorId) {
      fetchEmployees();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/funcionarios/prestador/${user?.prestadorId}`);
      setEmployees(res as any);
    } catch (error) {
      console.error("Erro ao carregar funcionários", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.cpf.includes(searchTerm)
  );

  const openModal = (emp?: any) => {
    if (emp) {
      setEditingId(emp.id);
      setFormData({
        nome: emp.nome || '',
        cpf: emp.cpf || '',
        email: emp.email || '',
        telefone: emp.telefone || '',
        cep: emp.endereco?.cep || '',
        logradouro: emp.endereco?.logradouro || '',
        numero: emp.endereco?.numero || '',
        bairro: emp.endereco?.bairro || '',
        cidade: emp.endereco?.cidade || '',
        uf: emp.endereco?.uf || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        endereco: {
          cep: formData.cep,
          logradouro: formData.logradouro,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf
        }
      };

      if (editingId) {
        // Atualizar
        await api.patch(`/funcionarios/${editingId}`, payload);
        alert('Funcionário atualizado com sucesso!');
      } else {
        // Criar (necessita cpf e prestadorId)
        const createPayload = {
          ...payload,
          cpf: formData.cpf,
          prestadorId: user?.prestadorId
        };
        await api.post('/funcionarios', createPayload);
        alert('Funcionário cadastrado com sucesso!');
      }
      
      closeModal();
      fetchEmployees();
    } catch (error: any) {
      console.error("Erro ao salvar", error);
      alert(error?.message || 'Erro ao salvar funcionário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (emp: any) => {
    try {
      if (emp.ativo) {
        if (!window.confirm(`Deseja inativar o funcionário ${emp.nome}?`)) return;
        await api.patch(`/funcionarios/${emp.id}/inativar`, {});
      } else {
        if (!window.confirm(`Deseja reativar o funcionário ${emp.nome}?`)) return;
        await api.patch(`/funcionarios/${emp.id}/reativar`, {});
      }
      fetchEmployees();
    } catch (error) {
      console.error("Erro ao alterar status", error);
      alert('Erro ao alterar status do funcionário');
    }
  };

  if (authLoading || loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando equipe...</div>;
  }

  if (!user?.prestadorId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Acesso Restrito</h2>
        <p>Apenas prestadores podem acessar a gestão de funcionários da clínica.</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Equipe</h1>
          <p className={styles.breadcrumb}>Administração &gt; Gestão de Funcionários</p>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Buscar por Nome ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className={styles.btnPrimary} onClick={() => openModal()}>
          <Plus size={18} />
          Novo Funcionário
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Nome / E-mail</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <span className={styles.employeeName}>{emp.nome}</span>
                    <span className={styles.employeeEmail}>{emp.email}</span>
                  </td>
                  <td className={styles.tableCell}>{emp.cpf}</td>
                  <td className={styles.tableCell}>{emp.telefone}</td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${emp.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                      {emp.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <button className={styles.btnAction} title="Editar" onClick={() => openModal(emp)}>
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className={`${styles.btnAction} ${emp.ativo ? styles.btnActionDelete : ''}`} 
                        title={emp.ativo ? "Inativar" : "Reativar"} 
                        onClick={() => handleToggleStatus(emp)}
                      >
                        {emp.ativo ? <PowerOff size={18} color="#E74C3C" /> : <Power size={18} color="#2ECC71" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                    Nenhum funcionário encontrado.
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
                {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <button className={styles.btnClose} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className={styles.input} 
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>E-mail (Login)</label>
                    <input 
                      type="email" 
                      required
                      className={styles.input} 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefone</label>
                    <input 
                      type="text" 
                      required
                      className={styles.input} 
                      value={formData.telefone}
                      onChange={e => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>CPF</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingId}
                    className={styles.input} 
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Endereço</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>CEP</label>
                    <input 
                      type="text" 
                      required
                      className={styles.input} 
                      value={formData.cep}
                      onChange={e => setFormData({...formData, cep: e.target.value})}
                    />
                  </div>
                  
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Logradouro</label>
                    <input 
                      type="text" 
                      required
                      className={styles.input} 
                      value={formData.logradouro}
                      onChange={e => setFormData({...formData, logradouro: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Número</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.numero}
                      onChange={e => setFormData({...formData, numero: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Bairro</label>
                    <input 
                      type="text" 
                      required
                      className={styles.input} 
                      value={formData.bairro}
                      onChange={e => setFormData({...formData, bairro: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Cidade</label>
                    <input 
                      type="text" 
                      required
                      className={styles.input} 
                      value={formData.cidade}
                      onChange={e => setFormData({...formData, cidade: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>UF</label>
                    <input 
                      type="text" 
                      required
                      maxLength={2}
                      className={styles.input} 
                      value={formData.uf}
                      onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter} style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className={styles.btnSecondary} onClick={closeModal} disabled={formLoading}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={formLoading}>
                  {formLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AuditoriaSistema.module.css';

interface AuditLog {
  id: string;
  data: string;
  acao: string;
  entidadeTipo: string;
  entidadeNome: string;
  usuarioNome: string;
  usuarioIp: string;
  descricao: string;
}

export default function AuditoriaSistema() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAcao, setSelectedAcao] = useState('');
  const [selectedEntidade, setSelectedEntidade] = useState('');

  // Debounce para evitar requisições a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(),
        size: itemsPerPage.toString()
      });

      if (debouncedSearch) params.append('pesquisa', debouncedSearch);
      if (selectedAcao) params.append('acao', selectedAcao);
      if (selectedEntidade) params.append('tipoEntidade', selectedEntidade);

      const response = await api.get(`/auditoria?${params.toString()}`);
      
      const data = response?.content || response?.data?.content || (Array.isArray(response) ? response : []);
      setLogs(Array.isArray(data) ? data : []);
      
      // Suporte ao Spring Boot 3/4 (response.page) e formatos legados
      const totalP = response?.page?.totalPages ?? response?.totalPages ?? response?.data?.totalPages ?? 1;
      const totalE = response?.page?.totalElements ?? response?.totalElements ?? response?.data?.totalElements ?? (Array.isArray(data) ? data.length : 0);
      
      setTotalPages(Math.max(1, totalP));
      setTotalElements(totalE);
      
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
      setLogs([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, debouncedSearch, selectedAcao, selectedEntidade]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeClass = (acao: string) => {
    if (!acao) return styles.badgeDefault;
    if (acao.includes('CREATE') || acao.includes('CRIAR') || acao.includes('NOVO')) return styles.badgeCreate;
    if (acao.includes('UPDATE') || acao.includes('ATUALIZAR') || acao.includes('EDITAR')) return styles.badgeUpdate;
    if (acao.includes('DELETE') || acao.includes('EXCLUIR') || acao.includes('INATIVAR')) return styles.badgeDelete;
    return styles.badgeDefault;
  };

  // Build pagination array
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Auditoria do Sistema</h1>
          <p className={styles.breadcrumb}>
            Relatórios &gt; {user?.role === 'PRESTADOR' ? 'Auditoria da Equipe' : 'Auditoria de Ações'}
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Search className={styles.filterIcon} size={18} />
            <input 
              type="text" 
              placeholder="Buscar por usuário, entidade ou descrição..." 
              className={styles.input}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className={styles.filterGroup} style={{ flex: '0.5' }}>
            <select 
              className={styles.select}
              value={selectedAcao}
              onChange={(e) => {
                setSelectedAcao(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todas as Ações</option>
              <option value="CREATE">Criação</option>
              <option value="UPDATE">Atualização</option>
              <option value="DELETE">Exclusão</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>
          
          <div className={styles.filterGroup} style={{ flex: '0.5' }}>
            <select 
              className={styles.select}
              value={selectedEntidade}
              onChange={(e) => {
                setSelectedEntidade(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todas Entidades</option>
              <option value="Guia">Guias</option>
              <option value="Usuario">Usuários</option>
              <option value="Paciente">Pacientes</option>
              <option value="Auditor">Auditores</option>
              <option value="Prestador">Prestadores</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Módulo/Entidade</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Carregando logs de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{formatDate(log.data)}</td>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>{log.usuarioNome}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${getBadgeClass(log.acao)}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{log.entidadeTipo} {log.entidadeNome ? `- ${log.entidadeNome}` : ''}</td>
                    <td className={styles.tableCell}>
                      <div className={styles.descricao} title={log.descricao}>
                        {log.descricao}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>
            Mostrando {totalElements === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalElements)} de {totalElements} resultados
          </span>
          
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              title="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            
            {startPage > 1 && (
              <>
                <button className={styles.pageBtn} onClick={() => setCurrentPage(1)}>1</button>
                {startPage > 2 && <span style={{ color: '#6B7280', padding: '0 4px' }}>...</span>}
              </>
            )}
            
            {visiblePages.map(page => (
              <button 
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span style={{ color: '#6B7280', padding: '0 4px' }}>...</span>}
                <button className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
              </>
            )}

            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              title="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

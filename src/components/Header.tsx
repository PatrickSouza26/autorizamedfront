"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  ChevronDown, 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Loader2, 
  Check 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

const DEMO_PROFILES = [
  {
    role: 'AUDITOR',
    login: 'auditor',
    senha: '123456',
    title: 'Auditor Médico',
    subtitle: 'Auditor Chefe',
    badge: 'Análise IA & Parecer',
    icon: Stethoscope,
    color: '#0284C7',
    bg: '#E0F2FE',
    redirect: '/auditoria'
  },
  {
    role: 'PRESTADOR',
    login: 'clinica',
    senha: '123456',
    title: 'Prestador / Clínica',
    subtitle: 'Clínica São Lucas',
    badge: 'Guias & Gestão de Equipe',
    icon: Building2,
    color: '#0D9488',
    bg: '#CCFBF1',
    redirect: '/'
  },
  {
    role: 'ADMIN',
    login: 'admin',
    senha: 'admin',
    title: 'Administrador',
    subtitle: 'Admin do Sistema',
    badge: 'Gestão Completa',
    icon: ShieldCheck,
    color: '#7C3AED',
    bg: '#EDE9FE',
    redirect: '/admin/beneficiarios'
  }
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signIn, signOut } = useAuth();
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loadingAvisos, setLoadingAvisos] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(event.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
  }, [user]);

  const getDestinatarioParams = () => {
    if (!user) return null;
    let tipo = '';
    let id = '';
    if (user.role === 'PRESTADOR' || user.role === 'FUNCIONARIO_PRESTADOR') {
      tipo = 'PRESTADOR';
      id = user.prestadorId || user.id;
    } else if (user.role === 'AUDITOR') {
      tipo = 'AUDITOR';
      id = user.id;
    } else if (user.role === 'BENEFICIARIO') {
      tipo = 'BENEFICIARIO';
      id = user.id;
    } else if (user.role === 'ADMIN') {
      tipo = 'SISTEMA';
      id = user.id;
    }
    if (tipo && id) return { tipo, id };
    return null;
  };

  const fetchUnreadCount = async () => {
    try {
      const params = getDestinatarioParams();
      if (params) {
        const res = await api.get(`/avisos/${params.tipo}/${params.id}/nao-lidos/count`);
        setUnreadCount(Number(res));
      }
    } catch (error) {
      console.error('Erro ao buscar quantidade de notificações', error);
    }
  };

  const fetchAvisos = async () => {
    try {
      setLoadingAvisos(true);
      const params = getDestinatarioParams();
      if (params) {
        // Busca a primeira página com as 5 últimas notificações
        const res: any = await api.get(`/avisos/${params.tipo}/${params.id}?pagina=0&tamanho=5`);
        setAvisos(res?.content || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações', error);
    } finally {
      setLoadingAvisos(false);
    }
  };

  const handleToggleNotifDropdown = () => {
    const newState = !showNotifDropdown;
    setShowNotifDropdown(newState);
    if (newState) {
      setShowUserDropdown(false);
      fetchAvisos();
    }
  };

  const handleLimparNotificacoes = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const params = getDestinatarioParams();
      if (params) {
        await api.patch(`/avisos/${params.tipo}/${params.id}/ler-todos`, {});
        setUnreadCount(0);
        setAvisos(avisos.map(a => ({ ...a, lido: true })));
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas', error);
    }
  };

  const handleToggleUserDropdown = () => {
    const newState = !showUserDropdown;
    setShowUserDropdown(newState);
    if (newState) {
      setShowNotifDropdown(false);
    }
  };

  const handleAvisoClick = async (aviso: any) => {
    setShowNotifDropdown(false);
    try {
      if (!aviso.lido) {
        await api.patch(`/avisos/${aviso.id}/lido`, {});
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Atualiza na lista local se o usuário abrir o dropdown novamente
        setAvisos(avisos.map(a => a.id === aviso.id ? { ...a, lido: true } : a));
      }
    } catch (error) {
      console.error('Erro ao marcar aviso como lido', error);
    }

    if (aviso.guiaId) {
      router.push(`/solicitacoes/${aviso.guiaId}`);
    }
  };

  const getAvisoIcon = (tipo: string) => {
    if (!tipo) return <AlertCircle size={16} color="#F59E0B" />;
    switch (tipo.toUpperCase()) {
      case 'SUCESSO': return <CheckCircle2 size={16} color="#10B981" />;
      case 'ERRO': return <XCircle size={16} color="#EF4444" />;
      default: return <AlertCircle size={16} color="#3B82F6" />;
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/solicitacoes': return 'Solicitações';
      case '/beneficiarios': return 'Beneficiários';
      case '/credenciados': return 'Credenciados';
      case '/auditoria': return 'Auditoria Médica';
      case '/equipe': return 'Equipe';
      case '/relatorios': return 'Relatórios';
      case '/admin': return 'Administração';
      case '/perfil': return 'Perfil';
      default: return 'AutorizaMed';
    }
  };

  const userName = user?.nome || 'Usuário';

  const getRoleInfo = (role?: string) => {
    switch (role) {
      case 'AUDITOR':
        return { label: 'Auditor Médico', color: '#0284C7', bg: '#E0F2FE', Icon: Stethoscope };
      case 'PRESTADOR':
      case 'FUNCIONARIO_PRESTADOR':
        return { label: 'Prestador (Clínica)', color: '#0D9488', bg: '#CCFBF1', Icon: Building2 };
      case 'ADMIN':
        return { label: 'Administrador', color: '#7C3AED', bg: '#EDE9FE', Icon: ShieldCheck };
      default:
        return { label: 'Perfil Conectado', color: '#4B5563', bg: '#F3F4F6', Icon: Sparkles };
    }
  };

  const handleSwitchRole = async (demoLogin: string, demoSenha: string, redirectUrl: string) => {
    if (user?.login === demoLogin) {
      setShowRoleSwitcher(false);
      return;
    }
    setSwitchingRole(true);
    try {
      const data: any = await api.post('/auth/login', {
        login: demoLogin,
        senha: demoSenha
      });
      await signIn(data);
      setShowRoleSwitcher(false);
      router.push(redirectUrl);
    } catch (err) {
      console.error('Erro ao alternar perfil demo:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const currentRoleInfo = getRoleInfo(user?.role);

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{getPageTitle()}</h2>

      <div className={styles.rightSide}>
        {/* Role Switcher Demo */}
        <div className={styles.roleSwitcherWrapper} ref={roleSwitcherRef}>
          <button 
            type="button" 
            className={styles.roleBadgeButton}
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            title="Alternar perfil de demonstração"
          >
            <span className={styles.demoTag}>Demo</span>
            <div 
              className={styles.roleBadgePill}
              style={{ backgroundColor: currentRoleInfo.bg, color: currentRoleInfo.color }}
            >
              <currentRoleInfo.Icon size={14} />
              <span>{currentRoleInfo.label}</span>
            </div>
            {switchingRole ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <ChevronDown size={14} color="#64748B" />
            )}
          </button>

          {showRoleSwitcher && (
            <div className={styles.roleDropdown}>
              <div className={styles.roleDropdownHeader}>
                <h4>
                  <Sparkles size={14} color="#6366F1" />
                  Alternar Perfil Demo
                </h4>
                <p>Navegue pelo sistema com as permissões de cada perfil</p>
              </div>

              <div className={styles.roleList}>
                {DEMO_PROFILES.map((profile) => {
                  const ProfileIcon = profile.icon;
                  const isActive = user?.login === profile.login || user?.role === profile.role || (profile.role === 'FUNCIONARIO_PRESTADOR' && (user?.role === 'PRESTADOR' || user?.role === 'FUNCIONARIO_PRESTADOR'));

                  return (
                    <button
                      key={profile.role}
                      type="button"
                      disabled={switchingRole}
                      className={`${styles.roleOption} ${isActive ? styles.roleOptionActive : ''}`}
                      onClick={() => handleSwitchRole(profile.login, profile.senha, profile.redirect)}
                    >
                      <div className={styles.roleOptionLeft}>
                        <div 
                          className={styles.roleOptionIcon}
                          style={{ backgroundColor: profile.bg, color: profile.color }}
                        >
                          <ProfileIcon size={16} />
                        </div>
                        <div className={styles.roleOptionInfo}>
                          <span className={styles.roleOptionTitle}>{profile.title}</span>
                          <span className={styles.roleOptionSubtitle}>{profile.subtitle}</span>
                        </div>
                      </div>
                      
                      {isActive ? (
                        <span className={styles.activeCheck}>
                          <Check size={14} /> Ativo
                        </span>
                      ) : (
                        <span className={styles.roleOptionBadge}>
                          {profile.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className={styles.searchInput}
          />
        </div>

        <div className={styles.notificationContainer} ref={notifRef} style={{ position: 'relative' }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={handleToggleNotifDropdown}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          
          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: '-10px',
              width: '350px',
              backgroundColor: '#FFF',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Notificações</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleLimparNotificacoes}
                      style={{
                        background: 'none', border: 'none', padding: 0, margin: 0,
                        fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer', fontWeight: 500,
                        textDecoration: 'underline'
                      }}
                    >
                      Limpar
                    </button>
                  )}
                  {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>({unreadCount})</span>}
                </div>
              </div>
              
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {loadingAvisos ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>Carregando...</div>
                ) : avisos.length > 0 ? (
                  avisos.map((aviso, idx) => (
                    <div 
                      key={aviso.id || idx} 
                      onClick={() => handleAvisoClick(aviso)}
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid #F3F4F6', 
                        display: 'flex', 
                        gap: '0.75rem',
                        cursor: 'pointer',
                        backgroundColor: aviso.lido ? '#FFFFFF' : '#F0F9FF',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = aviso.lido ? '#F9FAFB' : '#E0F2FE'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = aviso.lido ? '#FFFFFF' : '#F0F9FF'}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {getAvisoIcon(aviso.tipoAviso)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: aviso.lido ? 500 : 600, color: '#111827' }}>
                          {aviso.titulo}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#4B5563', lineHeight: '1.25rem' }}>
                          {aviso.mensagem}
                        </p>
                      </div>
                      {!aviso.lido && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: '6px' }} />
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                    Nenhuma notificação encontrada.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.userProfile} style={{ position: 'relative' }} ref={userRef} onClick={handleToggleUserDropdown}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{userName.split(' ')[0]}</span>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0066CC&color=fff&bold=true`} 
              alt="Foto do usuário" 
              className={styles.avatar}
            />
          </div>
          
          {showUserDropdown && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              backgroundColor: '#FFF',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '0.5rem',
              minWidth: '150px',
              zIndex: 50
            }}>
              <button 
                onClick={(e) => { e.stopPropagation(); signOut(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  borderRadius: '0.25rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldPlus, Eye, EyeOff, Stethoscope, Building2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import styles from './Login.module.css';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customLogin?: string, customSenha?: string, redirectPath = '/') => {
    if (e) e.preventDefault();
    setErro('');
    setLoading(true);

    const userLogin = customLogin || login;
    const userSenha = customSenha || senha;

    try {
      const data = await api.post('/auth/login', {
        login: userLogin,
        senha: userSenha
      });

      // Salvar token via AuthContext
      await signIn(data);
      router.push(redirectPath);
    } catch (err: any) {
      setErro('Credenciais inválidas ou erro no servidor.');
    } finally {
      setLoading(false);
      setLoadingProfile(null);
    }
  };

  const handleQuickLogin = (demoLogin: string, demoSenha: string, profileId: string, redirectPath: string) => {
    setLogin(demoLogin);
    setSenha(demoSenha);
    setLoadingProfile(profileId);
    handleLogin(undefined, demoLogin, demoSenha, redirectPath);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <h1 className={styles.title}>Tecnologia e inteligência a favor da saúde.</h1>
          <p className={styles.subtitle}>
            Mais agilidade, segurança e eficiência para autorizações médicas.
          </p>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <ShieldPlus size={28} />
            </div>
            <h2 className={styles.logoText}>AutorizaMed</h2>
          </div>

          <p className={styles.formTitle}>Acesse sua conta</p>

          {erro && (
            <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Login / Documento</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Digite seu login" 
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Senha</label>
              <div className={styles.inputWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={styles.input} 
                  placeholder="Digite sua senha" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <a href="#" className={styles.forgotPassword}>
              Esqueci minha senha
            </a>

            <button type="submit" className={styles.submitButton} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading && !loadingProfile ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* PAINEL DE ACESSO RÁPIDO PARA PORTFÓLIO */}
          <div className={styles.demoSection}>
            <div className={styles.demoHeader}>
              <span className={styles.demoTag}>
                <Sparkles size={12} /> Portfólio Demo
              </span>
              <span className={styles.demoTitle}>Acesso em 1 Clique</span>
            </div>
            <p className={styles.demoSubtitle}>
              Selecione um perfil para navegar no sistema sem digitar senhas:
            </p>

            <div className={styles.demoGrid}>
              {/* AUDITOR MÉDICO */}
              <button
                type="button"
                className={styles.demoButton}
                onClick={() => handleQuickLogin('auditor', '123456', 'auditor', '/auditoria')}
                disabled={loading}
              >
                <div className={styles.demoIconWrapper} style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                  {loadingProfile === 'auditor' ? <Loader2 size={16} className="animate-spin" /> : <Stethoscope size={16} />}
                </div>
                <div className={styles.demoBtnText}>
                  <span className={styles.demoRoleTitle}>Auditor Médico</span>
                  <span className={styles.demoRoleDesc}>Triagem da IA & Parecer</span>
                </div>
              </button>

              {/* PRESTADOR / CLÍNICA */}
              <button
                type="button"
                className={styles.demoButton}
                onClick={() => handleQuickLogin('clinica', '123456', 'prestador', '/solicitacoes')}
                disabled={loading}
              >
                <div className={styles.demoIconWrapper} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                  {loadingProfile === 'prestador' ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
                </div>
                <div className={styles.demoBtnText}>
                  <span className={styles.demoRoleTitle}>Prestador (Clínica)</span>
                  <span className={styles.demoRoleDesc}>Clínica São Lucas - Guias & Equipe</span>
                </div>
              </button>

              {/* ADMINISTRADOR */}
              <button
                type="button"
                className={styles.demoButton}
                onClick={() => handleQuickLogin('admin', 'admin', 'admin', '/')}
                disabled={loading}
              >
                <div className={styles.demoIconWrapper} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  {loadingProfile === 'admin' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                </div>
                <div className={styles.demoBtnText}>
                  <span className={styles.demoRoleTitle}>Administrador</span>
                  <span className={styles.demoRoleDesc}>Gestão Geral & Relatórios</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          © 2026 AutorizaMed. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}

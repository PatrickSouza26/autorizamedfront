"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building2, 
  ShieldCheck, 
  BarChart2, 
  Settings, 
  UserCircle,
  LogOut,
  ShieldPlus,
  Briefcase,
  Stethoscope,
  ChevronDown,
  Database
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '@/contexts/AuthContext';

// Define the menu structure with explicit roles for each item
type SubMenuItem = { name: string; path: string; roles?: string[] };
type MenuItem = { 
  name: string; 
  icon: any; 
  path?: string; 
  roles?: string[]; 
  subItems?: SubMenuItem[];
  disabled?: boolean;
};
const menuItems: MenuItem[] = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/',
    roles: ['ADMIN', 'PRESTADOR', 'FUNCIONARIO_PRESTADOR']
  },
  { 
    name: 'Solicitações', 
    icon: FileText, 
    path: '/solicitacoes',
    roles: ['PRESTADOR', 'FUNCIONARIO_PRESTADOR']
  },
  { 
    name: 'Cadastros Gerais', 
    icon: Database,
    roles: ['ADMIN'],
    subItems: [
      { name: 'Beneficiários', path: '/admin/beneficiarios' },
      { name: 'Prestadores', path: '/admin/prestadores' },
      { name: 'Médicos Auditores', path: '/admin/auditores' },
      { name: 'Procedimentos', path: '/admin/procedimentos' },
      { name: 'Especialidades (CBO)', path: '/admin/cbos' },
    ]
  },
  { 
    name: 'Auditoria Médica', 
    icon: ShieldCheck, 
    path: '/auditoria',
    roles: ['ADMIN', 'AUDITOR']
  },
  { 
    name: 'Equipe', 
    icon: Briefcase, 
    path: '/equipe',
    roles: ['PRESTADOR'] // Somente PRESTADOR (dono) vê a equipe para gerenciar
  },
  { 
    name: 'Relatórios', 
    icon: BarChart2, 
    roles: ['ADMIN', 'PRESTADOR'],
    subItems: [
      { name: 'Operacional e Auditoria', path: '/admin/relatorios/operacional', roles: ['ADMIN'] },
      { name: 'Frequência e Utilização', path: '/admin/relatorios/frequencia', roles: ['ADMIN'] },
      { name: 'Auditoria do Sistema', path: '/relatorios/sistema', roles: ['ADMIN', 'PRESTADOR'] }
    ]
  },
  { 
    name: 'Configurações', 
    icon: Settings, 
    path: '#', // Caminho vazio/hash para botão desabilitado
    roles: ['ADMIN', 'PRESTADOR', 'FUNCIONARIO_PRESTADOR', 'AUDITOR'],
    disabled: true // Flag customizada para desabilitar visualmente e na ação
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  // State for dropdowns. We initialize with the name of the menu item if one of its subItems is active.
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        const isActive = item.subItems.some(sub => pathname.startsWith(sub.path));
        if (isActive) {
          initialState[item.name] = true;
        }
      }
    });
    return initialState;
  });

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const userRole = user?.role || '';
  
  // Filtra os menus com base no cargo do usuário logado
  const filteredMenuItems = menuItems
    .filter(item => !item.roles || item.roles.includes(userRole))
    .map(item => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => !sub.roles || sub.roles.includes(userRole))
        };
      }
      return item;
    })
    .filter(item => !item.subItems || item.subItems.length > 0);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <ShieldPlus size={32} className={styles.logoIcon} />
        <span className={styles.logoText}>
          Autoriza<span className={styles.logoHighlight}>Med</span>
        </span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            
            // Sub-menu item
            if (item.subItems) {
              const isDropdownOpen = openDropdowns[item.name];
              const isAnyChildActive = item.subItems.some(sub => pathname.startsWith(sub.path));

              return (
                <li key={item.name} className={styles.dropdownContainer}>
                  <button 
                    className={`${styles.dropdownButton} ${isAnyChildActive ? styles.menuItemActive : ''}`}
                    onClick={() => toggleDropdown(item.name)}
                  >
                    <div className={styles.dropdownContent}>
                      <Icon size={20} className={`${styles.menuItemIcon} ${isAnyChildActive ? styles.menuItemIconActive : ''}`} />
                      <span className={`${styles.menuItemText} ${isAnyChildActive ? styles.menuItemTextActive : ''}`}>
                        {item.name}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`${styles.dropdownChevron} ${isDropdownOpen ? styles.dropdownChevronOpen : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <ul className={styles.subMenuList}>
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.path;
                        return (
                          <li key={subItem.path}>
                            <Link 
                              href={subItem.path} 
                              className={`${styles.subMenuItem} ${isSubActive ? styles.subMenuItemActive : ''}`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            // Normal Menu Item (Dashboard, Auditoria, etc)
            const isActive = item.path ? (pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))) : false;
            
            // Renderização especial para itens desabilitados
            if (item.disabled) {
              return (
                <li key={item.name}>
                  <div 
                    className={styles.menuItem}
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    title="Em breve"
                  >
                    <Icon size={20} className={styles.menuItemIcon} />
                    <span className={styles.menuItemText}>
                      {item.name}
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.path || item.name}>
                <Link 
                  href={item.path || '#'} 
                  className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                >
                  <Icon size={20} className={`${styles.menuItemIcon} ${isActive ? styles.menuItemIconActive : ''}`} />
                  <span className={`${styles.menuItemText} ${isActive ? styles.menuItemTextActive : ''}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutButton} onClick={signOut}>
          <LogOut size={20} />
          <span className={styles.logoutText}>Sair</span>
        </button>
      </div>
    </aside>
  );
}

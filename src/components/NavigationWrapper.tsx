"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import styles from "@/app/layout.module.css";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FFF' }}>
        {children}
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <main className={styles.mainContent}>
        <Header />
        <div className={styles.pageScroll}>
          {children}
        </div>
      </main>
    </>
  );
}

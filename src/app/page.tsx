"use client";

import React from "react";
import FuncionarioDashboard from "@/components/dashboard/FuncionarioDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import styles from "./page.module.css";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados do usuário...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role === 'AUDITOR') {
    router.push('/auditoria');
    return null;
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className={styles.pageContainer}>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <FuncionarioDashboard />
      )}
    </div>
  );
}

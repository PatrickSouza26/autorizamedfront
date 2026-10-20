import React from 'react';
import styles from './ReportComponents.module.css';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string; // e.g. styles.iconBlue
}

export default function KPICard({ title, value, icon: Icon, trend, trendUp, colorClass }: KPICardProps) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiHeader}>
        <div className={`${styles.kpiIconWrapper} ${colorClass || styles.iconDefault}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`${styles.kpiTrend} ${trendUp ? styles.trendUp : styles.trendDown}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className={styles.kpiBody}>
        <h3 className={styles.kpiValue}>{value}</h3>
        <p className={styles.kpiTitle}>{title}</p>
      </div>
    </div>
  );
}

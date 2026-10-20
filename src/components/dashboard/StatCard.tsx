import React from 'react';
import Link from 'next/link';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor?: string;
  linkText?: string;
  linkHref?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBgColor,
  linkText, 
  linkHref 
}: StatCardProps) {

  // Se não foi passado um backgroundColor explícito, inferimos injetando '1A' (10% de opacidade) no hex da cor base
  const finalBgColor = iconBgColor || `${iconColor}1A`;

  return (
    <div className={styles.cardStat}>
      <div className={styles.cardStatHeader}>
        <div 
          className={styles.cardStatIcon} 
          style={{ backgroundColor: finalBgColor, color: iconColor }}
        >
          <Icon size={24} />
        </div>
      </div>
      
      <div className={styles.cardStatBody}>
        <h3 className={styles.cardStatValue}>{value}</h3>
        <p className={styles.cardStatLabel}>{title}</p>
      </div>

      {linkText && linkHref && (
        <Link href={linkHref} className={styles.cardStatLink}>
          {linkText}
        </Link>
      )}
    </div>
  );
}

/*
 * Archivo: frontend/src/pages/AdminHomePage.jsx
 * (Dashboard Gerencial con Gráficas)
 */
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import apiClient from '../services/api';
import Header from '../components/Header';

const styles = {
  container: { padding: '20px' },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  kpiCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  kpiValue: { fontSize: '2.5rem', fontWeight: 'bold', color: '#057CD1', margin: '10px 0' },
  kpiLabel: { color: '#6B7280', fontSize: '1rem', fontWeight: '500' },
  chartSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    height: '400px',
  },
  chartTitle: { marginBottom: '20px', color: '#1F2937', textAlign: 'center' },
};

function AdminHomePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiClient.get('/stats/admin');
        setStats(res.data);
      } catch (error) {
        console.error('Error cargando stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando indicadores...</div>;
  if (!stats) return <div style={{ padding: '20px' }}>No hay datos disponibles.</div>;

  return (
    <div>
      <Header title="Tablero de Control (Dashboard)" />

      {/* 1. Tarjetas de KPI */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Cumplimiento Global</span>
          <span style={styles.kpiValue}>{stats.kpis.globalAverage}%</span>
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Promedio de todas las áreas</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total de Acciones</span>
          <span style={styles.kpiValue}>{stats.kpis.totalActions}</span>
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Registradas en el sistema</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Acciones Completadas (100%)</span>
          <span style={{ ...styles.kpiValue, color: '#16a34a' }}>
            {stats.kpis.completedActions}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Metas alcanzadas totalmente</span>
        </div>
      </div>

      {/* 2. Gráfica de Barras (Ranking por Proceso) */}
      <div style={styles.chartSection}>
        <h3 style={styles.chartTitle}>Desempeño por Proceso (Promedio % Avance)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={stats.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
            <YAxis domain={[0, 100]} />
            <Tooltip cursor={{ fill: '#F3F4F6' }} />
            <Bar dataKey="Promedio" radius={[4, 4, 0, 0]} barSize={50}>
              {stats.chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.Promedio >= 80 ? '#16a34a' : entry.Promedio >= 50 ? '#EAB308' : '#dc3545'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminHomePage;

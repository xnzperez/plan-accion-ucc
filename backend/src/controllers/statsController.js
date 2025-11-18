/*
 * Archivo: backend/src/controllers/statsController.js
 * (Cálculo de KPIs e Indicadores para el Dashboard)
 */
const db = require('../db/index.js');

const getAdminStats = async (req, res) => {
  try {
    // 1. KPIs Globales (Promedio total y Conteo)
    // COALESCE(..., 0) asegura que no devuelva null si está vacío
    const globalQuery = `
      SELECT 
        COUNT(*) as total_actions,
        COALESCE(AVG(goal_progress_percent), 0) as global_average,
        COUNT(CASE WHEN goal_progress_percent >= 100 THEN 1 END) as completed_actions
      FROM actions
    `;
    const globalRes = await db.query(globalQuery);
    const globalStats = globalRes.rows[0];

    // 2. Promedio por Proceso (Para la Gráfica de Barras)
    const byProcessQuery = `
      SELECT 
        p.name, 
        COALESCE(AVG(a.goal_progress_percent), 0) as average,
        COUNT(a.id) as action_count
      FROM processes p
      LEFT JOIN goals g ON p.id = g.process_id
      LEFT JOIN actions a ON g.id = a.goal_id
      GROUP BY p.id, p.name
      ORDER BY average DESC
    `;
    const byProcessRes = await db.query(byProcessQuery);

    // 3. Estado de las Acciones (Para Gráfica de Torta o contadores)
    // Contamos cuántos T1, T2, T3, T4 están en estado 'Aprobado' (3) vs Total
    // (Simplificación: Contamos acciones que tienen al menos un trimestre aprobado)
    // O mejor: Distribución de status actual (basado en el último trimestre activo)

    res.json({
      kpis: {
        totalActions: parseInt(globalStats.total_actions),
        globalAverage: parseFloat(globalStats.global_average).toFixed(1),
        completedActions: parseInt(globalStats.completed_actions),
      },
      chartData: byProcessRes.rows.map((row) => ({
        name: row.name,
        Promedio: parseFloat(row.average).toFixed(1),
        Acciones: parseInt(row.action_count),
      })),
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { getAdminStats };

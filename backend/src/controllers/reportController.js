/*
 * Archivo: backend/src/controllers/reportController.js
 * (Generador de Excel con estilos)
 */
const db = require('../db/index.js');
const ExcelJS = require('exceljs');

const downloadProcessReport = async (req, res) => {
  const { processId } = req.query;

  if (!processId) {
    return res.status(400).send('Se requiere el ID del proceso.');
  }

  try {
    // 1. OBTENER DATOS (Reutilizamos la lógica de uniones)
    // Traemos Metas -> Acciones -> Usuario Responsable
    const query = `
      SELECT 
        g.eje, 
        g.sub_eje, 
        g.goal_description as meta, 
        g.indicator,
        a.description as accion,
        a.responsible_charge,
        u.name as created_by,
        a.budget,
        a.activities,
        a.t1_execution_percent,
        a.t2_execution_percent,
        a.t3_execution_percent,
        a.t4_execution_percent,
        a.goal_progress_percent as avance_total
      FROM goals g
      LEFT JOIN actions a ON g.id = a.goal_id
      LEFT JOIN users u ON a.created_by_id = u.id
      WHERE g.process_id = $1
      ORDER BY g.id, a.created_at
    `;

    const { rows } = await db.query(query, [processId]);

    // Si no hay datos, igual generamos un excel vacío con encabezados

    // 2. CREAR LIBRO Y HOJA
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plan de Acción');

    // 3. DEFINIR COLUMNAS
    worksheet.columns = [
      { header: 'EJE ESTRATÉGICO', key: 'eje', width: 20 },
      { header: 'META', key: 'meta', width: 40 },
      { header: 'INDICADOR', key: 'indicator', width: 25 },
      { header: 'ACCIÓN', key: 'accion', width: 40 },
      { header: 'ACTIVIDADES', key: 'activities', width: 35 },
      { header: 'RESPONSABLE', key: 'responsible_charge', width: 20 },
      { header: 'PRESUPUESTO', key: 'budget', width: 15, style: { numFmt: '$#,##0' } }, // Formato moneda
      { header: '% T1', key: 't1', width: 8 },
      { header: '% T2', key: 't2', width: 8 },
      { header: '% T3', key: 't3', width: 8 },
      { header: '% T4', key: 't4', width: 8 },
      { header: '% AVANCE', key: 'avance', width: 12, style: { font: { bold: true } } },
    ];

    // 4. ESTILIZAR ENCABEZADOS (Fila 1)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto Blanco
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF057CD1' }, // Azul UCC (#057CD1)
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 5. AGREGAR FILAS
    rows.forEach((row) => {
      worksheet.addRow({
        eje: row.eje,
        meta: row.meta,
        indicator: row.indicator,
        accion: row.accion || 'Sin acciones',
        activities: row.activities,
        responsible_charge: row.responsible_charge,
        budget: parseFloat(row.budget || 0),
        t1: row.t1_execution_percent ? `${row.t1_execution_percent}%` : '-',
        t2: row.t2_execution_percent ? `${row.t2_execution_percent}%` : '-',
        t3: row.t3_execution_percent ? `${row.t3_execution_percent}%` : '-',
        t4: row.t4_execution_percent ? `${row.t4_execution_percent}%` : '-',
        avance: row.avance_total ? `${parseFloat(row.avance_total).toFixed(0)}%` : '0%',
      });
    });

    // 6. PREPARAR RESPUESTA (Headers para descarga)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'Reporte_Plan_Accion.xlsx');

    // 7. ENVIAR ARCHIVO
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generando reporte:', err);
    res.status(500).send('Error al generar el reporte');
  }
};

module.exports = { downloadProcessReport };

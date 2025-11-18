/*
 * Archivo: backend/src/controllers/actionController.js
 * (VERSIÓN LIMPIA Y SANITIZADA - SIN CARACTERES OCULTOS)
 */
const db = require('../db/index.js');

const STATUS_BORRADOR = 1;
const STATUS_ENVIADO = 2;
const STATUS_APROBADO = 3;
const STATUS_RECHAZADO = 4;
const STATUS_BLOQUEADO = 5;

// --- 1. OBTENER ACCIONES (JEFE) ---
const getActionsByGoal = async (req, res) => {
  const { goalId } = req.params;
  try {
    // Consulta SQL simplificada y limpia
    const actionsQuery = `
      SELECT 
        a.id, a.description, a.created_at, 
        a.responsible_charge, a.activities, a.budget,
        a.rejection_reason, a.observations_jefe,
        a.t1_completed, a.t2_completed, a.t3_completed, a.t4_completed,
        a.t1_execution_percent, a.t2_execution_percent, a.t3_execution_percent, a.t4_execution_percent,
        a.goal_progress_percent,
        a.t1_status_id, a.t2_status_id, a.t3_status_id, a.t4_status_id,
        g.process_id
      FROM actions a
      JOIN goals g ON a.goal_id = g.id
      WHERE a.goal_id = $1 
      ORDER BY a.created_at DESC
    `;
    
    const actionsResult = await db.query(actionsQuery, [goalId]);
    const actions = actionsResult.rows;

    if (actions.length === 0) {
      return res.json([]);
    }

    const actionIds = actions.map(action => action.id);
    
    // Consulta evidencias limpia
    const evidencesQuery = `SELECT id, file_url, description, quarter, action_id FROM evidences WHERE action_id = ANY($1::uuid[])`;
    const evidencesResult = await db.query(evidencesQuery, [actionIds]);
    const evidences = evidencesResult.rows;

    const evidencesMap = evidences.reduce((map, evidence) => {
      if (!map[evidence.action_id]) map[evidence.action_id] = [];
      map[evidence.action_id].push(evidence);
      return map;
    }, {});

    const actionsWithEvidences = actions.map(action => ({
      ...action,
      evidences: evidencesMap[action.id] || []
    }));

    res.json(actionsWithEvidences);
  } catch (err) {
    console.error('Error en getActionsByGoal:', err); // Log limpio
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 2. CREAR ACCIÓN (JEFE) ---
const createActionForGoal = async (req, res) => {
  const { goalId } = req.params;
  const { description, responsible_charge, activities, budget, observations_jefe } = req.body;
  const userId = req.user.id; 

  if (!description) return res.status(400).json({ error: 'La descripción es obligatoria' });

  try {
    const text = `
      INSERT INTO actions(
        description, goal_id, created_by_id, 
        responsible_charge, activities, budget, observations_jefe
      ) VALUES($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      description, goalId, userId, 
      responsible_charge || '', activities || '', budget || 0, observations_jefe || ''
    ];
    
    const { rows } = await db.query(text, values);
    const newActionId = rows[0].id;

    const resultQuery = `SELECT a.*, g.process_id FROM actions a JOIN goals g ON a.goal_id = g.id WHERE a.id = $1`;
    const result = await db.query(resultQuery, [newActionId]);
    
    const newAction = result.rows[0];
    newAction.evidences = []; 

    res.status(201).json(newAction);
  } catch (err) {
    console.error('Error al crear la acción:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 3. ACTUALIZAR CAMPOS (JEFE) ---
const updateActionFields = async (req, res) => {
  const { id } = req.params;
  const { responsible_charge, activities, budget, observations_jefe, t1_completed, t2_completed, t3_completed, t4_completed } = req.body;

  try {
    const updates = [];
    const values = [];
    let valueIndex = 1;
    const addUpdate = (field, value) => {
      if (value !== undefined) { updates.push(`${field} = $${valueIndex++}`); values.push(value); }
    };

    addUpdate('responsible_charge', responsible_charge);
    addUpdate('activities', activities);
    addUpdate('budget', budget);
    addUpdate('observations_jefe', observations_jefe);
    addUpdate('t1_completed', t1_completed);
    addUpdate('t2_completed', t2_completed);
    addUpdate('t3_completed', t3_completed);
    addUpdate('t4_completed', t4_completed);

    if (updates.length === 0) return res.status(200).json({ message: 'No hay cambios.' }); 
    
    values.push(id); 
    const text = `UPDATE actions SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
    const { rows } = await db.query(text, values);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en updateActionFields:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 4. ENVIAR TRIMESTRE (JEFE) ---
const sendQuarterForReview = async (req, res) => {
  const { id } = req.params;
  const { quarter } = req.body; 

  if (!quarter || quarter < 1 || quarter > 4) return res.status(400).json({ error: 'Trimestre inválido.' });
  const statusField = `t${quarter}_status_id`; 

  try {
    const text = `UPDATE actions SET ${statusField} = $1 WHERE id = $2 AND ${statusField} IN ($3, $4) RETURNING *`;
    const values = [STATUS_ENVIADO, id, STATUS_BORRADOR, STATUS_RECHAZADO];
    const { rows } = await db.query(text, values);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Acción no encontrada o estado inválido.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en sendQuarterForReview:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 5. OBTENER PENDIENTES (ADMIN) ---
const getPendingActions = async (req, res) => {
  try {
    const actionsQuery = `
      SELECT a.id AS action_id, g.goal_description, p.name AS process_name, u.name AS created_by_name, a.*
      FROM actions a
      JOIN goals g ON a.goal_id = g.id
      JOIN processes p ON g.process_id = p.id
      JOIN users u ON a.created_by_id = u.id
      WHERE a.t1_status_id = $1 OR a.t2_status_id = $1 OR a.t3_status_id = $1 OR a.t4_status_id = $1
      ORDER BY a.created_at ASC
    `;
    const actionsResult = await db.query(actionsQuery, [STATUS_ENVIADO]);
    const actions = actionsResult.rows;

    if (actions.length === 0) return res.json([]);

    const actionIds = actions.map(action => action.action_id);
    const evidencesQuery = `SELECT id, file_url, description, quarter, action_id FROM evidences WHERE action_id = ANY($1::uuid[])`;
    const evidencesResult = await db.query(evidencesQuery, [actionIds]);
    const evidences = evidencesResult.rows;
    
    const evidencesMap = evidences.reduce((map, evidence) => {
      if (!map[evidence.action_id]) map[evidence.action_id] = [];
      map[evidence.action_id].push(evidence);
      return map;
    }, {});
    
    const actionsWithEvidences = actions.map(action => ({ ...action, evidences: evidencesMap[action.action_id] || [] }));
    res.json(actionsWithEvidences);
  } catch (err) {
    console.error('Error al obtener pendientes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 6. REVISAR TRIMESTRE (ADMIN) ---
const reviewQuarter = async (req, res) => {
  const { id } = req.params;
  const { quarter, isApproved, percentage, reason } = req.body;

  if (!quarter || quarter < 1 || quarter > 4) return res.status(400).json({ error: 'Trimestre inválido.' });

  const statusField = `t${quarter}_status_id`; 
  const percentField = `t${quarter}_execution_percent`; 
  const nextStatusField = `t${quarter + 1}_status_id`; 

  try {
    const currentActionQuery = await db.query('SELECT * FROM actions WHERE id = $1', [id]);
    if (currentActionQuery.rows.length === 0) return res.status(404).json({ error: 'Acción no encontrada' });
    const currentAction = currentActionQuery.rows[0];

    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (isApproved) {
      updates.push(`${statusField} = $${valueIndex++}`); values.push(STATUS_APROBADO);
      updates.push(`${percentField} = $${valueIndex++}`); values.push(percentage);
      if (quarter < 4) {
        updates.push(`${nextStatusField} = $${valueIndex++}`); values.push(STATUS_BORRADOR);
      }
    } else {
      if (!reason) return res.status(400).json({ error: 'Motivo obligatorio.' });
      updates.push(`${statusField} = $${valueIndex++}`); values.push(STATUS_RECHAZADO);
      updates.push(`rejection_reason = $${valueIndex++}`); values.push(reason);
    }

    const mergedPercentages = {
      t1: parseFloat(currentAction.t1_execution_percent) || 0,
      t2: parseFloat(currentAction.t2_execution_percent) || 0,
      t3: parseFloat(currentAction.t3_execution_percent) || 0,
      t4: parseFloat(currentAction.t4_execution_percent) || 0,
    };
    if (isApproved) mergedPercentages[`t${quarter}`] = parseFloat(percentage) || 0;
    
    const calculatedGoalProgress = (mergedPercentages.t1 + mergedPercentages.t2 + mergedPercentages.t3 + mergedPercentages.t4) / 4;
    updates.push(`goal_progress_percent = $${valueIndex++}`); values.push(calculatedGoalProgress);

    values.push(id); 
    const text = `UPDATE actions SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
    const { rows } = await db.query(text, values);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en reviewQuarter:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- 7. ELIMINAR ACCIÓN (ADMIN) ---
const deleteAction = async (req, res) => {
  const { id } = req.params; 
  try {
    await db.query('DELETE FROM evidences WHERE action_id = $1', [id]);
    const result = await db.query('DELETE FROM actions WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Acción no encontrada' });
    res.json({ message: 'Acción eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar acción' });
  }
};

module.exports = {
  getActionsByGoal,
  createActionForGoal,
  updateActionFields,     
  sendQuarterForReview,   
  getPendingActions,
  reviewQuarter,
  deleteAction
};
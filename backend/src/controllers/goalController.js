/*
 * Archivo: backend/src/controllers/goalController.js
 * (Versión Final - Con Eliminación)
 */
const db = require('../db/index.js');

const getGoalsForJefe = async (req, res) => {
  const userId = req.user.id;
  try {
    const assignmentQuery = 'SELECT process_id FROM user_process_assignments WHERE user_id = $1';
    const assignmentResult = await db.query(assignmentQuery, [userId]);

    if (assignmentResult.rows.length === 0) return res.json([]);

    const processIds = assignmentResult.rows.map((r) => r.process_id);
    const goalsQuery = 'SELECT * FROM goals WHERE process_id = ANY($1::int[]) ORDER BY id';
    const goalsResult = await db.query(goalsQuery, [processIds]);

    res.json(goalsResult.rows);
  } catch (err) {
    console.error('Error en getGoalsForJefe:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createGoal = async (req, res) => {
  const { eje, sub_eje, goal_description, indicator, process_id, start_date, end_date } = req.body;

  if (!goal_description || !process_id) {
    return res.status(400).json({ error: 'Descripción y Proceso son obligatorios.' });
  }

  const action_plan_id = 1;

  try {
    const text =
      'INSERT INTO goals(eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const values = [
      eje || '',
      sub_eje || '',
      goal_description,
      indicator || '',
      process_id,
      action_plan_id,
      start_date || null,
      end_date || null,
    ];

    const { rows } = await db.query(text, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error en createGoal:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getGoalsByProcess = async (req, res) => {
  const { processId } = req.query;
  if (!processId)
    return res.status(400).json({ error: 'El query param "processId" es requerido.' });

  try {
    const goalsQuery = 'SELECT * FROM goals WHERE process_id = $1 ORDER BY id';
    const goalsResult = await db.query(goalsQuery, [processId]);
    const goals = goalsResult.rows;

    if (goals.length === 0) return res.json([]);

    const goalIds = goals.map((g) => g.id);
    const actionsQuery =
      'SELECT * FROM actions WHERE goal_id = ANY($1::int[]) ORDER BY created_at DESC';
    const actionsResult = await db.query(actionsQuery, [goalIds]);
    const actions = actionsResult.rows;

    const actionIds = actions.map((a) => a.id);
    let allEvidences = [];
    if (actionIds.length > 0) {
      const evidencesQuery = 'SELECT * FROM evidences WHERE action_id = ANY($1::uuid[])';
      const evidencesResult = await db.query(evidencesQuery, [actionIds]);
      allEvidences = evidencesResult.rows;
    }

    const evidencesByAction = allEvidences.reduce((map, ev) => {
      if (!map[ev.action_id]) map[ev.action_id] = [];
      map[ev.action_id].push(ev);
      return map;
    }, {});

    const actionsWithEvidences = actions.map((action) => ({
      ...action,
      evidences: evidencesByAction[action.id] || [],
    }));

    const actionsByGoal = actionsWithEvidences.reduce((map, action) => {
      if (!map[action.goal_id]) map[action.goal_id] = [];
      map[action.goal_id].push(action);
      return map;
    }, {});

    const goalsWithActions = goals.map((goal) => ({
      ...goal,
      actions: actionsByGoal[goal.id] || [],
    }));

    res.json(goalsWithActions);
  } catch (err) {
    console.error('Error en getGoalsByProcess:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date } = req.body;

  try {
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (start_date !== undefined) {
      updates.push(`start_date = $${valueIndex++}`);
      values.push(start_date || null);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${valueIndex++}`);
      values.push(end_date || null);
    }

    if (updates.length === 0) return res.json({ message: 'No hay cambios.' });

    values.push(id);
    const text = `UPDATE goals SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
    const { rows } = await db.query(text, values);

    if (rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada.' });

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar meta:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// --- NUEVA FUNCIÓN: ELIMINAR META ---
const deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Borrar evidencias de las acciones de esta meta
    await db.query(
      `DELETE FROM evidences WHERE action_id IN (SELECT id FROM actions WHERE goal_id = $1)`,
      [id]
    );
    // 2. Borrar acciones
    await db.query('DELETE FROM actions WHERE goal_id = $1', [id]);
    // 3. Borrar la meta
    const result = await db.query('DELETE FROM goals WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json({ message: 'Meta eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar meta' });
  }
};

module.exports = {
  getGoalsForJefe,
  createGoal,
  getGoalsByProcess,
  updateGoal,
  deleteGoal, 
};

-- ============================================================
-- PROYECTO: PLATAFORMA DE GESTIÓN DE PLANES DE ACCIÓN - UCC
-- ARCHIVO: database_schema_seed.sql
-- DESCRIPCIÓN: Estructura completa de la BD y Datos Semilla (Excel)
-- MOTOR: PostgreSQL 14+
-- ============================================================

-- 1. CONFIGURACIÓN INICIAL
SET client_encoding = 'UTF8';

-- (Opcional) Crear la base de datos si se ejecuta desde fuera
-- CREATE DATABASE ucc_db;

-- Habilitar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. ELIMINACIÓN DE ESTRUCTURAS PREVIAS (Limpieza)
-- ============================================================
TRUNCATE TABLE evidences, actions, goals, user_process_assignments, users, action_plans, processes, roles, statuses RESTART IDENTITY CASCADE;

DROP TABLE IF EXISTS evidences;
DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS user_process_assignments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS action_plans;
DROP TABLE IF EXISTS processes;
DROP TABLE IF EXISTS statuses;
DROP TABLE IF EXISTS roles;

-- ============================================================
-- 3. CREACIÓN DE TABLAS (DDL)
-- ============================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
    -- 1: Borrador, 2: Enviado, 3: Aprobado, 4: Rechazado, 5: Bloqueado
);

CREATE TABLE processes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE action_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL UNIQUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_process_assignments (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    process_id INTEGER NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, process_id)
);

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    eje VARCHAR(255),
    sub_eje VARCHAR(255),
    goal_description TEXT NOT NULL,
    indicator TEXT,
    action_plan_id INTEGER NOT NULL REFERENCES action_plans(id),
    process_id INTEGER NOT NULL REFERENCES processes(id),
    start_date DATE,
    end_date DATE
);

CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    rejection_reason TEXT,
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Campos de Gestión del Jefe
    responsible_charge VARCHAR(255),
    activities TEXT,
    budget NUMERIC(12, 2) DEFAULT 0,
    observations_jefe TEXT,
    
    -- Estados de Checkbox (Opcional visual)
    t1_completed BOOLEAN DEFAULT false,
    t2_completed BOOLEAN DEFAULT false,
    t3_completed BOOLEAN DEFAULT false,
    t4_completed BOOLEAN DEFAULT false,

    -- Porcentajes de Ejecución (Admin)
    t1_execution_percent NUMERIC(5,2) DEFAULT 0.00,
    t2_execution_percent NUMERIC(5,2) DEFAULT 0.00,
    t3_execution_percent NUMERIC(5,2) DEFAULT 0.00,
    t4_execution_percent NUMERIC(5,2) DEFAULT 0.00,
    
    -- Avance Automático (Promedio)
    goal_progress_percent NUMERIC(5,2) DEFAULT 0.00,
    
    -- Máquina de Estados Trimestral
    t1_status_id INTEGER DEFAULT 1 REFERENCES statuses(id),
    t2_status_id INTEGER DEFAULT 5 REFERENCES statuses(id),
    t3_status_id INTEGER DEFAULT 5 REFERENCES statuses(id),
    t4_status_id INTEGER DEFAULT 5 REFERENCES statuses(id),
    
    old_status_id INTEGER -- Legacy
);

CREATE TABLE evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_url VARCHAR(255) NOT NULL,
    description TEXT,
    quarter INTEGER NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action_id UUID REFERENCES actions(id) ON DELETE CASCADE
);

-- ============================================================
-- 4. INSERCIÓN DE DATOS SEMILLA (DML)
-- ============================================================

-- A. Catálogos
INSERT INTO roles (id, name) VALUES (1, 'Administrador'), (2, 'Jefe de Proceso');
INSERT INTO statuses (id, name) VALUES (1, 'Borrador'), (2, 'Enviado'), (3, 'Aprobado'), (4, 'Rechazado'), (5, 'Bloqueado');
INSERT INTO action_plans (id, name, year) VALUES (1, 'Plan de Acción 2025', 2025);
INSERT INTO processes (name) VALUES ('Calidad'), ('Bienestar Institucional');

-- B. Usuarios (Hash para '123456')
INSERT INTO users (name, email, password_hash, role_id, is_active) VALUES 
('Administrador Principal', 'admin@ucc.edu.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBO0I.f/wLzTp.', 1, true),
('Analista de Planeación', 'analista.planeacion@ucc.edu.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBO0I.f/wLzTp.', 2, true),
('Analista P&E', 'analista.pye@ucc.edu.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBO0I.f/wLzTp.', 2, true),
('Subdirección DIF', 'analista.pye.dif@ucc.edu.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBO0I.f/wLzTp.', 2, true);

-- C. Metas y Acciones (Lógica Compleja basada en el Excel)
DO $$
DECLARE
    v_proc_calidad INT; v_proc_bienestar INT;
    v_user_plan UUID; v_user_pye UUID; v_user_dif UUID;
    v_goal_id INT;
BEGIN
    -- Obtener IDs dinámicos
    SELECT id INTO v_proc_calidad FROM processes WHERE name = 'Calidad';
    SELECT id INTO v_proc_bienestar FROM processes WHERE name = 'Bienestar Institucional';
    SELECT id INTO v_user_plan FROM users WHERE email = 'analista.planeacion@ucc.edu.co';
    SELECT id INTO v_user_pye FROM users WHERE email = 'analista.pye@ucc.edu.co';
    SELECT id INTO v_user_dif FROM users WHERE email = 'analista.pye.dif@ucc.edu.co';

    -- Asignar procesos a usuarios
    INSERT INTO user_process_assignments (user_id, process_id) VALUES 
    (v_user_plan, v_proc_calidad), (v_user_pye, v_proc_bienestar), (v_user_dif, v_proc_calidad)
    ON CONFLICT DO NOTHING;

    -- --- LÍNEA 1 (Calidad) - T1-T4 Completados (100%) ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Calidad (Aseguramiento)', 'Plan de acción', 'Lograr el monitoreo del 100% de los indicadores asociados al plan de acción.', 'Nº de indicadores actualizados / Total', v_proc_calidad, 1, '2025-01-01', '2025-12-31') RETURNING id INTO v_goal_id;
    
    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, t1_execution_percent, t2_execution_percent, t3_execution_percent, t4_execution_percent, goal_progress_percent)
    VALUES ('Realizar seguimiento integral a las metas e indicadores del plan de acción.', v_goal_id, v_user_plan, 'Analista de planeación', 'Realizar seguimientos trimestrales', 3, 3, 3, 3, 100, 100, 100, 100, 100);

    -- --- LÍNEA 2 (Bienestar) - T2 Completado, Resto Rechazado ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Bienestar Institucional', 'Ingreso, permanencia', '1 estrategia implementada por programa académico.', 'Nº de estrategias implementadas', v_proc_bienestar, 1, '2025-01-01', '2025-12-31') RETURNING id INTO v_goal_id;

    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, t2_execution_percent, goal_progress_percent)
    VALUES ('Suministrar la información necesaria para la caracterización de estudiantes.', v_goal_id, v_user_pye, 'Analista P&E', 'Caracterización estudiantes', 4, 3, 4, 4, 100, 25);

    -- --- LÍNEA 3 (Bienestar) - T2 Completado, Resto Rechazado ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Bienestar Institucional', 'Ingreso y Graduación', 'Lograr 50% participación estudiantil y 80% administrativa.', '% participación', v_proc_bienestar, 1, '2025-01-01', '2025-12-31') RETURNING id INTO v_goal_id;
    
    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, t2_execution_percent, goal_progress_percent)
    VALUES ('Realizar revisión y consolidación información bienestar para SNIES.', v_goal_id, v_user_pye, 'Analista P&E', '', 4, 3, 4, 4, 100, 25);

    -- --- LÍNEA 4 (Calidad) - T1-T2 (50%), T3-T4 (100%) ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Calidad', 'Información Institucional', 'Procesar y consolidar información estadística.', 'Nº informes Power BI.', v_proc_calidad, 1, '2025-02-01', '2025-12-31') RETURNING id INTO v_goal_id;

    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, t1_execution_percent, t2_execution_percent, t3_execution_percent, t4_execution_percent, goal_progress_percent)
    VALUES ('Actualizar la unidad funcional Power BI del campus Montería.', v_goal_id, v_user_plan, 'Analista de planeación', 'Diseño Power BI', 3, 3, 3, 3, 50, 50, 100, 100, 75);

    -- --- LÍNEA 5 (Calidad) - Todo 100% ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Calidad', 'Control Interno', '100% de incidencias halladas gestionadas.', '% incidencias gestionadas', v_proc_calidad, 1, '2025-01-01', '2025-12-31') RETURNING id INTO v_goal_id;
    
    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, t1_execution_percent, t2_execution_percent, t3_execution_percent, t4_execution_percent, goal_progress_percent)
    VALUES ('Garantizar ejecución procedimiento gestión incidencias.', v_goal_id, v_user_dif, 'Analista P&E y DIF', 'Consolidar incidencias', 3, 3, 3, 3, 100, 100, 100, 100, 100);

    -- --- LÍNEA 6 (Calidad) - T1-T3 Rechazado, T4 (0%) ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Calidad', 'Nuevos programas', 'Solicitar registro calificado para 5 programas.', 'Nº programas solicitados', v_proc_calidad, 1, '2025-01-01', '2025-12-31') RETURNING id INTO v_goal_id;
    
    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, goal_progress_percent)
    VALUES ('Aportar información estadística de programas similares.', v_goal_id, v_user_pye, 'Analista P&E', '', 4, 4, 4, 3, 0);

    -- --- LÍNEA 7 (Calidad) - T1-T3 Rechazado, T4 (0%) ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Calidad', 'Riesgos', '100% etapas gestión riesgos desarrolladas.', 'MC: Ejecutar 100% etapas.', v_proc_calidad, 1, '2025-02-01', '2025-11-30') RETURNING id INTO v_goal_id;

    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, goal_progress_percent)
    VALUES ('Desarrollar matriz y procedimiento de gestión de riesgos.', v_goal_id, v_user_plan, 'Analista de planeación', 'Matriz riesgos', 4, 4, 4, 3, 0);

    -- --- LÍNEA 8 (Calidad) - T1-T4 Completado (Varía T2 70%) ---
    INSERT INTO goals (eje, sub_eje, goal_description, indicator, process_id, action_plan_id, start_date, end_date)
    VALUES ('Calidad', 'Procesos', 'Desplegar sistema gestión por procesos.', 'Nº procesos acompañados.', v_proc_calidad, 1, '2025-02-01', '2025-11-30') RETURNING id INTO v_goal_id;

    INSERT INTO actions (description, goal_id, created_by_id, responsible_charge, activities, t1_status_id, t2_status_id, t3_status_id, t4_status_id, t1_execution_percent, t2_execution_percent, t3_execution_percent, t4_execution_percent, goal_progress_percent)
    VALUES ('Realizar socialización, divulgación e implementación.', v_goal_id, v_user_plan, 'Analista de planeación', 'Acompañar estructura por procesos', 3, 3, 3, 3, 100, 70, 100, 100, 92.5);

END $$;
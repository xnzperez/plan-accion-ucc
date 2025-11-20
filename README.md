# Plataforma de Gestión de Planes de Acción - UCC

Sistema web centralizado para la gestión, seguimiento y evaluación de los Planes de Acción del Área de Calidad de la Universidad Cooperativa de Colombia (Sede Montería).

Desarrollado bajo arquitectura **PERN** (PostgreSQL, Express, React, Node.js) con metodología ágil Scrum.

---

## 🚀 Stack Tecnológico

- **Frontend:** React 18 (Vite), React Router, SweetAlert2, Recharts, React Hot Toast.
- **Backend:** Node.js 20+, Express.js.
- **Base de Datos:** PostgreSQL 15+ (Gestionada en la nube).
- **Despliegue:** Seenode (Docker Containers).

---

## 🛠️ Instalación Local (Clonación)

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/xnzperez/plan-accion-ucc.git](https://github.com/xnzperez/plan-accion-ucc.git)
    cd plan-accion-ucc
    ```

2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la carpeta `backend/` con:

    ```env
    PORT=3000
    DB_USER=tu_usuario_postgres
    DB_PASSWORD=tu_contraseña
    DB_HOST=localhost
    DB_NAME=ucc_db
    DB_PORT=5432
    JWT_SECRET=clave_secreta_desarrollo
    ```

3.  **Instalar Dependencias:**

    ```bash
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

4.  **Inicializar Base de Datos:**
    Ejecuta el script `backend/src/db/database_schema_seed.sql` en tu cliente PostgreSQL (pgAdmin) para crear las tablas y usuarios base.

5.  **Ejecutar el proyecto:**
    - **Backend:** `node app.js` (en la carpeta backend).
    - **Frontend:** `npm run dev` (en la carpeta frontend).

---

## 📂 Estructura del Proyecto

```text
plan-accion-ucc/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio (Auth, Goals, Actions...)
│   │   ├── db/            # Conexión a BD y Scripts SQL
│   │   ├── middleware/    # Auth y Roles
│   │   └── routes/        # Definición de endpoints API
│   └── app.js             # Punto de entrada del servidor
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables (Modales, Sidebar...)
│   │   ├── pages/         # Vistas principales (Dashboard, Login...)
│   │   ├── services/      # Conexión Axios con el backend
│   │   └── main.jsx       # Router y Configuración
│   └── index.html
└── README.md
```

## 🚀 Despliegue (Demo en Vivo)

La aplicación se encuentra desplegada y operativa en la nube a través de **Seenode**:

🔗 **URL:** [https://web-vwzvr23lddvd.up-de-fra1-1.apps.run-on-seenode.com/]

## 🔑 Credenciales de Acceso

### Cuenta Administrador

admin@ucc.edu.co

### Cuenta Jefes de Proceso

analista.planeacion@ucc.edu.co
analista.pye@ucc.edu.co
analista.pye.dif@ucc.edu.co

### Contraseña para todas las cuentas:

Password123$

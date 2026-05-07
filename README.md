# 593 Cycling Studio
Sistema de gestion para taller de bicicletas. Permite administrar clientes, bicicletas, mantenimientos, ventas, compras y repuestos desde una interfaz web.

## 📋 Descripción

Proyecto personal desarrollado para aprender React en un caso de uso real. Surgió de una necesidad concreta: el taller manejaba toda su información en papel, lo que hacía difícil rastrear el historial de clientes, el estado de los trabajos y los servicios realizados.

La aplicación permite registrar clientes y sus bicicletas, crear órdenes de trabajo, y llevar un seguimiento del estado de cada servicio, reemplazando los registros físicos por una interfaz digital sencilla y accesible.

---

## 📸 Vista Previa

<div align="center">
  <img src="./public/2_dashboard_finanzas.png" alt="Pantalla Principal" width="80%" />
</div>
<br>
<div align="center">
  <img src="./public/8_mantenimientos.png" alt="Funcionalidad 1" width="45%" />
  &nbsp;&nbsp;
  <img src="./public/11_finanzas.png" alt="Funcionalidad 2" width="45%" />
</div>

--- 
## Features
- **Clientes** Registro, búsqueda y gestión completa de clientes
- **Bicicletas** Inventario de bicicletas, registro, búsqueda y gestión completa de bicicletas
- **Mantenimientos** Registro, búsqueda y gestión completa de mantenimientos
- **Repuestos** Inventario de repuestos, registro, búsqueda y gestión completa de repuestos
- **Finanzas** Registro, búsqueda y gestión completa de finanzas
- **Dashboard** Dashboard con métricas y gráficos
- Actualizaciones optimas en UI
- Diseño responsive

---
## ✨ Funcionalidades

- 📊 Dashboard con estadísticas y gráficas en tiempo real
- 📱 Diseño 100% responsive (mobile first)
- 🔍 Búsqueda y filtros avanzados



## 🛠️ Tecnologías

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

### Base de Datos

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) 

### Deploy

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)

---

## 🚀 Cómo correrlo localmente

### Prerequisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/nombre-proyecto.git
cd nombre-proyecto

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 4. Correr migraciones
npm run db:migrate

# 5. Iniciar en desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# App
PORT=3000
NODE_ENV=development

# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_db

# Auth
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# (Opcional) Redis
REDIS_URL=redis://localhost:6379
```

---

## 📁 Estructura del Proyecto

```
nombre-proyecto/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas / rutas
│   ├── hooks/          # Custom hooks
│   ├── services/       # Llamadas a la API
│   ├── store/          # Estado global
│   └── utils/          # Helpers y utilidades
├── public/
├── screenshots/        # Imágenes para el README
├── .env.example
└── README.md
```

---

## 🔗 Links

[![Demo en Vivo](https://img.shields.io/badge/%F0%9F%8C%90_Demo_en_Vivo-Ver_App-brightgreen?style=for-the-badge)](https://crm-taller-presentacion.netlify.app/dashboard) [![Documentación](https://img.shields.io/badge/%F0%9F%93%84_Docs-Ver_Docs-blue?style=for-the-badge)]([https://github.com/Raul-593/taller-web](https://github.com/Raul-593/mock_data))

---

## 📬 Contacto

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/Raul-593) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/raul-viteri-b4a9052aa/)

---

<div align="center"> <sub>Hecho por <a href="https://github.com/tu-usuario">Raul-593</a></sub> </div>



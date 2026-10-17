# 📘 Documentación Técnica del Sistema Conexión DK
### Sistema de Control de Declaraciones de Importación, Facturación y Códigos QR

---

## 1. 📌 Resumen Ejecutivo y Propósito

**Conexión DK** es una plataforma integral desarrollada para gestionar, auditar y consultar declaraciones de importación y facturas comerciales (tanto nacionales como de importación).

### Objetivos Clave:
- **Centralización**: Registro de declaraciones, facturas, proveedores, observaciones y adjuntos PDF/imágenes.
- **Trazabilidad Total**: Registro de autoría (quién creó y quién modificó cada registro) y fecha/hora exacta en horario de Colombia (`America/Bogota`).
- **Control Multi-Compañía (Multi-Tenant)**: Aislamiento estricto de datos entre empresas (ej. *Pruebas*, *SI R&R*). Cada compañía únicamente visualiza y administra sus propios registros y usuarios.
- **Códigos QR de Alta Eficiencia**: Generación e impresión de etiquetas con código QR para pegar en mercancía física.
- **Consulta Pública Rápida**: Cualquier transportador, auditor o bodeguero que escanee el código QR físico accede al detalle de la declaración y al documento PDF adjunto **sin necesidad de iniciar sesión**.
- **Adaptabilidad Móvil**: Interfaz optimizada para teléfonos móviles y tablets (vista de tarjetas, cuadrícula táctil y búsqueda rápida).

---

## 2. 🏛️ Arquitectura Tecnológica

El sistema es un **Monorepo** dividido en dos partes principales:

```
Control_Facturacion_Citymerk/
│
├── api/                  # Backend Node.js + Express + TypeScript + Mongoose
├── web/                  # Frontend React + TypeScript + Vite + Material UI
├── package.json          # Orquestador del monorepo (scripts concurrentes)
└── DOCUMENTACION_SISTEMA.md
```

### Stack Técnico:
| Componente | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Material UI (MUI), Lucide/MUI Icons | SPA con React Router DOM v7 |
| **Backend** | Node.js, Express, TypeScript, Mongoose, JWT, Bcrypt | API RESTful modular |
| **Base de Datos** | MongoDB Community Server (v7.0) | Colecciones indexadas |
| **Generación QR / PDF**| QRCode.js, jsPDF, html2canvas, JSZip | Descarga individual y masiva |
| **Servidor Producción** | Ubuntu VPS (Hostinger), Nginx, PM2, Certbot SSL | `https://dk-conexiones.cloud` |

---

## 3. 📂 Estructura Detallada del Código

### 3.1 Backend (`api/`)

```
api/
├── .env                              # Configuración (MONGO_URI, JWT_SECRET, PORT)
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts                     # Punto de entrada de Express y conexión MongoDB
    ├── controller/                   # Lógica de controladores para declaraciones
    │   ├── createDeclaracion.controller.ts
    │   ├── bulkCreateDeclaracion.controller.ts
    │   ├── findAllDeclaracion.controller.ts
    │   ├── findOneDeclaracion.controller.ts
    │   ├── updateDeclaracion.controller.ts
    │   └── deleteDeclaracion.controller.ts
    ├── middlewares/
    │   └── authMiddleware.ts         # verifyToken y validación de roles (isAdmin)
    ├── models/
    │   ├── company.models.ts         # Esquema de Compañías
    │   ├── user.models.ts            # Esquema de Usuarios (asociados a Company)
    │   ├── roles.models.ts           # Roles (ADMINISTRADOR, USUARIO)
    │   └── declaraciones.models.ts   # Esquema central de Declaraciones y Facturas
    ├── routes/
    │   ├── auth.routes.ts            # /auth/login, /auth/users, /auth/roles
    │   └── declaraciones.routes.ts   # /declaraciones (CRUD + /bulk)
    ├── services/
    │   └── auth.services.ts          # Semillero inicial de compañías, roles y usuarios
    └── types/                        # Definiciones TypeScript compartidas
```

### 3.2 Frontend (`web/`)

```
web/
├── .env                              # VITE_API_URL=/api_backend
├── vite.config.ts                    # Proxy local y base: '/controlfacturas/'
├── package.json
└── src/
    ├── App.tsx                       # Enrutador principal y ProtectedRoute
    ├── main.tsx                      # Montaje de React DOM
    ├── components/
    │   └── ProtectedRoute.tsx        # Guardián de rutas autenticadas
    ├── header/
    │   ├── Heder.tsx                 # Barra superior con logo DK, usuario, empresa y logout
    │   └── Heder.css                 # Estilos y media queries responsivas
    ├── home/
    │   └── Home.tsx                  # Contenedor de la vista principal autenticada
    ├── login/
    │   └── Login.tsx                 # Pantalla de autenticación y guardado de sesión en localStorage
    ├── modales/
    │   ├── ConsultarRegistroModal.tsx# Visor público de escaneo QR y detalle completo
    │   ├── EditarRegistroModal.tsx   # Edición de registro existente
    │   ├── ImportarModal.tsx         # Importación masiva desde archivo Excel
    │   ├── NuevoRegistroModal.tsx    # Formulario de alta con subida de PDF
    │   └── QRModal.tsx               # Impresión y exportación masiva de etiquetas QR
    ├── newUser/
    │   └── NewUserModal.tsx          # Gestión y creación de usuarios por el Admin
    ├── tables/
    │   └── TableDeclaraciones.tsx    # Tabla interactiva, vista tarjetas móvil, buscador y filtros
    └── utils/
        ├── dateUtils.ts              # Formateo de fechas a zona horaria Colombia
        ├── excelUtils.ts             # Exportación personalizada a hojas Excel
        └── qrUtils.ts                # Renderizado e impresión de códigos QR
```

---

## 4. 🗄️ Modelos de Datos Clave (MongoDB)

### 4.1 Declaraciones (`IDeclaraciones`)
```typescript
{
  importadoNacional: string;      // 'I' para Importación, 'N' para Nacional
  numeroDeclaracion: string;      // Número oficial de la declaración o radicado
  datosDeclaracion: string;       // Descripción de la mercancía / datos adicionales
  pdfDeclaracion?: string;        // Base64 o URI del archivo adjunto
  archivoDeclaracion?: string;    // Nombre original del archivo
  factura: string;                // Número o código de factura
  nitProveedor: string;           // NIT o Tax ID del proveedor
  proveedor: string;              // Razón social del proveedor
  pais?: string;                  // País de origen / procedencia
  numeroFactura?: string;         // Número específico de factura
  pdfFactura?: string;            // Adjunto de factura comercial
  archivoFactura?: string;
  observaciones?: string;
  company?: ObjectId;             // ID de la compañía dueña del registro (Multi-tenant)
  companyName?: string;           // Nombre visible de la compañía
  createdBy?: ObjectId;           // Usuario que realizó el registro
  createdByName?: string;         // Nombre del creador
  updatedBy?: ObjectId;           // Último usuario en modificar
  updatedByName?: string;         // Nombre del editor
  createdAt: Date;                // UTC en BD (Se muestra en GMT-5)
  updatedAt: Date;                // UTC en BD (Se muestra en GMT-5)
}
```

### 4.2 Compañías (`ICompany`)
```typescript
{
  name: string;                   // 'Pruebas', 'SI R&R', etc.
  activo: boolean;                // Estado de activación
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 Usuarios (`IUser`)
```typescript
{
  username: string;               // Único en el sistema
  password: string;               // Hash Bcrypt
  role: ObjectId;                 // Ref a Roles (ADMINISTRADOR o USUARIO)
  company: ObjectId;              // Ref a Company (Aislamiento de datos)
  activo: boolean;
}
```

---

## 5. 🌐 Rutas de la API y Seguridad

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Público | Autentica y entrega token JWT + datos de compañía |
| `GET` | `/auth/users` | Token (Admin) | Lista usuarios de la misma compañía del admin |
| `POST` | `/auth/users` | Token (Admin) | Crea un nuevo usuario asociado a la compañía del admin |
| `GET` | `/declaraciones` | Token | Lista declaraciones pertenecientes a la compañía del usuario |
| `POST` | `/declaraciones` | Token | Crea una declaración asociando `company`, `createdBy` y hora local |
| `POST` | `/declaraciones/bulk` | Token | Creación masiva vía importación de Excel |
| `GET` | `/declaraciones/:id` | **Público** | **Consulta pública para escaneo de código QR sin login** |
| `PUT` | `/declaraciones/:id` | Token | Actualiza registro y guarda `updatedBy` y `updatedAt` |
| `DELETE` | `/declaraciones/:id` | Token | Elimina la declaración indicada |

---

## 6. 🚀 Entorno de Producción y Despliegue (VPS)

### 6.1 Datos del Servidor
- **Proveedor:** Hostinger KVM 1 (Ubuntu 22.04/24.04 LTS)
- **IP del Servidor:** `179.236.66.110`
- **Dominio Público:** `https://dk-conexiones.cloud`
- **Ruta de la Aplicación en Servidor:** `/var/www/control_declaraciones/`
- **Ruta Raíz Web en Nginx:** `/var/www/control_declaraciones/web/public_html`

### 6.2 Arquitectura Nginx (Reverse Proxy)
El archivo `/etc/nginx/sites-available/default` está configurado con:
- `location = /`: Redirige `301` hacia `/controlfacturas/`.
- `location /controlfacturas`: Sirve la SPA de React con soporte para React Router (`try_files $uri $uri/ /controlfacturas/index.html;`).
- `location /api_backend/`: Redirige hacia `http://127.0.0.1:5000/` con cabeceras `Host`, `X-Real-IP` y `X-Forwarded-For`.
- **SSL:** Gestionado por Certbot Let's Encrypt (renovación automática en segundo plano).

### 6.3 Proceso Backend con PM2
El backend se ejecuta de manera permanente en el servidor mediante PM2:
- **Nombre del servicio:** `control-api`
- **Puerto interno:** `5000`

---

## 7. ⚡ Procedimiento para Realizar Cambios y Desplegarlos

### Paso 1: Realizar y Probar Cambios en Local
1. Modifica los archivos en tu editor local.
2. Comprueba que el frontend compila sin errores:
   ```powershell
   npm --prefix web run build
   ```
3. Si hiciste cambios en el backend, valida la compilación:
   ```powershell
   npm --prefix api run build
   ```

### Paso 2: Subir Cambios a GitHub
```powershell
git add .
git commit -m "feat/fix: descripcion clara de los cambios realizados"
git push origin main
```

### Paso 3: Aplicar Cambios en el Servidor VPS
Conéctate por SSH a la terminal de tu servidor VPS y ejecuta un único comando:
```bash
actualizar
```
*(Si estás en otra ruta o script directo, puedes ejecutar `/root/actualizar.sh`)*

#### ¿Qué hace automáticamente el script `actualizar`?
1. Realiza `git pull origin main`.
2. Compila el backend TypeScript con `npm --prefix api run build`.
3. Compila el frontend Vite con `npm --prefix web run build`.
4. Garantiza que el enlace de `public_html/controlfacturas` apunte a `dist`.
5. Reinicia el proceso de PM2 (`pm2 restart control-api`).
6. Reinicia Nginx (`systemctl restart nginx`).

---

## 8. 💻 Entorno de Desarrollo Local

### Iniciar la Aplicación en Local:
En la raíz del proyecto ejecuta:
```powershell
npm run dev
```
Esto lanzará concurrentemente:
- Backend en `http://localhost:5000`
- Frontend en `http://localhost:5173/controlfacturas/`

### Scripts de Acceso Rápido en Windows (`web/`):
- `INICIAR_SISTEMA.BAT`: Libera puertos bloqueados (5000 y 5173), inicia los servicios y abre el navegador.
- `INICIAR.vbs`: Ejecuta el sistema de forma oculta en segundo plano sin dejar consolas CMD visibles.
- `DETENER_SISTEMA.bat`: Finaliza los procesos de Node.js liberando los puertos inmediatamente.

---

## 9. ⚠️ Reglas Críticas para Futuros Desarrolladores / Agentes IA

> [!IMPORTANT]
> Al realizar modificaciones en este repositorio, **deben respetarse estrictamente las siguientes directrices** para evitar regresiones o caídas en producción:

1. **Aislamiento Multi-Tenant Obligatorio**:
   - Todo endpoint de consulta, creación o modificación de declaraciones o usuarios **debe validar el `companyId`** extraído del token JWT del usuario solicitante. Nunca permitir que una compañía acceda a los datos de otra.
2. **Acceso Público a la Ruta QR**:
   - El endpoint `GET /declaraciones/:id` y las rutas frontend `/consulta/:id` y `/home/detalle/:id` **deben permanecer públicas**. Si se protegen con autenticación, las etiquetas físicas con código QR dejarán de funcionar para transportadores o auditores.
3. **Manejo de Zona Horaria (Colombia GMT-5)**:
   - En la base de datos MongoDB, los campos `createdAt` y `updatedAt` se guardan en estándar UTC.
   - En el frontend y en la impresión de etiquetas, siempre formatear usando `timeZone: 'America/Bogota'`. Nunca restar 5 horas manualmente en código si la base de datos o el navegador ya aplican el desfase.
4. **Base URL de Vite**:
   - La aplicación web corre bajo el prefijo `/controlfacturas/`. Todo enlace interno de React Router debe respetar `<Router basename="/controlfacturas">` y `vite.config.ts` con `base: '/controlfacturas/'`.
5. **No Crear Enlaces Simbólicos dentro de `dist/`**:
   - `npm run build` de Vite elimina por completo el directorio `web/dist/` antes de recompilar. La carpeta que sirve Nginx en el VPS debe ser siempre `/var/www/control_declaraciones/web/public_html` con un symlink apuntando a `dist`, nunca al revés.
6. **Diseño Responsivo en Celulares**:
   - Mantener la vista de **Tarjetas móviles (`Card View`)** como vista preferente en pantallas con ancho menor a 768px para evitar que la tabla de 12 columnas se comprima.
7. **Registro Obligatorio en la Bitácora de Cambios**:
   - Cada modificación, adición o ajuste de código debe documentarse en **[HISTORIAL_CAMBIOS.md](./HISTORIAL_CAMBIOS.md)** indicando el motivo, archivos tocados y precauciones para no alterar procesos previos.

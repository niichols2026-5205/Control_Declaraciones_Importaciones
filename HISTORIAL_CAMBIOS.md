# 📜 Historial de Cambios y Bitácora de Versiones (CHANGELOG)
### Sistema Conexión DK | Control de Declaraciones e Importaciones

Este documento registra cronológicamente cada cambio, ajuste, mejora o corrección realizado en el sistema.  
**Regla de oro:** Todo nuevo ajuste debe documentarse aquí para garantizar que no se afecten procesos existentes ni se rompa la retrocompatibilidad.

---

## 📌 Guía de Registro para Desarrolladores y Agentes IA
Al realizar cualquier cambio futuro, agrega una nueva entrada al inicio de este archivo con el siguiente formato:
```markdown
### [AAAA-MM-DD] - Nombre corto del cambio
- **Tipo:** [Feature / Corrección / Refactor / Infraestructura / Seguridad]
- **Motivo / Necesidad:** ¿Por qué se realizó el cambio?
- **Archivos Modificados:** Lista de archivos tocados.
- **Detalle de la Solución:** Explicación técnica de lo que se hizo.
- **Impacto y Prevención:** Qué procesos anteriores deben verificarse para evitar regresiones.
```

---

## 🕒 Registro Cronológico de Cambios

### [2026-11-13] - Protección de Administradores Iniciales, Renombre a "Distribuidores" y Directorio de Compañías
- **Tipo:** Seguridad / UX / Multi-Tenant
- **Motivo / Necesidad:**
  1. Proteger al usuario administrador que da origen a la compañía para que no pueda ser editado ni inactivado, evitando que cambie su nombre o genere colisiones con otras empresas; permitiendo editar únicamente a los usuarios creados a partir del segundo.
  2. Renombrar la compañía `Pruebas` a `Distribuidores` y migrar sus declaraciones asociadas.
  3. Agregar un botón e interfaz en `Distribuidores` para consultar la tabla de **Compañías y Usuarios Administradores del Sistema** en modo 100% solo lectura (sin opciones de crear, editar, inactivar ni eliminar).
- **Archivos Modificados:**
  - `api/src/services/auth.services.ts` (Renombre de empresa `Distribuidores`, migración de declaraciones, bloqueo de edición e inactivación para administradores iniciales `isRootAdmin`, y servicio `getSystemAdministrators`)
  - `api/src/routes/auth.routes.ts` (Nueva ruta `GET /auth/system-administrators` protegida con token y rol admin)
  - `web/src/newUser/GestionUsuariosModal.tsx` (Insignia `Admin Inicial (Protegido)`, bloqueo de botones Editar e Inactivar para administradores principales, permitiendo gestión a partir del segundo usuario)
  - `web/src/modales/CompaniaAdminsModal.tsx` (Nuevo componente modal de solo lectura con tabla consolidada de empresas, administradores, roles, estados y fechas)
  - `web/src/header/Heder.tsx` (Botón "Compañías y Admins" en la barra superior para usuarios de la empresa `Distribuidores`)
  - `web/src/tables/TableDeclaraciones.tsx` (Botón "Compañías y Admins" en la barra de herramientas de la tabla para `Distribuidores`)
  - `AGENTS.md` y `DOCUMENTACION_SISTEMA.md` (Actualización de nombres y reglas del sistema)
- **Impacto y Prevención:** El usuario administrador de cada compañía queda blindado tanto a nivel visual como en el backend. Los usuarios adicionales siguen gozando de edición completa. La vista de compañías y administradores es estrictamente de lectura. Se preserva el aislamiento multi-tenant en todas las rutas y vistas.

---

### [2026-11-13] - Alta de Compañía "AMERICA TRADING COMPANY SAS" y Administrador "ATCadmin"
- **Tipo:** Configuración / Multi-Tenant / Autenticación
- **Motivo / Necesidad:** El cliente requería habilitar una nueva compañía en el sistema (`AMERICA TRADING COMPANY SAS`) con su respectivo usuario administrador inicial (`ATCadmin` / `admin123`), manteniendo el estricto aislamiento multi-tenant frente a las empresas existentes (`SI R&R` y `Pruebas`).
- **Archivos Modificados:**
  - `api/src/services/auth.services.ts`
  - `DOCUMENTACION_SISTEMA.md`
- **Detalle de la Solución:**
  1. Se configuró en `ensureDefaultRoles` la creación y verificación automática de la compañía `AMERICA TRADING COMPANY SAS` y su usuario administrador `ATCadmin` con clave `admin123`, rol `admin` y estado activo.
  2. Se aseguró la idempotencia del semillero, evitando re-hasheos y escrituras innecesarias en MongoDB si las credenciales ya coinciden.
  3. Se reforzó `loginUser` con ordenamiento preferencial por compañía (`sort({ company: -1 })`) y limpieza de registros legacy para evitar colisiones entre cuentas con el mismo identificador.
- **Impacto y Prevención:** El usuario `ATCadmin` queda totalmente aislado bajo su propio `companyId`. Solo podrá visualizar, crear, editar o importar declaraciones de `AMERICA TRADING COMPANY SAS`, y los usuarios que cree quedarán vinculados exclusivamente a dicha empresa. Se verificó que los accesos de `admin` (`SI R&R`) y `PRUEBAS` (`Pruebas`) continúen operando al 100%.

---

### [2026-11-11] - Reemplazo de Alertas Nativas por Diálogos Modernos y Notificaciones Toast
- **Tipo:** Mejora de UX / UI
- **Motivo / Necesidad:** Reemplazar las alertas nativas del navegador (`window.confirm` y `window.alert`), que se veían anticuadas y toscas, por modales de confirmación con diseño moderno y mensajes flotantes (Toast) integrados al sistema de diseño Material-UI.
- **Archivos Modificados:**
  - `web/src/tables/TableDeclaraciones.tsx`
- **Detalle de la Solución:**
  1. Se implementó un modal de confirmación con `<Dialog>` estilizado (bordes redondeados `20px`, ícono de advertencia/acción circular con contraste de color, tipografía cuidada y botones de acción primario/peligro).
  2. Se reemplazó el `window.confirm` de inactivación y reactivación de QR (individual y múltiple) y de eliminación de declaraciones.
  3. Se implementó `<Snackbar>` con `<Alert variant="filled">` para mostrar notificaciones toast de éxito, advertencia o error en lugar de `alert()` nativo.
- **Impacto y Prevención:** Mejora notable en la estética visual y experiencia del usuario; no altera la lógica de negocio ni la comunicación con la API.

---

### [2026-11-11] - Inactivación y Reactivación de Códigos QR (Entrega / Fin de Transporte)
- **Tipo:** Feature / Seguridad y Trazabilidad Operativa
- **Motivo / Necesidad:** El cliente requería poder inactivar los códigos QR cuando la mercancía ya fue transportada o entregada, para que al escanear el QR físico no siga disponible públicamente, con opción de inactivar en bloque o de forma individual, y poder reactivarlo si es necesario.
- **Archivos Modificados:**
  - `api/src/models/declaraciones.models.ts` (Nuevos campos `qrActivo`, `fechaInactivacion`, `inactivadoPor`)
  - `api/src/services/declaraciones.services.ts` (Método `toggleQrStatus` con filtro multi-tenant)
  - `api/src/controller/toggleQrDeclaracion.controller.ts` (Nuevo controlador)
  - `api/src/controller/findOneDeclaracion.controller.ts` (Oculta adjuntos confidenciales cuando `qrActivo === false`)
  - `api/src/routes/declaraciones.routes.ts` (Rutas `PATCH /toggle-qr` y `POST /toggle-qr`)
  - `web/src/types/types.ts` (Actualización de interfaz `Declaracion`)
  - `web/src/modales/ConsultarRegistroModal.tsx` (Pantalla de bloqueo para escaneos públicos de QR inactivo con mensaje `🔒 CÓDIGO QR FINALIZADO - La consulta pública de esta mercancía ya no se encuentra disponible`, y visor con opción de reactivar para usuarios autenticados)
  - `web/src/tables/TableDeclaraciones.tsx` (Columna `Estado QR` con Chip Activo/Inactivo, barra contextual de acciones en bloque `🔒 Inactivar QRs (X)` y `🔓 Reactivar QRs (X)`, botón de toggle en fila y tarjeta móvil, y soporte en exportación Excel)
- **Impacto y Prevención:** La ruta de consulta sigue siendo pública sin token (`GET /declaraciones/:id`), pero si el registro tiene `qrActivo === false`, el frontend bloquea la consulta y el backend no envía los PDFs. Se mantiene 100% el aislamiento multi-tenant por `companyId`.

---

### [2026-10-17] - Indicador de Carga (Loading Spinner) y Control de Estado Vacío
- **Tipo:** Mejora de UX / Feedback Visual
- **Motivo / Necesidad:** Al cargar o consultar la vista principal, la tabla mostraba prematuramente el mensaje "No se encontraron registros" y el badge "0 registros" mientras la petición GET a `/declaraciones` estaba en curso, generando un parpadeo visual molesto antes de mostrar los datos reales.
- **Archivos Modificados:**
  - `web/src/tables/TableDeclaraciones.tsx`
- **Detalle de la Solución:**
  1. Se agregó el estado `loading = true` inicial y manejo mediante `try / finally` en `fetchDeclaraciones()`.
  2. En el encabezado, el badge muestra `"Cargando..."` mientras la petición está en curso.
  3. En la tabla (y en la vista móvil de tarjetas), mientras `loading` sea `true`, se muestra un `CircularProgress` azul con el texto `"Cargando declaraciones..."`.
  4. Solo cuando la petición finaliza y efectivamente no hay registros (`!loading && filteredRows.length === 0`), se muestra `"No se encontraron registros"`.
- **Impacto y Prevención:** Mejora la experiencia de usuario y evita falsos avisos de "sin registros". No afecta la estructura de datos ni las llamadas al backend.

---

### [2026-10-17] - Creación de Documentación Integral y Bitácora de Auditoría
- **Tipo:** Documentación / Directrices de Desarrollo
- **Motivo / Necesidad:** Disponer de todo el contexto de arquitectura, modelos, rutas, despliegue y reglas críticas en un único lugar para responder de forma rápida, precisa y sin afectar procesos previos en futuras modificaciones.
- **Archivos Modificados:**
  - `DOCUMENTACION_SISTEMA.md` (Creado)
  - `README.md` (Actualizado con accesos directos y comandos)
  - `AGENTS.md` (Creado para inyección automática de contexto en asistentes IA)
  - `HISTORIAL_CAMBIOS.md` (Creado)
- **Impacto y Prevención:** Cualquier persona o asistente IA que trabaje en el código debe consultar primero estos archivos antes de alterar modelos o rutas.

---

### [2026-10-08] - Optimización de Interfaz Móvil y Vista de Tarjetas (Home Celulares)
- **Tipo:** Feature / UX Responsiva
- **Motivo / Necesidad:** La pantalla principal se visualizaba estrecha en teléfonos móviles. Los 4 botones de acción ocupaban demasiado espacio vertical y la tabla de 12 columnas tenía la columna "ACCIONES" fija a la derecha bloqueando la visibilidad del resto de columnas.
- **Archivos Modificados:**
  - `web/src/tables/TableDeclaraciones.tsx`
  - `web/src/header/Heder.css`
- **Detalle de la Solución:**
  1. Organización de los 4 botones principales en una **cuadrícula compacta de 2x2** en móviles.
  2. Implementación de una barra de **búsqueda rápida global** para filtrar al instante por cualquier campo.
  3. Creación de una **Vista de Tarjetas Móviles (`Card View`)** nativa que se activa automáticamente en celulares (< 768px). Cada tarjeta muestra todos los datos con botones táctiles grandes: Ver, QR, Editar y Borrar.
  4. Selector de modo (Tarjetas ↔ Tabla).
  5. En modo tabla en celulares, la columna de acciones se cambió a `position: static` para que no tape los demás datos al hacer scroll horizontal.
- **Impacto y Prevención:** Se verificó que en pantallas de escritorio (PC) la tabla siga viéndose en su formato original completo sin alteraciones.

---

### [2026-10-08] - Corrección de Enlaces Simbólicos y Despliegue en Nginx (Hostinger VPS)
- **Tipo:** Infraestructura / Servidor
- **Motivo / Necesidad:** Al compilar Vite con `npm run build` en el servidor, Vite borra la carpeta `web/dist/` por completo, destruyendo enlaces simbólicos anteriores y generando errores 500/404 en Nginx.
- **Archivos Modificados:**
  - `/etc/nginx/sites-available/default` (Servidor VPS)
  - `/root/actualizar.sh` y comando `/usr/local/bin/actualizar`
- **Detalle de la Solución:**
  - Se creó el directorio web público permanente en `/var/www/control_declaraciones/web/public_html/controlfacturas` apuntando a `dist`.
  - Nginx se configuró para servir desde `public_html` con fallback `try_files $uri $uri/ /controlfacturas/index.html;`.
  - El script `actualizar` recrea y asegura la ruta después de cada compilación.
- **Impacto y Prevención:** Las futuras compilaciones de Vite nunca más tumbarán la aplicación web.

---

### [2026-10-08] - Cambio de Identidad y Marca a "Conexión DK"
- **Tipo:** Branding / UI
- **Motivo / Necesidad:** Reemplazar el nombre temporal previo ("SkyFlash" / "Citymerk") por la marca definitiva del producto.
- **Archivos Modificados:**
  - `web/index.html` (Título de pestaña del navegador)
  - `web/src/header/Heder.tsx` y `Heder.css` (Logo badge `DK`, título Conexión DK y badge de empresa)
  - `web/src/login/Login.tsx` (Pantalla de login)
  - `web/src/modales/ConsultarRegistroModal.tsx` (Encabezado de consulta de QR)
  - `web/src/tables/TableDeclaraciones.tsx` (Exportación a Excel y títulos)
- **Impacto y Prevención:** El cambio fue 100% cosmético y de presentación, sin alterar IDs ni nombres de colecciones en base de datos.

---

### [2026-10-08] - Implementación de Aislamiento Multi-Compañía (Multi-Tenant) y Trazabilidad
- **Tipo:** Arquitectura / Seguridad / Base de Datos
- **Motivo / Necesidad:** Permitir el uso del sistema por parte de diferentes empresas clientes (*Pruebas*, *SI R&R*, etc.) garantizando aislamiento total: una compañía nunca debe ver ni modificar declaraciones ni usuarios de otra.
- **Archivos Modificados:**
  - `api/src/models/company.models.ts` (Nuevo modelo)
  - `api/src/models/user.models.ts` (Asociación con `company`)
  - `api/src/models/declaraciones.models.ts` (Asociación con `company`, `companyName`, `createdBy`, `createdByName`, `updatedBy`, `updatedByName`)
  - `api/src/services/auth.services.ts` (Semillero de compañías y usuarios admin `PRUEBAS` / `PRUEBAS` y `admin` / `admin123`)
  - `api/src/middlewares/authMiddleware.ts` (Inyección de `companyId` y `userId` en la petición)
  - `api/src/controller/*.ts` (Filtros en `find`, `create`, `update`, `delete` por `companyId`)
  - `web/src/login/Login.tsx` (Almacenamiento de `companyName` y `companyId` en `localStorage`)
  - `web/src/modales/ConsultarRegistroModal.tsx` (Visualización de compañía y autoría de edición)
- **Impacto y Prevención:** **REGLA ESTRICTA:** Todo nuevo endpoint o consulta en el backend DEBE incluir `{ company: companyId }` para no romper la segregación de clientes.

---

### [2026-10-08] - Corrección de Zona Horaria (Colombia GMT-5)
- **Tipo:** Corrección / Datos
- **Motivo / Necesidad:** Las declaraciones creadas en horario de Colombia (ej. 16:00) aparecían al escanear el QR como creadas a las 11:10 (se estaban restando 5 horas dos veces).
- **Archivos Modificados:**
  - `web/src/tables/TableDeclaraciones.tsx`
  - `web/src/modales/ConsultarRegistroModal.tsx`
  - `web/src/utils/qrUtils.ts`
- **Detalle de la Solución:**
  - Se eliminó la resta manual de milisegundos en el código.
  - Se adoptó el almacenamiento nativo UTC en MongoDB y el formateo estándar mediante `Intl.DateTimeFormat` / `toLocaleString('es-CO', { timeZone: 'America/Bogota' })`.
- **Impacto y Prevención:** Nunca restar horas manualmente; siempre delegar el cálculo de huso horario a la configuración `America/Bogota`.

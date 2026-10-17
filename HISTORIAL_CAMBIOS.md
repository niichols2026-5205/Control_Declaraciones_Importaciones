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

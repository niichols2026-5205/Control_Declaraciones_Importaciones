# Contexto y Directrices de Desarrollo - Conexión DK

Este archivo es leído automáticamente por el asistente de IA al inicio de cada conversación en este repositorio.

## 📌 Documento de Referencia Principal
Antes de proponer o ejecutar cambios en la arquitectura, base de datos, rutas o diseño, consulta siempre:
👉 **[DOCUMENTACION_SISTEMA.md](./DOCUMENTACION_SISTEMA.md)**

## ⚡ Reglas Esenciales del Proyecto

1. **Aislamiento Multi-Compañía (Multi-Tenant)**:
   - Toda consulta (`find`), creación (`create`) o actualización (`update`) en el backend debe estar filtrada por el `companyId` del usuario autenticado.
   - Las empresas (ej. *Pruebas*, *SI R&R*) nunca deben ver datos cruzados.

2. **Ruta Pública de Consulta QR**:
   - `GET /declaraciones/:id` en el backend y las rutas `/consulta/:id` y `/home/detalle/:id` en el frontend **deben ser siempre públicas (sin token)** para permitir el escaneo de etiquetas QR físicas sin requerir login.

3. **Zona Horaria de Colombia**:
   - Las fechas en MongoDB se almacenan en formato UTC.
   - Todo formateo para visualización en pantalla o etiquetas debe realizarse con la zona horaria `America/Bogota` (GMT-5).

4. **Enrutamiento Web y Base URL**:
   - El frontend corre en la subruta `/controlfacturas/`. Todo router y recurso estático debe respetar esa base.
   - En Nginx el backend está en `/api_backend/` y el frontend en `/controlfacturas/`.

5. **Flujo de Despliegue en el Servidor (VPS)**:
   - Cambios subidos a `main` se despliegan en el VPS ejecutando el comando: `actualizar` (o `/root/actualizar.sh`).

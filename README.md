# Conexión DK | Control de Declaraciones e Importaciones

Plataforma integral para el control, trazabilidad, generación de etiquetas QR y consulta de declaraciones de importación y facturas nacionales e internacionales.

---

## 📖 Documentación Completa del Sistema

Toda la documentación técnica detallada de arquitectura, modelos de base de datos, endpoints de API, infraestructura VPS, reglas multi-compañía y comandos de despliegue se encuentra disponible en:

👉 **[DOCUMENTACION_SISTEMA.md](./DOCUMENTACION_SISTEMA.md)**  
📜 **[HISTORIAL_CAMBIOS.md](./HISTORIAL_CAMBIOS.md)** *(Bitácora de cambios y versiones)*

---

## ⚡ Comandos Rápidos

### Desarrollo Local
```bash
# Iniciar frontend y backend concurrentemente
npm run dev

# Compilar backend
npm run build:api

# Compilar frontend
npm run build:web
```

### URLs del Sistema
- **Local:** `http://localhost:5173/controlfacturas/` (API en `http://localhost:5000`)
- **Producción:** `https://dk-conexiones.cloud/controlfacturas/`

### Despliegue en Producción (VPS)
En la consola SSH de tu servidor VPS ejecuta:
```bash
actualizar
```
*(o `/root/actualizar.sh`)*

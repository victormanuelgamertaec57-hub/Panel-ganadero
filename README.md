# GanApp — Control Ganadero Inteligente

Dashboard comercial para gestión de ventas de ganado. Registra ventas individuales y lotes completos, visualiza KPIs, genera reportes PDF y sincroniza datos con Google Sheets.

## Funcionalidades

- **Ventas individuales** — registro por animal con modalidad kg/cabeza, razón de venta y destino del dinero
- **Lotes de venta** — múltiples categorías de animales, gastos operativos y distribución de pagos
- **Dashboard** — KPIs con sparklines, gráficas de barras/torta, resumen financiero
- **Reportes PDF** — captura del reporte filtrado por fecha exportado como PDF
- **Google Sheets** — sincronización automática como respaldo (opcional)
- **Almacenamiento local** — todos los datos viven en `localStorage`, sin servidor

---

## Instalación

```bash
npm install
cp .env.example .env
# edita .env con tus credenciales (ver sección Google Sheets)
npm run dev
```

---

## Configuración de Google Sheets (opcional)

La integración con Google Sheets requiere un **OAuth 2.0 Client ID** de Google Cloud. Si no la necesitas, la app funciona completamente sin ella.

### Paso 1 — Crear proyecto en Google Cloud

1. Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral: **APIs y servicios → Biblioteca**
4. Busca **Google Sheets API** y haz clic en **Habilitar**

### Paso 2 — Crear credenciales OAuth 2.0

1. Ve a **APIs y servicios → Credenciales**
2. Haz clic en **+ Crear credenciales → ID de cliente de OAuth 2.0**
3. Si se pide, configura la pantalla de consentimiento:
   - Tipo de usuario: **Externo**
   - Nombre de la app: `GanApp`
   - Correo de soporte: tu email
   - Guarda y continúa (los demás pasos son opcionales)
4. Vuelve a crear credenciales:
   - Tipo de aplicación: **Aplicación web**
   - Nombre: `GanApp Local`
   - **Orígenes de JavaScript autorizados**: agrega `http://localhost:5173`
   - Para producción: agrega también tu dominio (ej. `https://tudominio.com`)
5. Haz clic en **Crear**
6. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`)

### Paso 3 — Configurar variables de entorno

```bash
# .env
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

### Paso 4 — Preparar el Google Sheet

1. Crea un nuevo Google Sheet en [https://sheets.google.com](https://sheets.google.com)
2. Comparte el Sheet con tu cuenta de Google (debe tener permisos de editor)
3. Copia el **ID del Sheet** de la URL:
   `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`
4. En GanApp → tab **Configuración**, pega el ID y haz clic en **Conectar con Google**

GanApp crea automáticamente las hojas necesarias:
- `Ventas Individuales`
- `Lotes`
- `Items por Lote`
- `Gastos Operativos`
- `Pagos y Destino`

---

## Scripts

```bash
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción en /dist
npm run preview  # previsualizar el build
```

---

## Stack tecnológico

- React 19 + TypeScript + Vite
- Recharts (gráficas)
- html2canvas + jsPDF (exportación PDF)
- Google Identity Services (OAuth 2.0)
- Google Sheets API v4
- localStorage (almacenamiento principal)

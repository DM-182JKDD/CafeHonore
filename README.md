# Café Honoré · Angular 22

Portal web de Café Honoré y +PLUS, desarrollado con Angular 22. Conserva el contenido, las imágenes y los formularios del sitio original, con diseño adaptable a móviles y escritorio. En móviles, la navegación principal se muestra fija en la parte inferior.

El portal público funciona sin un backend. El inicio de sesión y el envío del formulario de contacto requieren configurar una API; consulta [docs/API.md](docs/API.md).

## Requisitos

- Node.js **24.x** (mínimo **24.15.0**); `.nvmrc` especifica **24.22.1**.
- npm, incluido con Node.js.

En Windows con nvm:

```powershell
nvm install 24.22.1
nvm use 24.22.1
node --version
```

## Instalación y desarrollo

Desde la raíz del repositorio, abre una terminal y ejecuta:

```powershell
npm.cmd ci
npm.cmd start
```

Abre `http://127.0.0.1:4200`. Angular recompila la aplicación al guardar cambios. Para detener el servidor, pulsa `Ctrl + C`.

Para usar otro puerto:

```powershell
npm.cmd start -- --port 4201
```

## Verificación y compilación

```powershell
npm.cmd run verify:content
npm.cmd test
npm.cmd run build
```

`npm.cmd run build` ejecuta primero la verificación del contenido. Esta compara textos, listas, títulos, imágenes y campos de formulario con la referencia en `tools/content-baseline.json`, y comprueba que las imágenes existan. La compilación de producción se genera en `dist/portal/browser/`.

## Estructura principal

| Ubicación | Uso |
| --- | --- |
| `src/main.ts` | Inicio de Angular y configuración de rutas |
| `src/portal/` | Componentes, páginas, formularios, servicio HTTP y pruebas |
| `src/tokens.css` | Variables de diseño |
| `src/styles.css` | Estilos globales y adaptaciones por tamaño de pantalla |
| `public/assets/` | Imágenes utilizadas por el portal |
| `public/config.json` | Configuración pública de la API |
| `docs/API.md` | Notas para integrar el backend |
| `tools/content-baseline.json` | Referencia para verificar el contenido conservado |
| `tools/verify-original-content.mjs` | Verificación ejecutada antes de compilar |
| `angular.json`, `tsconfig*.json` | Configuración de Angular y TypeScript |
| `package.json`, `package-lock.json` | Scripts y dependencias reproducibles |

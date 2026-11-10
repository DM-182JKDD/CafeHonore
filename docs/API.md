# Integración de backend

`public/config.json` contiene `{ "apiBaseUrl": null }`. El contenido público ya está incluido en Angular; solo la autenticación y el envío requieren un servidor.

Cuando exista una API, configurar su URL pública, por ejemplo:

```json
{ "apiBaseUrl": "/api/v1" }
```

Adaptar `src/portal/api.service.ts` al contrato real. Este archivo de configuración no debe contener credenciales ni secretos.

| Operación | Endpoint provisional | Datos |
| --- | --- | --- |
| Acceso | POST auth/login | `{ username, password }`; respuesta `{ name, points }`; cookies de sesión |
| Salida | POST auth/logout | Invalida la sesión en el servidor |
| Contacto | POST contact | `{ firstName, lastName, phone, email, cardNumber, message }` |

La integración debe conservar los seis datos de contacto originales. El PHP recibía `fname` con `:c1:c2:c3:c4:c5:c6` mediante `display/correos.php`; el acceso recibía c1/c2/c3. No conectar estos protocolos directamente al contrato JSON sin adaptar el servicio.

El panel visual autenticado incluye resumen, movimientos, cambio de contraseña, actualización de datos, establecimientos y premios. La API provisional solo define acceso y salida: el resumen usa nombre y puntos devueltos por `auth/login`; los datos de perfil, movimientos, catálogo y operaciones de escritura aún necesitan endpoints reales. Mientras no existan, las vistas muestran estados informativos y los formularios de edición permanecen deshabilitados. No se simulan ni se guardan contraseñas en el navegador. La opción “Recordar contraseña” se conserva visualmente; el código histórico no implementaba persistencia para esa opción.

Para el mismo origen, preparar cookies de sesión HttpOnly/Secure/SameSite y protección XSRF en el servidor. Para otro origen, configurar CORS explícito con credenciales y protección CSRF. El servidor valida permisos y operaciones.

Puedes usar tu cuenta personal de @gmail.com para crear el proyecto en Google Cloud Console. Así es como funciona la realidad del desarrollo:

Modo "Testing" (Desarrollo Local):

Cuando creas la "Pantalla de consentimiento de OAuth" en Google Cloud, te preguntará el "Estado de publicación". Elígelo como "Testing" (Pruebas).

En este modo, Google no te va a exigir verificar ningún dominio.

En "Orígenes de JavaScript autorizados", puedes poner tranquilamente http://localhost:3000.

Limitación: En modo Testing, solo podrás iniciar sesión con los correos que tú añadas manualmente a una lista de "Usuarios de prueba" (hasta 100 correos). Esto es ideal para tu MVP y fase de desarrollo.

Modo "Producción" (Cuando compres tu dominio):

Cuando ya subas tu proyecto a reprompt.com, irás a Google Cloud Console y cambiarás el estado a "En producción".

Añadirás https://reprompt.com a los orígenes autorizados.

Aquí es donde entra la verificación: Google te pedirá que demuestres que eres el dueño de reprompt.com. Para ello, te hará añadir un registro TXT en los DNS de tu proveedor de dominio (Godaddy, Cloudflare, etc.). Tu email personal de @gmail.com seguirá siendo el dueño del proyecto en Google Cloud, no hay problema con eso.
# Base de datos SGSPCSI

Este documento describe todas las tablas del modelo, los datos que manejan y sus relaciones.
El esquema corresponde a la version definida en [base de datos/01_esquema_bd.sql](base%20de%20datos/01_esquema_bd.sql).

## Reglas de visibilidad del sistema

1. PM ve todos los sistemas y todas las solicitudes.
2. Encargado ve sistemas de su coordinacion y areas dependientes.
3. Desarrollador ve sistemas/solicitudes donde participa como RESPONSABLE o PARTICIPANTE.
4. Un usuario solo puede tener una adscripcion activa a la vez.
5. Si un sistema no esta en la relacion area-sistema, no es visible para encargado.

## Archivos del paquete

1. [base de datos/01_esquema_bd.sql](base%20de%20datos/01_esquema_bd.sql): creacion de tablas, llaves, restricciones e indices.
2. [base de datos/02_diagrama_entidad_relacion.mmd](base%20de%20datos/02_diagrama_entidad_relacion.mmd): diagrama entidad-relacion en Mermaid.
3. [base de datos/03_plantilla_carga_inicial.sql](base%20de%20datos/03_plantilla_carga_inicial.sql): carga inicial y consultas base de visibilidad.
4. [base de datos/04_diccionario_tecnico_tablas.md](base%20de%20datos/04_diccionario_tecnico_tablas.md): diccionario detallado por tabla y columna (tipo, null, default, llaves, relacion y descripcion).

## Listado completo de tablas

### 1) Seguridad y acceso

1. rol
2. usuario
3. usuario_rol

### 2) Estructura organizacional

4. area
5. usuario_area

### 3) Sistemas y asignaciones

6. sistema
7. area_sistema
8. sistema_desarrollador

### 4) Catalogos de solicitud

9. tipo_solicitud
10. estado_solicitud
11. prioridad_solicitud

### 5) Operacion de solicitudes

12. solicitud
13. solicitud_desarrollador
14. solicitud_historial_estado
15. solicitud_aprobacion
16. solicitud_comentario
17. solicitud_adjunto
18. notificacion

## Diccionario resumido por tabla

### rol

- Proposito: catalogo de roles de seguridad.
- Datos clave: clave, nombre, descripcion, activo.
- PK: rol_id.
- Relacion principal: rol 1:N usuario_rol.

### usuario

- Proposito: personas que usan el sistema.
- Datos clave: nombre, correo_institucional (unico), puesto, activo.
- PK: usuario_id.
- Relaciones principales: usuario 1:N usuario_rol, usuario 1:N usuario_area, usuario 1:N solicitudes creadas y acciones operativas.

### usuario_rol

- Proposito: asignacion de roles por usuario.
- Datos clave: usuario_id, rol_id, activo, fecha_asignacion, fecha_fin.
- PK: usuario_rol_id.
- FK: usuario_id -> usuario, rol_id -> rol.
- Regla: combinacion usuario-rol unica.

### area

- Proposito: jerarquia organizacional (direccion, coordinacion, departamento).
- Datos clave: area_padre_id, clave, nombre, tipo_area, nivel, activa.
- PK: area_id.
- FK: area_padre_id -> area (autorelacion).
- Regla: permite arbol de dependencias.

### usuario_area

- Proposito: adscripcion del usuario a un area.
- Datos clave: usuario_id, area_id, es_titular, activo, fecha_inicio, fecha_fin.
- PK: usuario_area_id.
- FK: usuario_id -> usuario, area_id -> area.
- Regla critica: indice unico filtrado para una sola adscripcion activa por usuario.

### sistema

- Proposito: catalogo de sistemas institucionales.
- Datos clave: clave, nombre, descripcion, activo.
- PK: sistema_id.
- Relaciones principales: sistema 1:N area_sistema, sistema 1:N sistema_desarrollador, sistema 1:N solicitud.

### area_sistema

- Proposito: mapea que areas usan que sistemas.
- Datos clave: area_id, sistema_id, activo, fecha_alta.
- PK: area_sistema_id.
- FK: area_id -> area, sistema_id -> sistema.
- Regla: combinacion area-sistema unica.

### sistema_desarrollador

- Proposito: relacion de desarrolladores por sistema.
- Datos clave: sistema_id, usuario_id, tipo_participacion, activo, fechas.
- PK: sistema_desarrollador_id.
- FK: sistema_id -> sistema, usuario_id -> usuario.
- Regla: tipo_participacion en (RESPONSABLE, PARTICIPANTE).

### tipo_solicitud

- Proposito: catalogo de tipos de solicitud.
- Datos clave: clave, nombre, activo.
- PK: tipo_solicitud_id.
- Relacion principal: tipo_solicitud 1:N solicitud.

### estado_solicitud

- Proposito: catalogo de estados de flujo.
- Datos clave: clave, nombre, es_terminal, activo.
- PK: estado_solicitud_id.
- Relaciones principales: estado_solicitud 1:N solicitud y 1:N solicitud_historial_estado.

### prioridad_solicitud

- Proposito: catalogo de prioridad.
- Datos clave: clave, nombre, peso, activo.
- PK: prioridad_solicitud_id.
- Relacion principal: prioridad_solicitud 1:N solicitud.

### solicitud

- Proposito: entidad central de negocio (ticket/solicitud).
- Datos clave: folio, titulo, descripcion, area_solicitante_id, sistema_id, tipo, prioridad, estado, creador, fechas, esfuerzo_horas, activo.
- PK: solicitud_id.
- FK: area, sistema, tipo_solicitud, prioridad_solicitud, estado_solicitud, usuario creador.
- Relaciones principales: solicitud 1:N historial, aprobaciones, comentarios, adjuntos, notificaciones, desarrolladores.

### solicitud_desarrollador

- Proposito: asignaciones de personal tecnico a solicitudes.
- Datos clave: solicitud_id, usuario_id, tipo_participacion, activo, fechas.
- PK: solicitud_desarrollador_id.
- FK: solicitud_id -> solicitud, usuario_id -> usuario.
- Regla: tipo_participacion en (RESPONSABLE, PARTICIPANTE).

### solicitud_historial_estado

- Proposito: bitacora de cambios de estado.
- Datos clave: solicitud_id, estado_anterior_id, estado_nuevo_id, comentario, usuario que cambia, fecha.
- PK: solicitud_historial_estado_id.
- FK: solicitud_id -> solicitud, estados -> estado_solicitud, usuario -> usuario.

### solicitud_aprobacion

- Proposito: resultado de revision/aprobacion de PM u otra autoridad.
- Datos clave: solicitud_id, aprobado_por_usuario_id, estatus_aprobacion, motivo, fecha.
- PK: solicitud_aprobacion_id.
- FK: solicitud_id -> solicitud, aprobado_por_usuario_id -> usuario.
- Regla: estatus en (APROBADA, RECHAZADA, REQUIERE_INFO).

### solicitud_comentario

- Proposito: comentarios operativos e internos.
- Datos clave: solicitud_id, autor_usuario_id, comentario, es_interno, fecha.
- PK: solicitud_comentario_id.
- FK: solicitud_id -> solicitud, autor_usuario_id -> usuario.

### solicitud_adjunto

- Proposito: archivos asociados a la solicitud.
- Datos clave: solicitud_id, nombre_archivo, ruta_archivo, tipo_mime, tamanio_bytes, subido_por_usuario_id, fecha_subida.
- PK: solicitud_adjunto_id.
- FK: solicitud_id -> solicitud, subido_por_usuario_id -> usuario.

### notificacion

- Proposito: mensajes del sistema para usuarios.
- Datos clave: usuario_id, solicitud_id, titulo, mensaje, leida, fecha_creacion, fecha_lectura.
- PK: notificacion_id.
- FK: usuario_id -> usuario, solicitud_id -> solicitud.

## Mapa de relaciones clave (vista funcional)

1. Usuario y seguridad
1. usuario N:M rol mediante usuario_rol.
2. usuario 1:N usuario_area.

2. Organizacion y visibilidad
1. area se relaciona consigo misma por area_padre_id para dependencias.
2. area N:M sistema mediante area_sistema.

3. Trabajo tecnico
1. sistema N:M desarrollador mediante sistema_desarrollador.
2. solicitud N:M desarrollador mediante solicitud_desarrollador.

4. Ciclo de vida de solicitud
1. solicitud tiene un estado actual (estado_solicitud).
2. solicitud registra historial en solicitud_historial_estado.
3. solicitud registra aprobaciones, comentarios, adjuntos y notificaciones.

## Flujo recomendado de implementacion

1. Ejecutar [base de datos/01_esquema_bd.sql](base%20de%20datos/01_esquema_bd.sql).
2. Ejecutar [base de datos/03_plantilla_carga_inicial.sql](base%20de%20datos/03_plantilla_carga_inicial.sql).
3. Cargar areas reales (adscripciones), luego usuarios, luego sistemas.
4. Completar area_sistema para habilitar visibilidad de encargados.
5. Completar sistema_desarrollador/solicitud_desarrollador para visibilidad de desarrolladores.

## Datos pendientes que se pueden cargar despues

1. Encargados por coordinacion: nombre, correo, puesto, activo.
2. Inventario real de sistemas por coordinacion.
3. Participacion de desarrolladores por sistema y por solicitud.

## Nota tecnica

El script esta optimizado para SQL Server (DATETIME2, indices filtrados y CTE recursivo con MAXRECURSION).
Si se migra a otro motor, se deben ajustar esos elementos.

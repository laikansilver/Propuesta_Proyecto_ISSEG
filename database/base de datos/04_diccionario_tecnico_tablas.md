# Diccionario tecnico de tablas SGSPCSI

Este documento muestra cada tabla con sus atributos y metadata tecnica:

- tipo
- nulabilidad
- valor por default
- llave
- relacion
- descripcion

## Convenciones

- PK: llave primaria.
- FK: llave foranea.
- UK: unico.
- NN: NOT NULL.
- N: NULL permitido.

## Tabla: rol

Descripcion: catalogo de roles de seguridad del sistema.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| rol_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador del rol |
| clave | VARCHAR(30) | NN | - | UK | - | Clave corta del rol (PM, ENCARGADO, etc.) |
| nombre | VARCHAR(100) | NN | - | - | - | Nombre visible del rol |
| descripcion | VARCHAR(255) | N | - | - | - | Descripcion funcional del rol |
| activo | BIT | NN | 1 | - | - | Estado de vigencia del rol |
| fecha_creacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de alta |

## Tabla: usuario

Descripcion: usuarios del sistema.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| usuario_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador del usuario |
| nombre | VARCHAR(120) | NN | - | - | - | Nombre completo |
| correo_institucional | VARCHAR(180) | NN | - | UK | - | Correo institucional unico |
| puesto | VARCHAR(120) | N | - | - | - | Puesto/cargo |
| activo | BIT | NN | 1 | - | - | Vigencia del usuario |
| fecha_creacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de alta |

## Tabla: usuario_rol

Descripcion: asignacion de roles a usuarios.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| usuario_rol_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| usuario_id | INT | NN | - | FK | usuario.usuario_id | Usuario asignado |
| rol_id | INT | NN | - | FK | rol.rol_id | Rol asignado |
| activo | BIT | NN | 1 | - | - | Asignacion vigente |
| fecha_asignacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de inicio |
| fecha_fin | DATETIME2 | N | - | - | - | Fecha de termino |

Restricciones: UK (usuario_id, rol_id).

## Tabla: area

Descripcion: catalogo jerarquico de direcciones, coordinaciones y departamentos.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| area_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador del area |
| area_padre_id | INT | N | - | FK | area.area_id | Relacion jerarquica padre-hijo |
| clave | VARCHAR(50) | N | - | - | - | Clave operativa del area |
| nombre | VARCHAR(220) | NN | - | UK | - | Nombre oficial del area |
| tipo_area | VARCHAR(30) | NN | - | - | - | DIRECCION, COORDINACION, DEPARTAMENTO, OTRA |
| nivel | TINYINT | NN | - | - | - | Nivel jerarquico |
| activa | BIT | NN | 1 | - | - | Vigencia del area |
| fecha_creacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de alta |

Checks: nivel >= 1, tipo_area en catalogo permitido.

## Tabla: usuario_area

Descripcion: adscripcion de usuario a una sola area activa.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| usuario_area_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| usuario_id | INT | NN | - | FK | usuario.usuario_id | Usuario adscrito |
| area_id | INT | NN | - | FK | area.area_id | Area asignada |
| es_titular | BIT | NN | 0 | - | - | Marca de titularidad |
| activo | BIT | NN | 1 | - | - | Adscripcion vigente |
| fecha_inicio | DATETIME2 | NN | SYSDATETIME() | - | - | Inicio de adscripcion |
| fecha_fin | DATETIME2 | N | - | - | - | Fin de adscripcion |

Indice: UX_usuario_area_adscripcion_activa sobre usuario_id con filtro activo=1 y fecha_fin NULL.

## Tabla: sistema

Descripcion: catalogo de sistemas institucionales.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| sistema_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador del sistema |
| clave | VARCHAR(50) | NN | - | UK | - | Clave unica del sistema |
| nombre | VARCHAR(200) | NN | - | - | - | Nombre funcional |
| descripcion | VARCHAR(500) | N | - | - | - | Descripcion del sistema |
| activo | BIT | NN | 1 | - | - | Vigencia del sistema |
| fecha_creacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de alta |

## Tabla: area_sistema

Descripcion: relacion entre areas y sistemas visibles para cada area.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| area_sistema_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| area_id | INT | NN | - | FK | area.area_id | Area consumidora |
| sistema_id | INT | NN | - | FK | sistema.sistema_id | Sistema asignado al area |
| activo | BIT | NN | 1 | - | - | Relacion vigente |
| fecha_alta | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de registro |

Restricciones: UK (area_id, sistema_id).

## Tabla: sistema_desarrollador

Descripcion: participacion de desarrolladores por sistema.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| sistema_desarrollador_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| sistema_id | INT | NN | - | FK | sistema.sistema_id | Sistema asignado |
| usuario_id | INT | NN | - | FK | usuario.usuario_id | Desarrollador |
| tipo_participacion | VARCHAR(20) | NN | - | - | - | RESPONSABLE o PARTICIPANTE |
| activo | BIT | NN | 1 | - | - | Asignacion vigente |
| fecha_inicio | DATETIME2 | NN | SYSDATETIME() | - | - | Inicio de participacion |
| fecha_fin | DATETIME2 | N | - | - | - | Fin de participacion |

Checks: tipo_participacion en (RESPONSABLE, PARTICIPANTE).  Restriccion: UK (sistema_id, usuario_id).

## Tabla: tipo_solicitud

Descripcion: catalogo de tipo de solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| tipo_solicitud_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador del tipo |
| clave | VARCHAR(30) | NN | - | UK | - | Clave del tipo |
| nombre | VARCHAR(100) | NN | - | - | - | Nombre del tipo |
| activo | BIT | NN | 1 | - | - | Vigencia del tipo |

## Tabla: estado_solicitud

Descripcion: estados del ciclo de vida de la solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| estado_solicitud_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador del estado |
| clave | VARCHAR(30) | NN | - | UK | - | Clave del estado |
| nombre | VARCHAR(100) | NN | - | - | - | Nombre del estado |
| es_terminal | BIT | NN | 0 | - | - | Marca si es estado final |
| activo | BIT | NN | 1 | - | - | Vigencia del estado |

## Tabla: prioridad_solicitud

Descripcion: prioridades operativas de solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| prioridad_solicitud_id | INT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador de prioridad |
| clave | VARCHAR(20) | NN | - | UK | - | BAJA, MEDIA, ALTA, CRITICA |
| nombre | VARCHAR(50) | NN | - | - | - | Nombre de prioridad |
| peso | TINYINT | NN | - | - | - | Peso para ordenamiento |
| activo | BIT | NN | 1 | - | - | Vigencia |

## Tabla: solicitud

Descripcion: entidad principal de negocio para tickets/solicitudes.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| solicitud_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador de la solicitud |
| folio | VARCHAR(40) | NN | - | UK | - | Folio unico de negocio |
| titulo | VARCHAR(200) | NN | - | - | - | Titulo breve |
| descripcion | VARCHAR(MAX) | NN | - | - | - | Descripcion detallada |
| area_solicitante_id | INT | NN | - | FK | area.area_id | Area que solicita |
| sistema_id | INT | N | - | FK | sistema.sistema_id | Sistema afectado (si aplica) |
| tipo_solicitud_id | INT | NN | - | FK | tipo_solicitud.tipo_solicitud_id | Tipo de solicitud |
| prioridad_solicitud_id | INT | NN | - | FK | prioridad_solicitud.prioridad_solicitud_id | Prioridad |
| estado_solicitud_id | INT | NN | - | FK | estado_solicitud.estado_solicitud_id | Estado actual |
| creado_por_usuario_id | INT | NN | - | FK | usuario.usuario_id | Usuario creador |
| fecha_solicitud | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de registro |
| fecha_compromiso | DATETIME2 | N | - | - | - | Fecha compromiso SLA |
| fecha_resolucion | DATETIME2 | N | - | - | - | Fecha de cierre |
| esfuerzo_horas | DECIMAL(10,2) | N | - | - | - | Horas invertidas |
| activo | BIT | NN | 1 | - | - | Vigencia logica |

## Tabla: solicitud_desarrollador

Descripcion: relacion de participantes tecnicos por solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| solicitud_desarrollador_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| solicitud_id | BIGINT | NN | - | FK | solicitud.solicitud_id | Solicitud asignada |
| usuario_id | INT | NN | - | FK | usuario.usuario_id | Desarrollador |
| tipo_participacion | VARCHAR(20) | NN | - | - | - | RESPONSABLE o PARTICIPANTE |
| activo | BIT | NN | 1 | - | - | Asignacion vigente |
| fecha_asignacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de asignacion |
| fecha_fin | DATETIME2 | N | - | - | - | Fin de asignacion |

Checks: tipo_participacion en (RESPONSABLE, PARTICIPANTE).  Restriccion: UK (solicitud_id, usuario_id).

## Tabla: solicitud_historial_estado

Descripcion: bitacora de cambios de estado de cada solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| solicitud_historial_estado_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| solicitud_id | BIGINT | NN | - | FK | solicitud.solicitud_id | Solicitud afectada |
| estado_anterior_id | INT | N | - | FK | estado_solicitud.estado_solicitud_id | Estado previo |
| estado_nuevo_id | INT | NN | - | FK | estado_solicitud.estado_solicitud_id | Nuevo estado |
| comentario | VARCHAR(800) | N | - | - | - | Observacion del cambio |
| cambiado_por_usuario_id | INT | NN | - | FK | usuario.usuario_id | Usuario que realizo el cambio |
| fecha_cambio | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha del cambio |

## Tabla: solicitud_aprobacion

Descripcion: resolucion de aprobacion/rechazo/requiere informacion.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| solicitud_aprobacion_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| solicitud_id | BIGINT | NN | - | FK | solicitud.solicitud_id | Solicitud evaluada |
| aprobado_por_usuario_id | INT | NN | - | FK | usuario.usuario_id | Revisor que decide |
| estatus_aprobacion | VARCHAR(20) | NN | - | - | - | APROBADA, RECHAZADA, REQUIERE_INFO |
| motivo | VARCHAR(1000) | N | - | - | - | Motivo/comentario de decision |
| fecha_aprobacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de evaluacion |

Checks: estatus_aprobacion en (APROBADA, RECHAZADA, REQUIERE_INFO).

## Tabla: solicitud_comentario

Descripcion: comentarios asociados a la solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| solicitud_comentario_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| solicitud_id | BIGINT | NN | - | FK | solicitud.solicitud_id | Solicitud relacionada |
| autor_usuario_id | INT | NN | - | FK | usuario.usuario_id | Autor del comentario |
| comentario | VARCHAR(2000) | NN | - | - | - | Texto del comentario |
| es_interno | BIT | NN | 0 | - | - | Marca para comentario interno |
| fecha_comentario | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha del comentario |

## Tabla: solicitud_adjunto

Descripcion: evidencias y archivos de soporte por solicitud.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| solicitud_adjunto_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| solicitud_id | BIGINT | NN | - | FK | solicitud.solicitud_id | Solicitud relacionada |
| nombre_archivo | VARCHAR(255) | NN | - | - | - | Nombre original del archivo |
| ruta_archivo | VARCHAR(500) | NN | - | - | - | Ruta fisica/logica de almacenamiento |
| tipo_mime | VARCHAR(120) | N | - | - | - | Tipo MIME |
| tamanio_bytes | BIGINT | N | - | - | - | Peso del archivo |
| subido_por_usuario_id | INT | NN | - | FK | usuario.usuario_id | Usuario que sube |
| fecha_subida | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de carga |

## Tabla: notificacion

Descripcion: notificaciones enviadas a usuarios.

| Columna | Tipo | Null | Default | Llave | Relacion | Descripcion |
|---|---|---|---|---|---|---|
| notificacion_id | BIGINT IDENTITY(1,1) | NN | IDENTITY | PK | - | Identificador tecnico |
| usuario_id | INT | NN | - | FK | usuario.usuario_id | Receptor de la notificacion |
| solicitud_id | BIGINT | N | - | FK | solicitud.solicitud_id | Solicitud asociada (opcional) |
| titulo | VARCHAR(180) | NN | - | - | - | Titulo corto |
| mensaje | VARCHAR(1000) | NN | - | - | - | Contenido de la notificacion |
| leida | BIT | NN | 0 | - | - | Bandera de lectura |
| fecha_creacion | DATETIME2 | NN | SYSDATETIME() | - | - | Fecha de creacion |
| fecha_lectura | DATETIME2 | N | - | - | - | Fecha de lectura |

## Resumen de relaciones principales

1. Seguridad
- usuario N:M rol (usuario_rol).
- usuario 1:N usuario_area.

2. Estructura
- area 1:N area (jerarquia por area_padre_id).
- area N:M sistema (area_sistema).

3. Desarrollo
- sistema N:M usuario (sistema_desarrollador).
- solicitud N:M usuario (solicitud_desarrollador).

4. Operacion de solicitudes
- solicitud N:1 area, sistema, tipo_solicitud, prioridad_solicitud, estado_solicitud, usuario creador.
- solicitud 1:N historial_estado, aprobacion, comentario, adjunto, notificacion.

## Notas de visualizacion

- Para ver el modelo grafico usar [base de datos/02_diagrama_entidad_relacion.mmd](base%20de%20datos/02_diagrama_entidad_relacion.mmd).
- Para crear todas las tablas usar [base de datos/01_esquema_bd.sql](base%20de%20datos/01_esquema_bd.sql).
- Para datos iniciales usar [base de datos/03_plantilla_carga_inicial.sql](base%20de%20datos/03_plantilla_carga_inicial.sql).

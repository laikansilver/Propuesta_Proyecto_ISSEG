/*
  Sistema: SGSPCSI - ISSEG
  Motor objetivo: SQL Server 2019+
  Objetivo: esquema base para control de solicitudes, visibilidad por coordinacion,
  participacion de desarrolladores y gobierno de catalogos.
*/

SET NOCOUNT ON;
GO

/* =========================
   CATALOGOS DE SEGURIDAD
   ========================= */

CREATE TABLE dbo.rol (
    rol_id              INT IDENTITY(1,1) PRIMARY KEY,
    clave               VARCHAR(30) NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(255) NULL,
    activo              BIT NOT NULL CONSTRAINT DF_rol_activo DEFAULT (1),
    fecha_creacion      DATETIME2 NOT NULL CONSTRAINT DF_rol_fecha_creacion DEFAULT (SYSDATETIME())
);
GO

CREATE TABLE dbo.usuario (
    usuario_id          INT IDENTITY(1,1) PRIMARY KEY,
    nombre              VARCHAR(120) NOT NULL,
    correo_institucional VARCHAR(180) NOT NULL UNIQUE,
    puesto              VARCHAR(120) NULL,
    activo              BIT NOT NULL CONSTRAINT DF_usuario_activo DEFAULT (1),
    fecha_creacion      DATETIME2 NOT NULL CONSTRAINT DF_usuario_fecha_creacion DEFAULT (SYSDATETIME())
);
GO

CREATE TABLE dbo.usuario_rol (
    usuario_rol_id      INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id          INT NOT NULL,
    rol_id              INT NOT NULL,
    activo              BIT NOT NULL CONSTRAINT DF_usuario_rol_activo DEFAULT (1),
    fecha_asignacion    DATETIME2 NOT NULL CONSTRAINT DF_usuario_rol_fecha_asignacion DEFAULT (SYSDATETIME()),
    fecha_fin           DATETIME2 NULL,
    CONSTRAINT FK_usuario_rol_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuario(usuario_id),
    CONSTRAINT FK_usuario_rol_rol FOREIGN KEY (rol_id) REFERENCES dbo.rol(rol_id),
    CONSTRAINT UQ_usuario_rol UNIQUE (usuario_id, rol_id)
);
GO

/* =========================
   ESTRUCTURA ORGANIZACIONAL
   ========================= */

CREATE TABLE dbo.area (
    area_id             INT IDENTITY(1,1) PRIMARY KEY,
    area_padre_id       INT NULL,
    clave               VARCHAR(50) NULL,
    nombre              VARCHAR(220) NOT NULL UNIQUE,
    tipo_area           VARCHAR(30) NOT NULL, /* DIRECCION | COORDINACION | DEPARTAMENTO | OTRA */
    nivel               TINYINT NOT NULL,
    activa              BIT NOT NULL CONSTRAINT DF_area_activa DEFAULT (1),
    fecha_creacion      DATETIME2 NOT NULL CONSTRAINT DF_area_fecha_creacion DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_area_area_padre FOREIGN KEY (area_padre_id) REFERENCES dbo.area(area_id),
    CONSTRAINT CK_area_nivel CHECK (nivel >= 1),
    CONSTRAINT CK_area_tipo CHECK (tipo_area IN ('DIRECCION','COORDINACION','DEPARTAMENTO','OTRA'))
);
GO

/*
  Regla del proyecto:
  - Un usuario NO puede pertenecer a dos coordinaciones a la vez.
  Se implementa con adscripcion activa unica por usuario.
*/
CREATE TABLE dbo.usuario_area (
    usuario_area_id     INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id          INT NOT NULL,
    area_id             INT NOT NULL,
    es_titular          BIT NOT NULL CONSTRAINT DF_usuario_area_es_titular DEFAULT (0),
    activo              BIT NOT NULL CONSTRAINT DF_usuario_area_activo DEFAULT (1),
    fecha_inicio        DATETIME2 NOT NULL CONSTRAINT DF_usuario_area_fecha_inicio DEFAULT (SYSDATETIME()),
    fecha_fin           DATETIME2 NULL,
    CONSTRAINT FK_usuario_area_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuario(usuario_id),
    CONSTRAINT FK_usuario_area_area FOREIGN KEY (area_id) REFERENCES dbo.area(area_id)
);
GO

/* Unica adscripcion activa por usuario */
CREATE UNIQUE INDEX UX_usuario_area_adscripcion_activa
ON dbo.usuario_area (usuario_id)
WHERE (activo = 1 AND fecha_fin IS NULL);
GO

/* =========================
   SISTEMAS Y VISIBILIDAD
   ========================= */

CREATE TABLE dbo.sistema (
    sistema_id          INT IDENTITY(1,1) PRIMARY KEY,
    clave               VARCHAR(50) NOT NULL UNIQUE,
    nombre              VARCHAR(200) NOT NULL,
    descripcion         VARCHAR(500) NULL,
    activo              BIT NOT NULL CONSTRAINT DF_sistema_activo DEFAULT (1),
    fecha_creacion      DATETIME2 NOT NULL CONSTRAINT DF_sistema_fecha_creacion DEFAULT (SYSDATETIME())
);
GO

/*
  Relacion area-sistema:
  - Define que sistemas usa cada coordinacion/area.
  - Si no existe relacion, el sistema no se muestra (excepto PM).
*/
CREATE TABLE dbo.area_sistema (
    area_sistema_id     INT IDENTITY(1,1) PRIMARY KEY,
    area_id             INT NOT NULL,
    sistema_id          INT NOT NULL,
    activo              BIT NOT NULL CONSTRAINT DF_area_sistema_activo DEFAULT (1),
    fecha_alta          DATETIME2 NOT NULL CONSTRAINT DF_area_sistema_fecha_alta DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_area_sistema_area FOREIGN KEY (area_id) REFERENCES dbo.area(area_id),
    CONSTRAINT FK_area_sistema_sistema FOREIGN KEY (sistema_id) REFERENCES dbo.sistema(sistema_id),
    CONSTRAINT UQ_area_sistema UNIQUE (area_id, sistema_id)
);
GO

/*
  Relacion de desarrolladores con sistemas:
  - Un desarrollador ve sistemas donde participa.
  - tipo_participacion: RESPONSABLE o PARTICIPANTE.
*/
CREATE TABLE dbo.sistema_desarrollador (
    sistema_desarrollador_id INT IDENTITY(1,1) PRIMARY KEY,
    sistema_id          INT NOT NULL,
    usuario_id          INT NOT NULL,
    tipo_participacion  VARCHAR(20) NOT NULL,
    activo              BIT NOT NULL CONSTRAINT DF_sistema_desarrollador_activo DEFAULT (1),
    fecha_inicio        DATETIME2 NOT NULL CONSTRAINT DF_sistema_desarrollador_fecha_inicio DEFAULT (SYSDATETIME()),
    fecha_fin           DATETIME2 NULL,
    CONSTRAINT FK_sistema_desarrollador_sistema FOREIGN KEY (sistema_id) REFERENCES dbo.sistema(sistema_id),
    CONSTRAINT FK_sistema_desarrollador_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuario(usuario_id),
    CONSTRAINT CK_sistema_desarrollador_tipo CHECK (tipo_participacion IN ('RESPONSABLE','PARTICIPANTE')),
    CONSTRAINT UQ_sistema_desarrollador UNIQUE (sistema_id, usuario_id)
);
GO

/* =========================
   SOLICITUDES
   ========================= */

CREATE TABLE dbo.tipo_solicitud (
    tipo_solicitud_id    INT IDENTITY(1,1) PRIMARY KEY,
    clave                VARCHAR(30) NOT NULL UNIQUE, /* NUEVO_SISTEMA | MODIFICACION | URGENTE | REQUERIMIENTO */
    nombre               VARCHAR(100) NOT NULL,
    activo               BIT NOT NULL CONSTRAINT DF_tipo_solicitud_activo DEFAULT (1)
);
GO

CREATE TABLE dbo.estado_solicitud (
    estado_solicitud_id  INT IDENTITY(1,1) PRIMARY KEY,
    clave                VARCHAR(30) NOT NULL UNIQUE,
    nombre               VARCHAR(100) NOT NULL,
    es_terminal          BIT NOT NULL CONSTRAINT DF_estado_solicitud_terminal DEFAULT (0),
    activo               BIT NOT NULL CONSTRAINT DF_estado_solicitud_activo DEFAULT (1)
);
GO

CREATE TABLE dbo.prioridad_solicitud (
    prioridad_solicitud_id INT IDENTITY(1,1) PRIMARY KEY,
    clave                VARCHAR(20) NOT NULL UNIQUE, /* BAJA | MEDIA | ALTA | CRITICA */
    nombre               VARCHAR(50) NOT NULL,
    peso                 TINYINT NOT NULL,
    activo               BIT NOT NULL CONSTRAINT DF_prioridad_solicitud_activo DEFAULT (1)
);
GO

CREATE TABLE dbo.solicitud (
    solicitud_id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    folio                VARCHAR(40) NOT NULL UNIQUE,
    titulo               VARCHAR(200) NOT NULL,
    descripcion          VARCHAR(MAX) NOT NULL,
    area_solicitante_id  INT NOT NULL,
    sistema_id           INT NULL,
    tipo_solicitud_id    INT NOT NULL,
    prioridad_solicitud_id INT NOT NULL,
    estado_solicitud_id  INT NOT NULL,
    creado_por_usuario_id INT NOT NULL,
    fecha_solicitud      DATETIME2 NOT NULL CONSTRAINT DF_solicitud_fecha_solicitud DEFAULT (SYSDATETIME()),
    fecha_compromiso     DATETIME2 NULL,
    fecha_resolucion     DATETIME2 NULL,
    esfuerzo_horas       DECIMAL(10,2) NULL,
    activo               BIT NOT NULL CONSTRAINT DF_solicitud_activo DEFAULT (1),
    CONSTRAINT FK_solicitud_area FOREIGN KEY (area_solicitante_id) REFERENCES dbo.area(area_id),
    CONSTRAINT FK_solicitud_sistema FOREIGN KEY (sistema_id) REFERENCES dbo.sistema(sistema_id),
    CONSTRAINT FK_solicitud_tipo FOREIGN KEY (tipo_solicitud_id) REFERENCES dbo.tipo_solicitud(tipo_solicitud_id),
    CONSTRAINT FK_solicitud_prioridad FOREIGN KEY (prioridad_solicitud_id) REFERENCES dbo.prioridad_solicitud(prioridad_solicitud_id),
    CONSTRAINT FK_solicitud_estado FOREIGN KEY (estado_solicitud_id) REFERENCES dbo.estado_solicitud(estado_solicitud_id),
    CONSTRAINT FK_solicitud_usuario_creador FOREIGN KEY (creado_por_usuario_id) REFERENCES dbo.usuario(usuario_id)
);
GO

CREATE TABLE dbo.solicitud_desarrollador (
    solicitud_desarrollador_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id         BIGINT NOT NULL,
    usuario_id           INT NOT NULL,
    tipo_participacion   VARCHAR(20) NOT NULL,
    activo               BIT NOT NULL CONSTRAINT DF_solicitud_desarrollador_activo DEFAULT (1),
    fecha_asignacion     DATETIME2 NOT NULL CONSTRAINT DF_solicitud_desarrollador_fecha_asignacion DEFAULT (SYSDATETIME()),
    fecha_fin            DATETIME2 NULL,
    CONSTRAINT FK_solicitud_desarrollador_solicitud FOREIGN KEY (solicitud_id) REFERENCES dbo.solicitud(solicitud_id),
    CONSTRAINT FK_solicitud_desarrollador_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuario(usuario_id),
    CONSTRAINT CK_solicitud_desarrollador_tipo CHECK (tipo_participacion IN ('RESPONSABLE','PARTICIPANTE')),
    CONSTRAINT UQ_solicitud_desarrollador UNIQUE (solicitud_id, usuario_id)
);
GO

CREATE TABLE dbo.solicitud_historial_estado (
    solicitud_historial_estado_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id         BIGINT NOT NULL,
    estado_anterior_id   INT NULL,
    estado_nuevo_id      INT NOT NULL,
    comentario           VARCHAR(800) NULL,
    cambiado_por_usuario_id INT NOT NULL,
    fecha_cambio         DATETIME2 NOT NULL CONSTRAINT DF_solicitud_historial_estado_fecha DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_solicitud_historial_estado_solicitud FOREIGN KEY (solicitud_id) REFERENCES dbo.solicitud(solicitud_id),
    CONSTRAINT FK_solicitud_historial_estado_anterior FOREIGN KEY (estado_anterior_id) REFERENCES dbo.estado_solicitud(estado_solicitud_id),
    CONSTRAINT FK_solicitud_historial_estado_nuevo FOREIGN KEY (estado_nuevo_id) REFERENCES dbo.estado_solicitud(estado_solicitud_id),
    CONSTRAINT FK_solicitud_historial_estado_usuario FOREIGN KEY (cambiado_por_usuario_id) REFERENCES dbo.usuario(usuario_id)
);
GO

CREATE TABLE dbo.solicitud_aprobacion (
    solicitud_aprobacion_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id         BIGINT NOT NULL,
    aprobado_por_usuario_id INT NOT NULL,
    estatus_aprobacion   VARCHAR(20) NOT NULL, /* APROBADA | RECHAZADA | REQUIERE_INFO */
    motivo               VARCHAR(1000) NULL,
    fecha_aprobacion     DATETIME2 NOT NULL CONSTRAINT DF_solicitud_aprobacion_fecha DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_solicitud_aprobacion_solicitud FOREIGN KEY (solicitud_id) REFERENCES dbo.solicitud(solicitud_id),
    CONSTRAINT FK_solicitud_aprobacion_usuario FOREIGN KEY (aprobado_por_usuario_id) REFERENCES dbo.usuario(usuario_id),
    CONSTRAINT CK_solicitud_aprobacion_estatus CHECK (estatus_aprobacion IN ('APROBADA','RECHAZADA','REQUIERE_INFO'))
);
GO

CREATE TABLE dbo.solicitud_comentario (
    solicitud_comentario_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id         BIGINT NOT NULL,
    autor_usuario_id     INT NOT NULL,
    comentario           VARCHAR(2000) NOT NULL,
    es_interno           BIT NOT NULL CONSTRAINT DF_solicitud_comentario_interno DEFAULT (0),
    fecha_comentario     DATETIME2 NOT NULL CONSTRAINT DF_solicitud_comentario_fecha DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_solicitud_comentario_solicitud FOREIGN KEY (solicitud_id) REFERENCES dbo.solicitud(solicitud_id),
    CONSTRAINT FK_solicitud_comentario_usuario FOREIGN KEY (autor_usuario_id) REFERENCES dbo.usuario(usuario_id)
);
GO

CREATE TABLE dbo.solicitud_adjunto (
    solicitud_adjunto_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id         BIGINT NOT NULL,
    nombre_archivo       VARCHAR(255) NOT NULL,
    ruta_archivo         VARCHAR(500) NOT NULL,
    tipo_mime            VARCHAR(120) NULL,
    tamanio_bytes        BIGINT NULL,
    subido_por_usuario_id INT NOT NULL,
    fecha_subida         DATETIME2 NOT NULL CONSTRAINT DF_solicitud_adjunto_fecha DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_solicitud_adjunto_solicitud FOREIGN KEY (solicitud_id) REFERENCES dbo.solicitud(solicitud_id),
    CONSTRAINT FK_solicitud_adjunto_usuario FOREIGN KEY (subido_por_usuario_id) REFERENCES dbo.usuario(usuario_id)
);
GO

CREATE TABLE dbo.notificacion (
    notificacion_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id           INT NOT NULL,
    solicitud_id         BIGINT NULL,
    titulo               VARCHAR(180) NOT NULL,
    mensaje              VARCHAR(1000) NOT NULL,
    leida                BIT NOT NULL CONSTRAINT DF_notificacion_leida DEFAULT (0),
    fecha_creacion       DATETIME2 NOT NULL CONSTRAINT DF_notificacion_fecha_creacion DEFAULT (SYSDATETIME()),
    fecha_lectura        DATETIME2 NULL,
    CONSTRAINT FK_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuario(usuario_id),
    CONSTRAINT FK_notificacion_solicitud FOREIGN KEY (solicitud_id) REFERENCES dbo.solicitud(solicitud_id)
);
GO

/* =========================
   INDICES OPERATIVOS
   ========================= */

CREATE INDEX IX_area_area_padre_id ON dbo.area(area_padre_id);
CREATE INDEX IX_area_sistema_area ON dbo.area_sistema(area_id, activo);
CREATE INDEX IX_area_sistema_sistema ON dbo.area_sistema(sistema_id, activo);
CREATE INDEX IX_sistema_desarrollador_usuario ON dbo.sistema_desarrollador(usuario_id, activo);
CREATE INDEX IX_solicitud_area_estado ON dbo.solicitud(area_solicitante_id, estado_solicitud_id);
CREATE INDEX IX_solicitud_sistema ON dbo.solicitud(sistema_id);
CREATE INDEX IX_solicitud_tipo_fecha ON dbo.solicitud(tipo_solicitud_id, fecha_solicitud);
CREATE INDEX IX_historial_solicitud_fecha ON dbo.solicitud_historial_estado(solicitud_id, fecha_cambio DESC);
CREATE INDEX IX_notificacion_usuario_leida ON dbo.notificacion(usuario_id, leida, fecha_creacion DESC);
GO

/* =========================
   DATOS MINIMOS DE CATALOGO
   ========================= */

INSERT INTO dbo.rol (clave, nombre, descripcion) VALUES
('PM', 'Product Manager', 'Puede ver todos los sistemas y solicitudes'),
('ENCARGADO', 'Encargado de Coordinacion', 'Ve sistemas de su coordinacion y dependientes'),
('DESARROLLADOR', 'Desarrollador', 'Ve sistemas donde participa como responsable o participante'),
('SOLICITANTE', 'Solicitante', 'Crea y consulta sus solicitudes');
GO

INSERT INTO dbo.tipo_solicitud (clave, nombre) VALUES
('NUEVO_SISTEMA', 'Nuevo sistema'),
('MODIFICACION', 'Modificacion'),
('URGENTE', 'Urgente'),
('REQUERIMIENTO', 'Requerimiento tecnico');
GO

INSERT INTO dbo.prioridad_solicitud (clave, nombre, peso) VALUES
('BAJA', 'Baja', 1),
('MEDIA', 'Media', 2),
('ALTA', 'Alta', 3),
('CRITICA', 'Critica', 4);
GO

INSERT INTO dbo.estado_solicitud (clave, nombre, es_terminal) VALUES
('REGISTRADA', 'Registrada', 0),
('EN_REVISION_PM', 'En revision PM', 0),
('APROBADA', 'Aprobada', 0),
('RECHAZADA', 'Rechazada', 1),
('ASIGNADA', 'Asignada', 0),
('EN_DESARROLLO', 'En desarrollo', 0),
('EN_PRUEBAS', 'En pruebas', 0),
('CERRADA', 'Cerrada', 1);
GO

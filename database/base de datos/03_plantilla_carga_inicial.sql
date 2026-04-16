/*
  Plantilla para completar informacion pendiente sin redisenar la BD.
  Ejecutar despues de crear el esquema en 01_esquema_bd.sql
*/

/* =========================
   1) CARGA DE AREAS/COORDINACIONES
   ========================= */

/*
  Paso recomendado:
  - Importar las 112 adscripciones a dbo.area.
  - Si se conoce jerarquia, capturar area_padre_id y nivel.
  - Si no se conoce, cargar temporalmente como COORDINACION nivel 2.
*/

/* Ejemplo */
INSERT INTO dbo.area (area_padre_id, clave, nombre, tipo_area, nivel)
VALUES
(NULL, 'COORD_SIST_INST', 'COORDINACION DE SISTEMAS INSTITUCIONALES', 'COORDINACION', 2),
(NULL, 'COORD_RH', 'COORDINACION DE RECURSOS HUMANOS', 'COORDINACION', 2);
GO

/* =========================
   2) CARGA DE USUARIOS Y ADSCRIPCION
   ========================= */

/*
  Reglas del proyecto:
  - Cada persona tiene una sola adscripcion activa.
  - Se debe registrar nombre, correo institucional, puesto, activo.
*/

/* Ejemplo */
INSERT INTO dbo.usuario (nombre, correo_institucional, puesto, activo)
VALUES
('Usuario PM', 'pm@isseg.gob.mx', 'Product Manager', 1),
('Encargado RH', 'encargado.rh@isseg.gob.mx', 'Encargado de Coordinacion', 1),
('Dev A', 'dev.a@isseg.gob.mx', 'Desarrollador', 1);
GO

/* Asignacion de roles */
INSERT INTO dbo.usuario_rol (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM dbo.usuario u
JOIN dbo.rol r ON r.clave = 'PM'
WHERE u.correo_institucional = 'pm@isseg.gob.mx';
GO

INSERT INTO dbo.usuario_rol (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM dbo.usuario u
JOIN dbo.rol r ON r.clave = 'ENCARGADO'
WHERE u.correo_institucional = 'encargado.rh@isseg.gob.mx';
GO

INSERT INTO dbo.usuario_rol (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM dbo.usuario u
JOIN dbo.rol r ON r.clave = 'DESARROLLADOR'
WHERE u.correo_institucional = 'dev.a@isseg.gob.mx';
GO

/* Adscripciones activas (una por usuario) */
INSERT INTO dbo.usuario_area (usuario_id, area_id, es_titular, activo)
SELECT u.usuario_id, a.area_id, 1, 1
FROM dbo.usuario u
JOIN dbo.area a ON a.clave = 'COORD_RH'
WHERE u.correo_institucional = 'encargado.rh@isseg.gob.mx';
GO

/* =========================
   3) CARGA DE SISTEMAS
   ========================= */

/*
  Si aun no existe inventario completo:
  - Crear los sistemas conocidos.
  - Los no registrados no seran visibles para encargados/desarrolladores.
*/

INSERT INTO dbo.sistema (clave, nombre, descripcion, activo)
VALUES
('SIS_NOMINA', 'Sistema de Nomina', 'Gestion de nomina institucional', 1),
('SIS_PRESTAMOS', 'Sistema de Prestamos', 'Gestion de prestamos y seguimiento', 1);
GO

/* =========================
   4) RELACION AREA-SISTEMA
   ========================= */

/*
  Regla de visibilidad:
  - Encargado ve sistemas de su coordinacion y dependientes.
  - PM ve todos.
  - Si no existe area_sistema, el sistema no se muestra a encargados.
*/

INSERT INTO dbo.area_sistema (area_id, sistema_id, activo)
SELECT a.area_id, s.sistema_id, 1
FROM dbo.area a
JOIN dbo.sistema s ON s.clave = 'SIS_NOMINA'
WHERE a.clave = 'COORD_RH';
GO

/* =========================
   5) DESARROLLADORES RESPONSABLES/PARTICIPANTES
   ========================= */

/*
  Regla de visibilidad:
  - Desarrollador solo ve sistemas donde esta asignado.
*/

INSERT INTO dbo.sistema_desarrollador (sistema_id, usuario_id, tipo_participacion, activo)
SELECT s.sistema_id, u.usuario_id, 'PARTICIPANTE', 1
FROM dbo.sistema s
JOIN dbo.usuario u ON u.correo_institucional = 'dev.a@isseg.gob.mx'
WHERE s.clave = 'SIS_NOMINA';
GO

/* =========================
   6) CONSULTAS BASE DE VISIBILIDAD
   ========================= */

/*
  A) Sistemas visibles para PM
*/
SELECT s.*
FROM dbo.sistema s
WHERE s.activo = 1;
GO

/*
  B) Sistemas visibles para encargado (su area + descendientes)
  Sustituir @correo_encargado.
*/
DECLARE @correo_encargado VARCHAR(180) = 'encargado.rh@isseg.gob.mx';

;WITH area_raiz AS (
    SELECT ua.area_id
    FROM dbo.usuario_area ua
    JOIN dbo.usuario u ON u.usuario_id = ua.usuario_id
    WHERE u.correo_institucional = @correo_encargado
      AND ua.activo = 1
      AND ua.fecha_fin IS NULL
),
area_desc AS (
    SELECT a.area_id
    FROM dbo.area a
    JOIN area_raiz r ON r.area_id = a.area_id
    UNION ALL
    SELECT h.area_id
    FROM dbo.area h
    JOIN area_desc d ON h.area_padre_id = d.area_id
)
SELECT DISTINCT s.*
FROM area_desc ad
JOIN dbo.area_sistema ats ON ats.area_id = ad.area_id AND ats.activo = 1
JOIN dbo.sistema s ON s.sistema_id = ats.sistema_id AND s.activo = 1
OPTION (MAXRECURSION 100);
GO

/*
  C) Sistemas visibles para desarrollador (responsable/participante)
  Sustituir @correo_dev.
*/
DECLARE @correo_dev VARCHAR(180) = 'dev.a@isseg.gob.mx';

SELECT DISTINCT s.*
FROM dbo.sistema s
JOIN dbo.sistema_desarrollador sd ON sd.sistema_id = s.sistema_id
JOIN dbo.usuario u ON u.usuario_id = sd.usuario_id
WHERE s.activo = 1
  AND sd.activo = 1
  AND sd.fecha_fin IS NULL
  AND u.correo_institucional = @correo_dev;
GO

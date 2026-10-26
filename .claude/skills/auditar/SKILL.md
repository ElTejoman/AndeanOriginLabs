---
name: auditar
description: Audita todos los cambios del sitio lanzando en paralelo los agentes auditor-construccion, auditor-movil y auditor-escritorio, y consolida un solo reporte. Úsalo cuando el usuario pida auditar, revisar o validar cambios, o antes de commitear/desplegar.
user-invocable: true
argument-hint: "[construccion|movil|escritorio] [alcance opcional: archivos, commit o rama]"
---

1. Determina el alcance: si el usuario pasó archivos, commit o rama, úsalo; si no, son los cambios sin commitear (`git status --short`). Si no hay cambios, dilo y pregunta qué auditar.
2. Si el argumento nombra solo uno o dos auditores (`construccion`, `movil`, `escritorio`), lanza solo esos. Si no, lanza **los tres en el mismo mensaje** (en paralelo) con la herramienta Agent:
   - `auditor-construccion`
   - `auditor-movil`
   - `auditor-escritorio`
   Pásale a cada uno el alcance exacto y la lista de archivos cambiados.
3. Cuando terminen, consolida en español:
   - una tabla con el veredicto de cada auditor;
   - los BLOQUEANTES de todos, sin duplicados, ordenados por severidad, con archivo:línea;
   - los avisos agrupados (UX/accesibilidad aparte de los de gusto, que son consultivos);
   - qué no se pudo verificar y por qué.
4. No arregles nada por tu cuenta: ofrece aplicar los bloqueantes y espera la respuesta del usuario.

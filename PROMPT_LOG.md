# Prompt Log

This document records important instruction prompts provided by the user for this application.
It excludes troubleshooting steps and minor confirmations.

## Log

| Date | Category | Prompt/Instruction |
|------|----------|-------------------|
| 2026-02-06 | Infrastructure | Setup NotebookLM MCP connection (Install, Config, Auth, Verify) |
| 2026-02-06 | Infrastructure | Retry NotebookLM MCP setup: Use uv/pip, locate config, auth, verify |

## Ideation Prompt (2026-02-06)

"Estoy trabajando en la ideación de una solución para registro de gastos. Tengo un par de hipótesis que quisiera validar mediante un MVP.

Hipotesis 1: El registro de gastos diarios es fastidioso porque requiere muchos pasos por lo que la gente no usa las aplicaciones tradicionales.

Hipotesis 2: Puedo usar datos de muchos usuarios de esta app de registros de gastos para generar valor detectando patrones de consumo, comportamientos según demografía, lugar, sexo, etc.

Lo que quiero es que me ayudes a hacer un promt para hacer una investigación profunda en notion que me oriente a entender realmente el problema para diseñar una solución que realmente genere valor, tanto a los usuarios que registran gastos, como las entidades que pueden hacer usos de los datos de consumo."

## MVP PRD Prompt (2026-02-06)

"ok, ya me hizo la investigación.

Ahora quiero que a partir de esa investigación me oriente en la construción de un MVP que me sirva para testear las hipotesis. Por lo que me gustaría tener un PRD con las mejores prácticas pero que sea directo y que incluya los siguientes 3 niveles:

Nivel 1: Logic & Analytical

Project Overview

¿Qué se necesita construir?

Problema a resolver y objetivo principal





Nivel 2: Computational



Key Features

Metas y milestones del producto

Funcionalidades core que definen el MVP

Criterios de éxito medibles

Nivel 3: Procedural

Detalles del Proyecto

Especificaciones técnicas detalladas

Flujos de usuario completos

Edge cases y manejo de errores

Requisitos de performance y seguridad



Dame un promtp para generar esto en notebolm"

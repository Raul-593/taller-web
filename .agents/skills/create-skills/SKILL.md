---
name: crearte-skills
description: Use when creating or updating an OpenCode skill under .opencode/skills/.
---

# Crear skills

- Una carpeta por skill: `.opencode/skills/<nombre>/SKILL.md`. El campo `name` del frontmatter debe ser idéntico a la carpeta (minúsculas, guiones simples, 1–64 caracteres).
- Frontmatter solo con campos válidos: `name` y `description` (1–1024 caracteres) obligatorios; `license`, `compatibility`, `metadata` opcionales.
- La `description` dice CUÁNDO usar la skill, no qué contiene.
- Cuerpo conciso y específico del stack; sin repetir lo que el agente ya sabe. Si crece, mueve detalle a archivos de referencia.

# Product Decisions & Trade-offs (MVP 3 días)

Este documento registra las decisiones arquitectónicas y de producto más importantes tomadas para asegurar la entrega de valor en el plazo de 3 días (MVP), enfocándonos directamente en el problema principal: **darle visibilidad y foco al equipo de cobranzas**.

## 1. Foco exclusivo en el Triaje (Lectura y Gestión Manual)
**Decisión:** El sistema será, en esta primera etapa, un CRM de cobranzas ligero enfocado en priorizar a quién llamar.
**Por qué:** El problema actual de la empresa no es la falta de automatización, sino el "ruido" (emails masivos ignorados) y la incapacidad de discriminar morosos. Aportamos más valor dándole a las 2 personas de finanzas una lista diaria priorizada e inteligente que intentando automatizar correos en 3 días.
**Qué dejamos fuera:** Envío automatizado de recordatorios por email o SMS.

## 2. Reglas de Negocio "Hardcodeadas" sobre Modelos Complejos
**Decisión:** La lógica de segmentación (Zombi, Startup, Grande) se manejará mediante reglas de código fijas evaluadas en tiempo de consulta en el backend (ej. `if segmento == "Grande" && diasMora < 75 then prioridad = baja`).
**Por qué:** Con 3 días, no hay tiempo para integrar un motor de reglas dinámico ni mucho menos IA/Machine Learning para predecir morosidad. Las reglas estáticas cubren el 80% de los dolores descritos por la CEO con el 20% del esfuerzo.
**Qué dejamos fuera:** Paneles de configuración para que el usuario cree reglas customizadas o modelos predictivos de riesgo de fuga.

## 3. Semilla de Datos (Seeding) en lugar de Integración con ERP
**Decisión:** El sistema asumirá que la base de datos ya está poblada. Proveeremos un script de seeding con datos sintéticos para levantar la aplicación y simular el estado actual de los 420 clientes de Northwind.
**Por qué:** Integrarse con el facturador electrónico, pasarelas de pago o el software contable es un proyecto de semanas por los desafíos de seguridad y consistencia de datos. 
**Qué dejamos fuera:** Endpoints de sincronización transaccional con sistemas externos (ERP/Bancos). En el futuro cercano, esto se reemplazará por una subida de CSV o una integración por API.

## 4. Gestión de Identidad y Roles Simplificada
**Decisión:** No implementaremos un sistema completo de autenticación (JWT robusto, recuperación de contraseña, roles complejos). El MVP asumirá un único entorno/perfil de "Analista de Finanzas".
**Por qué:** El equipo de finanzas está compuesto por solo 2 personas. Construir flujos de Login/Logout y RBAC (Role-Based Access Control) consumiría el 30% del tiempo de desarrollo sin resolver el problema core de la cobranza. 
**Qué dejamos fuera:** Login, registro, administración de usuarios y permisos granulares.

## 5. Decisiones de Stack Tecnológico (Backend y Frontend)
**Decisión:** Se utilizará un backend relacional (PostgreSQL) y React en el frontend, priorizando la estructura sobre la estética excesiva.
**Por qué:** Una base de datos relacional es ideal para modelar entidades interconectadas (Clientes -> Facturas -> Gestiones). React permite componentes reutilizables para listas y formularios de forma rápida. Nos enfocaremos en que los estados de carga y error existan y sean claros (UX funcional), en lugar de animaciones y diseño Pixel-Perfect.

## 6. Registro Simple de Gestión (Log de Notas)
**Decisión:** Implementar un registro de texto cronológico asociado a cada cliente para documentar las interacciones manuales.
**Por qué:** Al existir dos analistas en el equipo, es vital prevenir el trabajo duplicado (llamar al mismo cliente dos veces). Una simple tabla relacional de notas aporta alto valor operativo y de coordinación con un esfuerzo de desarrollo mínimo, completando el flujo del triaje.
**Qué dejamos fuera:** Sistemas complejos de ticketing, notificaciones de seguimiento programadas o asignación de tareas con fechas límite entre usuarios.

## 7. Mini-Dashboard de Visibilidad Gerencial
**Decisión:** Incluir tres KPIs estratégicos (Deuda Total Vencida, Deuda en Riesgo, Top 3 Deudores) en la vista principal, calculados en tiempo real.
**Por qué:** Resuelve directamente la inquietud de la CEO sobre la falta de visibilidad respecto al aumento de la mora. Utilizando consultas de agregación SQL sobre el modelo de datos existente, entregamos valor estratégico y contexto inmediato sin requerir herramientas analíticas externas.
**Qué dejamos fuera:** Gráficos históricos de evolución de mora, filtros complejos por rango de fechas o exportación de reportes a PDF/Excel.
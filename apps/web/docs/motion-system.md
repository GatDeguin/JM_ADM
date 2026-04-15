# Motion System — JM ADM (Web)

Esta guía define el comportamiento de animación en la app web para mantener una experiencia consistente, rápida y accesible.

## 1) Principios

1. **Claridad primero**: la animación explica cambios de estado y jerarquía; no es adorno.
2. **Respuesta inmediata**: interacciones primarias deben sentirse instantáneas (feedback en <200ms).
3. **Continuidad espacial**: al cambiar de ruta o panel, el usuario debe entender “de dónde viene” y “a dónde va”.
4. **Accesibilidad por defecto**: si el usuario prefiere reducir movimiento o el dispositivo es de bajo consumo, se minimiza o elimina animación.
5. **Consistencia sistemática**: usar tokens de tiempo/easing y utilidades ya definidas antes de crear variantes nuevas.

---

## 2) Tokens de timing y curvas

Usar siempre los tokens globales definidos en `globals.css`:

- `--motion-fast: 140ms` → hover, press, microfeedback.
- `--motion-base: 240ms` → transiciones de estado/elemento.
- `--motion-overlay: 360ms` → overlays, barras sticky, capas superiores.
- `--ease-premium: cubic-bezier(0.22, 1, 0.36, 1)` → curva principal para entradas/salidas suaves.

### Clases utilitarias de motion disponibles

- `motion-hover` (rápidas)
- `motion-state` (estado/intermedias)
- `motion-overlay` (capas superiores)
- `motion-route-stack`, `motion-route-layer`, `motion-route-enter`, `motion-route-exit`
- Presets de ruta: `motion-route-soft-fade`, `motion-route-elevate-in`, `motion-route-section-slide`

> Regla: **no hardcodear duración/easing** en componentes nuevos cuando exista clase o variable equivalente.

---

## 3) Do / Don’t

### ✅ Do

- Animar **opacidad + pequeños desplazamientos** (4–12px) en entradas/salidas.
- Dar feedback de click/tap con escala leve (`scale(0.98)`) en botones.
- Usar transiciones de color/sombra moderadas en hover/focus.
- Mantener animaciones de lista con stagger corto y cancelable.
- Desactivar o simplificar motion en `prefers-reduced-motion`.

### ❌ Don’t

- No animar layout costoso (anchos/altos complejos en loops).
- No encadenar múltiples animaciones largas en una misma acción.
- No usar rebotes exagerados para flujos administrativos.
- No depender solo de animación para comunicar estado (siempre acompañar con color/texto/icono).
- No introducir timings/curvas aisladas sin justificar necesidad del patrón.

---

## 4) Patrones de motion

## 4.1 Intro de marca

**Componente:** `BrandIntro`.

- Muestra overlay de bienvenida una sola vez por sesión (o según `mode`).
- Se omite cuando hay `prefers-reduced-motion`.
- Duración total de visibilidad actual: ~1800ms con animación de entrada de ~900ms.

### Uso recomendado

- Mostrar solo al ingreso para reforzar identidad.
- Evitar repetir en navegación interna.

---

## 4.2 Route transitions

**Orquestación principal:** `Layout`.

`Layout` monta una pila de rutas (`motion-route-stack`) con capa saliente y entrante:

- `motion-route-exit` para contenido saliente.
- `motion-route-enter` para contenido entrante.
- `transitionPreset` controla el estilo:
  - `soft-fade` (por defecto): más neutral.
  - `elevate-in`: útil para cambios de contexto principal.
  - `section-slide`: útil en navegación lateral entre secciones pares.

`Layout` también desactiva motion cuando detecta:

- `prefers-reduced-motion: reduce`
- `navigator.connection.saveData`
- hardware limitado (`hardwareConcurrency <= 2` o `deviceMemory <= 2`)

### Uso recomendado

- Para pantallas CRUD estándar, usar `soft-fade`.
- Para saltos de “nivel” (ej. dashboard → módulo), `elevate-in`.
- Para navegación secuencial entre secciones hermanas, `section-slide`.

---

## 4.3 Loaders

**Componente:** `Skeletons` (integrado en `DataTable`).

Patrón observado:

- Mientras `loading`, mostrar skeleton en capa visible.
- Al resolver, crossfade de skeleton → contenido real.
- En refetch con datos previos, mantener tabla y mostrar estado “Actualizando datos…”.

### Uso recomendado

- Priorizar skeleton cuando ya se conoce la estructura final (tablas/cards).
- Mantener una altura mínima de contenedor para evitar layout shift.

---

## 4.4 Empty skeletons

No duplicar loaders diferentes por módulo si la intención visual es la misma.

- Reusar `Skeletons variant="table"` para listados.
- Ajustar `rows/columns/density` según densidad de cada pantalla.
- Mantener ritmo de transición con `duration-300 ease-out` o tokens de motion del sistema.

---

## 4.5 Toasts

**Componente clave relacionado:** `Toasts`.

Lineamientos para toasts:

- Entrada: fade + translateY corto (6–10px).
- Salida: fade rápido sin bloquear interacción.
- Auto-dismiss moderado (3–6s, según severidad).
- Deben respetar `prefers-reduced-motion` (sin desplazamiento, solo cambio de opacidad o aparición instantánea).

> Si un toast confirma acción crítica, acompañar con cambio persistente en UI (badge, estado de fila, etc.).

---

## 4.6 Microinteracciones de botones

Clases existentes:

- `.btn-primary`
- `.btn-secondary`

Comportamiento actual:

- transición de color/sombra/transform con `--motion-fast` y `--ease-premium`.
- estado `:active` con `scale(0.98)` y reducción de sombra para sensación táctil.

### Reglas

- Mantener feedback en press/click siempre visible.
- En acciones destructivas, evitar animaciones “divertidas”; usar feedback sobrio + confirmación clara.

---

## 4.7 Microinteracciones de navegación

**Componentes:** `Topbar`, `Sidebar`, navegación en `Layout`.

- `Topbar` ajusta densidad visual según scroll (`py-3` → `py-2`, `text-lg` → `text-base`) con transiciones suaves.
- `Sidebar` usa:
  - píldora activa animada (posición/alto/opacidad),
  - stagger por ítem (`--sidebar-stagger-delay`),
  - animación de icono activo.
- En navegación entre rutas, usar transición de contenido en `Layout` como patrón único.

---

## 5) Referencia rápida de clases de `globals.css`

## Tokens

- `--motion-fast`
- `--motion-base`
- `--motion-overlay`
- `--ease-premium`

## Utilidades de movimiento

- `motion-hover`
- `motion-state`
- `motion-overlay`
- `motion-route-*`
- `animate-inline-status`
- `animate-row-highlight-new`
- `animate-row-highlight-updated`
- `animate-sidebar-item-enter`
- `animate-sidebar-icon-active`

## Superficies (impactan percepción de movimiento)

- `glass-bg`
- `glass-surface`
- `surface-blur-soft`
- `surface-blur-strong`
- `elevation-1|2|3`
- `surface-noise`
- `glass-edge-highlight`

---

## 6) Componentes clave y responsabilidades

- `Layout`: orquesta transiciones entre rutas y fallback por accesibilidad/rendimiento.
- `Topbar`: microtransiciones al hacer scroll, variación de densidad y elevación.
- `Sidebar`: realce de item activo + stagger de entrada.
- `DataTable`: skeleton/loading/error/empty + selección de filas con transiciones de estado.
- `BrandIntro`: animación de bienvenida controlada por sesión/preferencia.

---

## 7) Checklist de QA visual

## Matriz mínima

1. **Desktop** (>= md)
2. **Mobile** (< md)
3. **Tema light**
4. **Tema dark**
5. **Reduce motion activado**
6. **Low-power/data saver**

## Qué validar en cada combinación

- [ ] No hay saltos bruscos de layout al cargar datos.
- [ ] Las transiciones de ruta no duplican contenido más allá de su ventana temporal.
- [ ] Botones primarios/secundarios tienen feedback claro en hover/focus/active.
- [ ] Sidebar/Topbar mantienen legibilidad durante animaciones.
- [ ] Skeletons desaparecen correctamente al llegar datos.
- [ ] Toasts no tapan acciones críticas ni quedan fuera de viewport.
- [ ] En reduce motion: desaparecen desplazamientos innecesarios y la UI sigue entendible.
- [ ] En low-power: navegación usable sin jank ni bloqueos de interacción.

## Criterios de aceptación

- Tiempo percibido de respuesta en interacciones primarias: inmediato (feedback <200ms).
- Ninguna animación bloquea input de usuario.
- No hay animaciones decorativas sin aportar contexto funcional.

---

## 8) Implementación mínima por tipo de pantalla

## A) Pantalla de listado CRUD (desktop-first)

Objetivo: tabla con carga progresiva, feedback de acciones y transición de ruta suave.

```tsx
<Layout title="Productos" transitionPreset="soft-fade">
  <DataTable
    title="Productos"
    columns={columns}
    rows={rows}
    rowId={(r) => r.id}
    loading={loading}
    onCreate={openCreate}
    onEdit={openEdit}
    onDelete={openDelete}
  />
</Layout>
```

Claves:

- `Layout` controla transición entre rutas.
- `DataTable` aporta skeleton/empty/error y microestados.

## B) Pantalla de navegación seccional (desktop)

Objetivo: cambio claro entre secciones hermanas en menú lateral.

```tsx
<Layout title="Técnica" transitionPreset="section-slide">
  <section className="card-base motion-state">
    {/* Contenido seccional */}
  </section>
</Layout>
```

Claves:

- `section-slide` para continuidad lateral.
- `motion-state` para bloques internos.

## C) Pantalla mobile enfocada a tareas rápidas

Objetivo: reducir complejidad visual y mantener feedback táctil.

```tsx
<Layout title="Inicio" transitionPreset="soft-fade">
  <section className="space-y-3">
    <button className="btn-primary w-full">Acción principal</button>
    <button className="btn-secondary w-full">Acción secundaria</button>
  </section>
</Layout>
```

Claves:

- Botones full-width con feedback inmediato.
- Evitar animaciones largas en pantallas pequeñas.

## D) Pantalla de entrada/splash

Objetivo: reforzar marca sin penalizar rendimiento.

```tsx
<>
  <BrandIntro mode="once-per-session" />
  <Layout title="Inicio">{/* contenido */}</Layout>
</>
```

Claves:

- No repetir intro en cada ruta.
- Respetar `prefers-reduced-motion`.

---

## 9) Gobernanza del sistema de motion

Antes de agregar nueva animación:

1. Confirmar que no exista clase/utilidad equivalente en `globals.css`.
2. Elegir token de duración (`fast/base/overlay`) y curva estándar (`ease-premium`).
3. Definir fallback en `reduce motion`.
4. Verificar impacto en mobile y low-power.
5. Documentar en este archivo si el patrón se vuelve reutilizable.

Si una animación no mejora comprensión, feedback o continuidad: **no se incorpora**.

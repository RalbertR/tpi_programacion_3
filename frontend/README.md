# Food Store — Frontend (Parte 1)

Frontend web del sistema Food Store, implementado con Vite y TypeScript. Consume datos desde archivos `.json` locales mediante `fetch()`. Vive en `frontend/` dentro del monorepo; el backend (Parte 2) está en `../backend/`.

**Tecnologías:** Vite 7, TypeScript, HTML5, CSS3 plano (sin frameworks). Arquitectura multi-page app (una carpeta por página con su propio `.html` + `.ts`).

## Instalación y ejecución

```bash
cd frontend
npm install
npm run dev
```

El servidor queda disponible en `http://localhost:5173`. Para build de producción:

```bash
npm run build
```

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@food.com | admin123 |
| Cliente | cliente@food.com | cliente123 |

## Persistencia (localStorage)

| Clave | Contenido |
|-------|-----------|
| `foodstore_sesion` | Sesión activa (sin password) |
| `foodstore_carrito` | Items del carrito |
| `foodstore_pedidos_nuevos` | Pedidos creados desde el checkout |
| `foodstore_usuarios_nuevos` | Usuarios registrados desde la app |

Los datos base (categorias, productos, pedidos del JSON) son de solo lectura. Las operaciones del panel admin (crear/editar/eliminar) se aplican solo en memoria y se pierden al recargar la página, tal como indica la consigna para esta iteración.

## Constante de envío

`ENVIO = 0` definida en `src/config.ts`. El total mostrado en checkout es `subtotal + ENVIO`.

## Cómo limpiar el estado para una demo en limpio

Abrir DevTools → Application → Local Storage → `http://localhost:5173` → Clear all.

## Estructura principal

```
src/
  config.ts           # Constantes (ENVIO, rutas)
  style.css           # Estilos globales
  types/index.ts      # Interfaces y tipos TS
  utils/              # fetchJson, auth, cart, orders, format, dom
  pages/
    auth/login/       # login.html + login.ts
    auth/register/    # register.html + register.ts
    store/home/       # Catalogo con filtros y busqueda
    store/productDetail/ # Detalle + agregar al carrito
    store/cart/       # Carrito + checkout
    client/orders/    # Mis pedidos (cliente)
    admin/adminHome/  # Dashboard con estadisticas
    admin/categories/ # CRUD categorias (en memoria)
    admin/products/   # CRUD productos (en memoria)
    admin/orders/     # Gestion de pedidos (filtro + cambio de estado)
```

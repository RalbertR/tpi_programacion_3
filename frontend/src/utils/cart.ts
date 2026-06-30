import type { ItemCarrito, Producto } from "../types";

const CLAVE_CARRITO = "foodstore_carrito";

export function getCarrito(): ItemCarrito[] {
  const raw = localStorage.getItem(CLAVE_CARRITO);
  return raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
}

function guardarCarrito(items: ItemCarrito[]): void {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
}

export function agregarAlCarrito(producto: Producto, cantidad: number): void {
  const items = getCarrito();
  const existente = items.find((i) => i.productoId === producto.id);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    items.push({
      productoId: producto.id,
      cantidad,
      precioUnitario: producto.precio,
      nombre: producto.nombre,
      imagen: producto.imagen,
    });
  }
  guardarCarrito(items);
}

export function actualizarCantidad(productoId: number, cantidad: number): void {
  const items = getCarrito()
    .map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
    .filter((i) => i.cantidad > 0);
  guardarCarrito(items);
}

export function quitarDelCarrito(productoId: number): void {
  guardarCarrito(getCarrito().filter((i) => i.productoId !== productoId));
}

export function vaciarCarrito(): void {
  localStorage.removeItem(CLAVE_CARRITO);
}

export function totalCarrito(items: ItemCarrito[]): number {
  return items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
}

export function cantidadItemsCarrito(items: ItemCarrito[]): number {
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

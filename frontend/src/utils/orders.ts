import type { EstadoPedido, Pedido } from "../types";
import { fetchJson } from "./fetchJson";

const CLAVE_PEDIDOS_NUEVOS = "foodstore_pedidos_nuevos";

export function getPedidosNuevos(): Pedido[] {
  const raw = localStorage.getItem(CLAVE_PEDIDOS_NUEVOS);
  return raw ? (JSON.parse(raw) as Pedido[]) : [];
}

function guardarPedidosNuevos(pedidos: Pedido[]): void {
  localStorage.setItem(CLAVE_PEDIDOS_NUEVOS, JSON.stringify(pedidos));
}

export function guardarPedidoNuevo(pedido: Pedido): void {
  const pedidos = getPedidosNuevos();
  pedidos.push(pedido);
  guardarPedidosNuevos(pedidos);
}

export function actualizarEstadoPedidoNuevo(idPedido: number, estado: EstadoPedido): boolean {
  const pedidos = getPedidosNuevos();
  const pedido = pedidos.find((p) => p.id === idPedido);
  if (!pedido) {
    return false;
  }
  pedido.estado = estado;
  guardarPedidosNuevos(pedidos);
  return true;
}

export async function obtenerTodosLosPedidos(): Promise<Pedido[]> {
  const base = await fetchJson<Pedido[]>("/data/pedidos.json");
  return [...base, ...getPedidosNuevos()];
}

export async function generarIdPedidoNuevo(): Promise<number> {
  const pedidos = await obtenerTodosLosPedidos();
  const ids = pedidos.map((p) => p.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

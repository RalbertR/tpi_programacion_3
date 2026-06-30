export type Rol = "ADMIN" | "USUARIO";
export type EstadoPedido = "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";
export type FormaPago = "TARJETA" | "TRANSFERENCIA" | "EFECTIVO";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  eliminado: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  eliminado: boolean;
  categoriaId: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  password: string;
  rol: Rol;
}

export interface DetallePedido {
  idProducto: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  formaPago: FormaPago;
  idUsuario: number;
  detalles: DetallePedido[];
}

export interface Sesion {
  idUsuario: number;
  nombre: string;
  apellido: string;
  mail: string;
  rol: Rol;
}

export interface ItemCarrito {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  nombre: string;
  imagen: string;
}

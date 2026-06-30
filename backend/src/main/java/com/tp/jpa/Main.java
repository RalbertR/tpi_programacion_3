package com.tp.jpa;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.DetallePedido;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    private static final Scanner sc = new Scanner(System.in);

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        int opcion;
        do {
            System.out.println("\n===== FOOD STORE - MENU PRINCIPAL =====");
            System.out.println("1. Gestionar Categorias");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> menuCategorias();
                case 2 -> menuProductos();
                case 3 -> menuUsuarios();
                case 4 -> menuPedidos();
                case 5 -> menuReportes();
                case 0 -> System.out.println("Saliendo del sistema...");
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);

        JPAUtil.close();
        System.out.println("Aplicacion finalizada.");
    }

    // ─────────────────────── MENU CATEGORIAS ───────────────────────

    private static void menuCategorias() {
        int opcion;
        do {
            System.out.println("\n---------- Categorias ----------");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> altaCategoria();
                case 2 -> modificarCategoria();
                case 3 -> bajaCategoria();
                case 4 -> listarCategorias();
                case 0 -> System.out.println("Volviendo al menu principal...");
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);
    }

    private static void altaCategoria() {
        System.out.println("\n-- Alta de Categoria --");
        String nombre = leerTextoObligatorio("Nombre: ");
        System.out.print("Descripcion (opcional): ");
        String descripcion = sc.nextLine().trim();

        Categoria nueva = Categoria.builder().nombre(nombre).descripcion(descripcion).build();
        Categoria guardada = categoriaRepo.guardar(nueva);
        System.out.println("Categoria guardada con ID: " + guardada.getId());
    }

    private static void modificarCategoria() {
        System.out.println("\n-- Modificacion de Categoria --");
        listarCategorias();
        Long id = leerLong("ID de la categoria a modificar: ");

        Optional<Categoria> resultado = categoriaRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe una categoria activa con ID " + id + ".");
            return;
        }

        Categoria categoria = resultado.get();
        System.out.println("Valores actuales -> Nombre: " + categoria.getNombre()
                + " | Descripcion: " + categoria.getDescripcion());
        System.out.println("(Deje en blanco para conservar el valor actual)");

        System.out.print("Nuevo nombre [" + categoria.getNombre() + "]: ");
        String nombre = sc.nextLine().trim();
        if (!nombre.isEmpty()) {
            categoria.setNombre(nombre);
        }

        System.out.print("Nueva descripcion [" + categoria.getDescripcion() + "]: ");
        String descripcion = sc.nextLine().trim();
        if (!descripcion.isEmpty()) {
            categoria.setDescripcion(descripcion);
        }

        categoriaRepo.guardar(categoria);
        System.out.println("Categoria actualizada correctamente.");
    }

    private static void bajaCategoria() {
        System.out.println("\n-- Baja logica de Categoria --");
        listarCategorias();
        Long id = leerLong("ID de la categoria a eliminar: ");

        Optional<Categoria> resultado = categoriaRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe una categoria activa con ID " + id + ".");
            return;
        }
        String nombre = resultado.get().getNombre();

        categoriaRepo.eliminarLogico(id);
        System.out.println("Categoria '" + nombre + "' dada de baja correctamente.");
    }

    private static void listarCategorias() {
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas.");
            return;
        }
        System.out.println("\n  ID | Nombre               | Descripcion");
        System.out.println("  ---|----------------------|--------------------------------");
        for (Categoria c : categorias) {
            System.out.printf("  %-3d| %-20s | %s%n",
                    c.getId(), c.getNombre(), c.getDescripcion());
        }
    }

    // ─────────────────────── MENU PRODUCTOS ────────────────────────

    private static void menuProductos() {
        int opcion;
        do {
            System.out.println("\n---------- Productos ----------");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> altaProducto();
                case 2 -> modificarProducto();
                case 3 -> bajaProducto();
                case 4 -> listarProductos();
                case 0 -> System.out.println("Volviendo al menu principal...");
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);
    }

    private static void altaProducto() {
        System.out.println("\n-- Alta de Producto --");

        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas. Cree una categoria primero.");
            return;
        }
        listarCategorias();
        Long catId = leerLong("ID de la categoria: ");

        Optional<Categoria> catResultado = categoriaRepo.buscarPorId(catId);
        if (catResultado.isEmpty() || catResultado.get().isEliminado()) {
            System.out.println("Error: categoria no valida.");
            return;
        }
        Categoria categoria = catResultado.get();

        String nombre = leerTextoObligatorio("Nombre del producto: ");
        System.out.print("Descripcion (opcional): ");
        String descripcion = sc.nextLine().trim();
        double precio = leerDoublePositivo("Precio: ");
        int stock = leerEnteroNoNegativo("Stock: ");
        System.out.print("Imagen (URL, opcional): ");
        String imagen = sc.nextLine().trim();
        boolean disponible = leerConfirmacion("Disponible (S/n, default S): ", true);

        Producto nuevo = Producto.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .stock(stock)
                .imagen(imagen)
                .disponible(disponible)
                .build();

        Producto guardado = categoriaRepo.agregarProducto(categoria.getId(), nuevo);
        System.out.println("Producto guardado con ID: " + guardado.getId()
                + " en la categoria '" + categoria.getNombre() + "'.");
    }

    private static void modificarProducto() {
        System.out.println("\n-- Modificacion de Producto --");
        listarProductos();
        Long id = leerLong("ID del producto a modificar: ");

        Optional<Producto> resultado = productoRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe un producto activo con ID " + id + ".");
            return;
        }

        Producto producto = resultado.get();
        System.out.println("Valores actuales:");
        System.out.println("  Nombre:      " + producto.getNombre());
        System.out.println("  Precio:      $" + producto.getPrecio());
        System.out.println("  Stock:       " + producto.getStock());
        System.out.println("  Descripcion: " + producto.getDescripcion());
        System.out.println("(Deje en blanco para conservar el valor actual)");

        System.out.print("Nuevo nombre [" + producto.getNombre() + "]: ");
        String nombre = sc.nextLine().trim();
        if (!nombre.isEmpty()) {
            producto.setNombre(nombre);
        }

        System.out.print("Nuevo precio [" + producto.getPrecio() + "]: ");
        String precioStr = sc.nextLine().trim();
        if (!precioStr.isEmpty()) {
            try {
                double precio = Double.parseDouble(precioStr.replace(",", "."));
                if (precio > 0) {
                    producto.setPrecio(precio);
                } else {
                    System.out.println("Precio invalido: debe ser mayor a 0. Se conserva el valor actual.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Precio invalido. Se conserva el valor actual.");
            }
        }

        System.out.print("Nuevo stock [" + producto.getStock() + "]: ");
        String stockStr = sc.nextLine().trim();
        if (!stockStr.isEmpty()) {
            try {
                int stock = Integer.parseInt(stockStr);
                if (stock >= 0) {
                    producto.setStock(stock);
                } else {
                    System.out.println("Stock invalido: debe ser >= 0. Se conserva el valor actual.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Stock invalido. Se conserva el valor actual.");
            }
        }

        productoRepo.guardar(producto);
        System.out.println("Producto actualizado correctamente.");
    }

    private static void bajaProducto() {
        System.out.println("\n-- Baja logica de Producto --");
        listarProductos();
        Long id = leerLong("ID del producto a eliminar: ");

        Optional<Producto> resultado = productoRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe un producto activo con ID " + id + ".");
            return;
        }
        String nombre = resultado.get().getNombre();

        productoRepo.eliminarLogico(id);
        System.out.println("Producto '" + nombre + "' dado de baja correctamente.");
    }

    private static void listarProductos() {
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas.");
            return;
        }
        boolean hayProductos = false;
        for (Categoria categoria : categorias) {
            List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(categoria.getId());
            if (productos.isEmpty()) {
                continue;
            }
            hayProductos = true;
            System.out.println("\n== " + categoria.getNombre() + " ==");
            System.out.println("  ID | Nombre               |    Precio | Stock | Disponible");
            System.out.println("  ---|----------------------|-----------|-------|-----------");
            for (Producto p : productos) {
                System.out.printf("  %-3d| %-20s | %9.2f | %5d | %s%n",
                        p.getId(), p.getNombre(), p.getPrecio(), p.getStock(), p.getDisponible());
            }
        }
        if (!hayProductos) {
            System.out.println("No hay productos activos.");
        }
    }

    // ─────────────────────── MENU USUARIOS ─────────────────────────

    private static void menuUsuarios() {
        int opcion;
        do {
            System.out.println("\n---------- Usuarios ----------");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("5. Buscar por mail");
            System.out.println("0. Volver");
            opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> altaUsuario();
                case 2 -> modificarUsuario();
                case 3 -> bajaUsuario();
                case 4 -> listarUsuarios();
                case 5 -> buscarUsuarioPorMail();
                case 0 -> System.out.println("Volviendo al menu principal...");
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);
    }

    private static void altaUsuario() {
        System.out.println("\n-- Alta de Usuario --");
        String nombre = leerTextoObligatorio("Nombre: ");
        String apellido = leerTextoObligatorio("Apellido: ");
        String mail = leerTextoObligatorio("Mail: ");

        if (usuarioRepo.buscarPorMail(mail).isPresent()) {
            System.out.println("Error: ya existe un usuario activo con ese mail.");
            return;
        }

        System.out.print("Celular (opcional): ");
        String celular = sc.nextLine().trim();
        String contrasena = leerTextoObligatorio("Contrasena: ");
        Rol rol = seleccionarRol();

        Usuario nuevo = Usuario.builder()
                .nombre(nombre)
                .apellido(apellido)
                .mail(mail)
                .celular(celular)
                .contraseña(contrasena)
                .rol(rol)
                .build();

        Usuario guardado = usuarioRepo.guardar(nuevo);
        System.out.println("Usuario guardado con ID: " + guardado.getId());
    }

    private static void modificarUsuario() {
        System.out.println("\n-- Modificacion de Usuario --");
        listarUsuarios();
        Long id = leerLong("ID del usuario a modificar: ");

        Optional<Usuario> resultado = usuarioRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe un usuario activo con ID " + id + ".");
            return;
        }

        Usuario usuario = resultado.get();
        System.out.println("Valores actuales:");
        System.out.println("  Nombre:   " + usuario.getNombre());
        System.out.println("  Apellido: " + usuario.getApellido());
        System.out.println("  Mail:     " + usuario.getMail());
        System.out.println("  Celular:  " + usuario.getCelular());
        System.out.println("  Rol:      " + usuario.getRol());
        System.out.println("(Deje en blanco para conservar el valor actual)");

        System.out.print("Nuevo nombre [" + usuario.getNombre() + "]: ");
        String nombre = sc.nextLine().trim();
        if (!nombre.isEmpty()) {
            usuario.setNombre(nombre);
        }

        System.out.print("Nuevo apellido [" + usuario.getApellido() + "]: ");
        String apellido = sc.nextLine().trim();
        if (!apellido.isEmpty()) {
            usuario.setApellido(apellido);
        }

        System.out.print("Nuevo mail [" + usuario.getMail() + "]: ");
        String mail = sc.nextLine().trim();
        if (!mail.isEmpty() && !mail.equals(usuario.getMail())) {
            Optional<Usuario> existente = usuarioRepo.buscarPorMail(mail);
            if (existente.isPresent() && !existente.get().getId().equals(usuario.getId())) {
                System.out.println("Error: el mail ya esta en uso por otro usuario. "
                        + "Se cancela la modificacion.");
                return;
            }
            usuario.setMail(mail);
        }

        System.out.print("Nuevo celular [" + usuario.getCelular() + "]: ");
        String celular = sc.nextLine().trim();
        if (!celular.isEmpty()) {
            usuario.setCelular(celular);
        }

        System.out.print("Nueva contrasena (deje en blanco para conservar la actual): ");
        String contrasena = sc.nextLine().trim();
        if (!contrasena.isEmpty()) {
            usuario.setContraseña(contrasena);
        }

        usuarioRepo.guardar(usuario);
        System.out.println("Usuario actualizado correctamente.");
    }

    private static void bajaUsuario() {
        System.out.println("\n-- Baja logica de Usuario --");
        listarUsuarios();
        Long id = leerLong("ID del usuario a eliminar: ");

        Optional<Usuario> resultado = usuarioRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe un usuario activo con ID " + id + ".");
            return;
        }
        Usuario usuario = resultado.get();
        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();

        usuarioRepo.eliminarLogico(id);
        System.out.println("Usuario '" + nombreCompleto + "' dado de baja correctamente. "
                + "Sus pedidos permanecen en el sistema.");
    }

    private static void listarUsuarios() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos.");
            return;
        }
        System.out.println("\n  ID | Nombre completo      | Mail                      | Rol");
        System.out.println("  ---|----------------------|---------------------------|--------");
        for (Usuario u : usuarios) {
            String nombreCompleto = u.getNombre() + " " + u.getApellido();
            System.out.printf("  %-3d| %-20s | %-25s | %s%n",
                    u.getId(), nombreCompleto, u.getMail(), u.getRol());
        }
    }

    private static void buscarUsuarioPorMail() {
        System.out.println("\n-- Buscar Usuario por Mail --");
        String mail = leerTextoObligatorio("Mail: ");

        Optional<Usuario> resultado = usuarioRepo.buscarPorMail(mail);
        if (resultado.isEmpty()) {
            System.out.println("No existe un usuario activo con ese mail.");
            return;
        }
        Usuario usuario = resultado.get();
        System.out.println("ID:       " + usuario.getId());
        System.out.println("Nombre:   " + usuario.getNombre() + " " + usuario.getApellido());
        System.out.println("Mail:     " + usuario.getMail());
        System.out.println("Celular:  " + usuario.getCelular());
        System.out.println("Rol:      " + usuario.getRol());
    }

    // ─────────────────────── MENU PEDIDOS ──────────────────────────

    private static void menuPedidos() {
        int opcion;
        do {
            System.out.println("\n---------- Pedidos ----------");
            System.out.println("1. Alta de pedido");
            System.out.println("2. Cambiar estado");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("5. Pedidos por usuario");
            System.out.println("6. Pedidos por estado");
            System.out.println("0. Volver");
            opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> altaPedido();
                case 2 -> cambiarEstadoPedido();
                case 3 -> bajaPedido();
                case 4 -> listarPedidos();
                case 5 -> pedidosPorUsuario();
                case 6 -> pedidosPorEstado();
                case 0 -> System.out.println("Volviendo al menu principal...");
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);
    }

    private static void altaPedido() {
        System.out.println("\n-- Alta de Pedido --");

        List<Usuario> usuariosActivos = usuarioRepo.listarActivos();
        if (usuariosActivos.isEmpty()) {
            System.out.println("No hay usuarios activos. Cree un usuario primero.");
            return;
        }
        listarUsuarios();
        Long idUsuario = leerLong("ID del usuario: ");
        Optional<Usuario> usuarioResultado = usuarioRepo.buscarPorId(idUsuario);
        if (usuarioResultado.isEmpty() || usuarioResultado.get().isEliminado()) {
            System.out.println("Error: usuario no valido.");
            return;
        }

        FormaPago formaPago = seleccionarFormaPago();

        Map<Long, Integer> itemsTemporales = new LinkedHashMap<>();
        boolean seguirAgregando = true;
        while (seguirAgregando) {
            List<Producto> catalogo = productoRepo.listarActivos().stream()
                    .filter(p -> Boolean.TRUE.equals(p.getDisponible()) && p.getStock() > 0)
                    .toList();
            if (catalogo.isEmpty()) {
                System.out.println("No hay productos disponibles con stock.");
                break;
            }
            System.out.println("\nCatalogo disponible:");
            System.out.println("  ID | Nombre               |    Precio | Stock");
            System.out.println("  ---|----------------------|-----------|------");
            for (Producto p : catalogo) {
                System.out.printf("  %-3d| %-20s | %9.2f | %d%n",
                        p.getId(), p.getNombre(), p.getPrecio(), p.getStock());
            }

            Long idProducto = leerLong("ID del producto a agregar: ");
            Producto elegido = catalogo.stream()
                    .filter(p -> p.getId().equals(idProducto))
                    .findFirst()
                    .orElse(null);
            if (elegido == null) {
                System.out.println("Error: producto no valido o sin stock disponible.");
            } else {
                int cantidad = leerEnteroPositivo("Cantidad: ");
                int yaPedido = itemsTemporales.getOrDefault(idProducto, 0);
                if (yaPedido + cantidad > elegido.getStock()) {
                    System.out.println("Stock insuficiente. Disponible: " + elegido.getStock()
                            + ", ya solicitado en este pedido: " + yaPedido);
                } else {
                    itemsTemporales.merge(idProducto, cantidad, Integer::sum);
                    System.out.println("Producto agregado al pedido.");
                }
            }

            seguirAgregando = leerConfirmacion("Agregar otro producto? (S/n): ", true);
        }

        if (itemsTemporales.isEmpty()) {
            System.out.println("Pedido cancelado: debe tener al menos un producto.");
            return;
        }

        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();

            Usuario usuarioGestionado = em.find(Usuario.class, idUsuario);
            Pedido pedido = Pedido.builder()
                    .fecha(LocalDate.now())
                    .estado(EstadoPedido.PENDIENTE)
                    .formaPago(formaPago)
                    .build();

            for (Map.Entry<Long, Integer> item : itemsTemporales.entrySet()) {
                Producto producto = em.find(Producto.class, item.getKey());
                if (producto == null || producto.isEliminado()
                        || !Boolean.TRUE.equals(producto.getDisponible())
                        || producto.getStock() < item.getValue()) {
                    throw new IllegalStateException("Stock insuficiente o producto no disponible: "
                            + (producto != null ? producto.getNombre() : item.getKey()));
                }
                pedido.addDetallePedido(item.getValue(), producto);
                producto.setStock(producto.getStock() - item.getValue());
            }

            pedido.calcularTotal();
            em.persist(pedido);
            usuarioGestionado.addPedido(pedido);
            tx.commit();

            System.out.println("\nPedido guardado con ID: " + pedido.getId());
            System.out.println("Usuario: " + usuarioGestionado.getNombre()
                    + " " + usuarioGestionado.getApellido());
            System.out.println("Forma de pago: " + pedido.getFormaPago());
            System.out.println("Detalle:");
            for (DetallePedido d : pedido.getDetalles()) {
                System.out.printf("  %-20s x%-3d = %s%n",
                        d.getProducto().getNombre(), d.getCantidad(), formatearMoneda(d.getSubtotal()));
            }
            System.out.println("Total: " + formatearMoneda(pedido.getTotal()));
        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            System.out.println("Error al crear el pedido, se cancelo la operacion: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private static void cambiarEstadoPedido() {
        System.out.println("\n-- Cambiar Estado de Pedido --");
        listarPedidos();
        Long id = leerLong("ID del pedido: ");

        Optional<Pedido> resultado = pedidoRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe un pedido activo con ID " + id + ".");
            return;
        }

        Pedido pedido = resultado.get();
        System.out.println("Estado actual: " + pedido.getEstado());
        EstadoPedido nuevoEstado = seleccionarEstadoPedido();
        pedido.setEstado(nuevoEstado);
        pedidoRepo.guardar(pedido);
        System.out.println("Pedido " + pedido.getId() + " actualizado a estado " + nuevoEstado + ".");
    }

    private static void bajaPedido() {
        System.out.println("\n-- Baja logica de Pedido --");
        listarPedidos();
        Long id = leerLong("ID del pedido a eliminar: ");

        Optional<Pedido> resultado = pedidoRepo.buscarPorId(id);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: no existe un pedido activo con ID " + id + ".");
            return;
        }
        Pedido pedido = resultado.get();

        pedidoRepo.eliminarLogico(id);
        System.out.println("Pedido " + pedido.getId() + " dado de baja correctamente. Total: "
                + formatearMoneda(pedido.getTotal()) + ". El stock de los productos no se restaura.");
    }

    private static void listarPedidos() {
        List<Pedido> pedidos = pedidoRepo.listarActivos();
        if (pedidos.isEmpty()) {
            System.out.println("No hay pedidos activos.");
            return;
        }
        System.out.println("\n  ID | Fecha      | Estado     | Forma de pago  | Usuario              | Total");
        System.out.println("  ---|------------|------------|----------------|----------------------|-----------");
        for (Pedido p : pedidos) {
            System.out.printf("  %-3d| %-10s | %-10s | %-14s | %-20s | %s%n",
                    p.getId(), p.getFecha(), p.getEstado(), p.getFormaPago(),
                    nombreUsuarioDePedido(p.getId()), formatearMoneda(p.getTotal()));
        }
    }

    private static void pedidosPorUsuario() {
        System.out.println("\n-- Pedidos por Usuario --");
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos.");
            return;
        }
        listarUsuarios();
        Long idUsuario = leerLong("ID del usuario: ");

        Optional<Usuario> resultado = usuarioRepo.buscarPorId(idUsuario);
        if (resultado.isEmpty() || resultado.get().isEliminado()) {
            System.out.println("Error: usuario no valido.");
            return;
        }

        List<Pedido> pedidos = usuarioRepo.buscarPedidosPorUsuario(idUsuario);
        if (pedidos.isEmpty()) {
            System.out.println("El usuario no tiene pedidos activos.");
            return;
        }
        System.out.println("\n  ID | Fecha      | Estado     | Forma de pago  | Total");
        System.out.println("  ---|------------|------------|----------------|-----------");
        for (Pedido p : pedidos) {
            System.out.printf("  %-3d| %-10s | %-10s | %-14s | %s%n",
                    p.getId(), p.getFecha(), p.getEstado(), p.getFormaPago(), formatearMoneda(p.getTotal()));
        }
    }

    private static void pedidosPorEstado() {
        System.out.println("\n-- Pedidos por Estado --");
        EstadoPedido estado = seleccionarEstadoPedido();
        List<Pedido> pedidos = pedidoRepo.buscarPorEstado(estado);
        if (pedidos.isEmpty()) {
            System.out.println("No hay pedidos con estado " + estado + ".");
            return;
        }
        System.out.println("\n  ID | Fecha      | Usuario              | Total");
        System.out.println("  ---|------------|----------------------|-----------");
        for (Pedido p : pedidos) {
            System.out.printf("  %-3d| %-10s | %-20s | %s%n",
                    p.getId(), p.getFecha(), nombreUsuarioDePedido(p.getId()), formatearMoneda(p.getTotal()));
        }
    }

    private static String nombreUsuarioDePedido(Long idPedido) {
        for (Usuario u : usuarioRepo.listarActivos()) {
            for (Pedido p : usuarioRepo.buscarPedidosPorUsuario(u.getId())) {
                if (p.getId().equals(idPedido)) {
                    return u.getNombre() + " " + u.getApellido();
                }
            }
        }
        return "(no disponible)";
    }

    // ─────────────────────── MENU REPORTES ─────────────────────────

    private static void menuReportes() {
        int opcion;
        do {
            System.out.println("\n---------- Reportes ----------");
            System.out.println("1. Productos por categoria");
            System.out.println("2. Pedidos por usuario");
            System.out.println("3. Pedidos por estado");
            System.out.println("4. Total facturado");
            System.out.println("0. Volver");
            opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> productosPorCategoria();
                case 2 -> pedidosPorUsuario();
                case 3 -> pedidosPorEstado();
                case 4 -> totalFacturado();
                case 0 -> System.out.println("Volviendo al menu principal...");
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);
    }

    private static void productosPorCategoria() {
        System.out.println("\n-- Productos por Categoria --");
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas.");
            return;
        }
        listarCategorias();
        Long catId = leerLong("ID de la categoria: ");

        Optional<Categoria> catResultado = categoriaRepo.buscarPorId(catId);
        if (catResultado.isEmpty() || catResultado.get().isEliminado()) {
            System.out.println("Error: categoria no valida.");
            return;
        }

        List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(catId);
        if (productos.isEmpty()) {
            System.out.println("No hay productos activos en la categoria '"
                    + catResultado.get().getNombre() + "'.");
            return;
        }

        System.out.println("\nProductos en categoria '" + catResultado.get().getNombre() + "':");
        System.out.println("  ID | Nombre               |    Precio | Stock");
        System.out.println("  ---|----------------------|-----------|------");
        for (Producto p : productos) {
            System.out.printf("  %-3d| %-20s | %9.2f | %d%n",
                    p.getId(), p.getNombre(), p.getPrecio(), p.getStock());
        }
    }

    private static void totalFacturado() {
        System.out.println("\n-- Total Facturado --");
        List<Pedido> terminados = pedidoRepo.buscarPorEstado(EstadoPedido.TERMINADO);
        double total = terminados.stream().mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0).sum();
        System.out.println("Pedidos terminados: " + terminados.size());
        System.out.println("Total facturado: " + formatearMoneda(total));
    }

    // ─────────────────────── UTILIDADES ────────────────────────────

    private static int leerEntero(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String linea = sc.nextLine().trim();
            try {
                return Integer.parseInt(linea);
            } catch (NumberFormatException e) {
                System.out.println("Por favor ingrese un numero entero valido.");
            }
        }
    }

    private static Long leerLong(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String linea = sc.nextLine().trim();
            try {
                return Long.parseLong(linea);
            } catch (NumberFormatException e) {
                System.out.println("Por favor ingrese un ID valido.");
            }
        }
    }

    private static String leerTextoObligatorio(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String texto = sc.nextLine().trim();
            if (!texto.isEmpty()) {
                return texto;
            }
            System.out.println("El campo no puede estar vacio.");
        }
    }

    private static double leerDoublePositivo(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String linea = sc.nextLine().trim();
            try {
                double valor = Double.parseDouble(linea.replace(",", "."));
                if (valor > 0) return valor;
                System.out.println("El valor debe ser mayor a 0.");
            } catch (NumberFormatException e) {
                System.out.println("Por favor ingrese un numero valido.");
            }
        }
    }

    private static int leerEnteroNoNegativo(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String linea = sc.nextLine().trim();
            try {
                int valor = Integer.parseInt(linea);
                if (valor >= 0) return valor;
                System.out.println("El valor no puede ser negativo.");
            } catch (NumberFormatException e) {
                System.out.println("Por favor ingrese un numero entero valido.");
            }
        }
    }

    private static boolean leerConfirmacion(String mensaje, boolean valorPorDefecto) {
        while (true) {
            System.out.print(mensaje);
            String linea = sc.nextLine().trim();
            if (linea.isEmpty()) return valorPorDefecto;
            if (linea.equalsIgnoreCase("S")) return true;
            if (linea.equalsIgnoreCase("N")) return false;
            System.out.println("Por favor ingrese S o N.");
        }
    }

    private static Rol seleccionarRol() {
        while (true) {
            System.out.println("Rol: 1-ADMIN  2-USUARIO");
            int opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> { return Rol.ADMIN; }
                case 2 -> { return Rol.USUARIO; }
                default -> System.out.println("Opcion invalida.");
            }
        }
    }

    private static int leerEnteroPositivo(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String linea = sc.nextLine().trim();
            try {
                int valor = Integer.parseInt(linea);
                if (valor > 0) return valor;
                System.out.println("El valor debe ser mayor a 0.");
            } catch (NumberFormatException e) {
                System.out.println("Por favor ingrese un numero entero valido.");
            }
        }
    }

    private static FormaPago seleccionarFormaPago() {
        while (true) {
            System.out.println("Forma de pago: 1-TARJETA  2-TRANSFERENCIA  3-EFECTIVO");
            int opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> { return FormaPago.TARJETA; }
                case 2 -> { return FormaPago.TRANSFERENCIA; }
                case 3 -> { return FormaPago.EFECTIVO; }
                default -> System.out.println("Opcion invalida.");
            }
        }
    }

    private static EstadoPedido seleccionarEstadoPedido() {
        while (true) {
            System.out.println("Estado: 1-PENDIENTE  2-CONFIRMADO  3-TERMINADO  4-CANCELADO");
            int opcion = leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1 -> { return EstadoPedido.PENDIENTE; }
                case 2 -> { return EstadoPedido.CONFIRMADO; }
                case 3 -> { return EstadoPedido.TERMINADO; }
                case 4 -> { return EstadoPedido.CANCELADO; }
                default -> System.out.println("Opcion invalida.");
            }
        }
    }

    private static String formatearMoneda(double monto) {
        return String.format(Locale.US, "$%.2f", monto);
    }
}

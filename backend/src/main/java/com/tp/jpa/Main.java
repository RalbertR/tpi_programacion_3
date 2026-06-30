package com.tp.jpa;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;

import java.util.List;
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
        System.out.println("[Productos] -> TODO: implementar");
    }

    // ─────────────────────── MENU USUARIOS ─────────────────────────

    private static void menuUsuarios() {
        System.out.println("[Usuarios] -> TODO: implementar");
    }

    // ─────────────────────── MENU PEDIDOS ──────────────────────────

    private static void menuPedidos() {
        System.out.println("[Pedidos] -> TODO: implementar");
    }

    // ─────────────────────── MENU REPORTES ─────────────────────────

    private static void menuReportes() {
        System.out.println("[Reportes] -> TODO: implementar");
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
}

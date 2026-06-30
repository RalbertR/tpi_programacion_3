# Food Store JPA — Backend (Parte 2)

Backend de consola del sistema Food Store, implementado con Java, JPA/Hibernate y base de datos H2 en archivo. Permite gestionar categorías, productos, usuarios y pedidos (con sus detalles) a través de un menú de consola navegable.

**Tecnologías:** Java 21, JPA / Hibernate 6, H2 (archivo), Lombok, Gradle 8.

## Instalación y ejecución

```bash
cd backend
./gradlew run
```

La base de datos H2 se crea automáticamente en `./data/jpa_db.mv.db` al primer arranque. No requiere carga inicial de datos: se cargan desde el menú de consola (Categorías → Productos → Usuarios → Pedidos, en ese orden).

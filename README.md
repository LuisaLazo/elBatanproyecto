
# EL BATÁN S.A.C. 🍗
### Sistema de Gestión de Restaurante, Pedidos y Delivery

Repositorio del proyecto académico **EL BATÁN S.A.C.**, desarrollado para el curso de Análisis y Diseño de Sistemas.

El sistema tiene como objetivo digitalizar y mejorar la gestión de pedidos, productos, clientes y servicio de delivery del restaurante, permitiendo una administración más organizada y eficiente.

## Tecnologías utilizadas

### Backend
- Java 21
- Spring Boot 3.4.1
- Spring Security
- Spring Data JPA
- JWT (JSON Web Token)
- Maven
- Swagger / OpenAPI

### Frontend
- Angular
- TypeScript
- HTML5
- CSS3
- Bootstrap

### Base de datos
- Oracle Database
- Oracle SQL Developer

### Herramientas de desarrollo
- IntelliJ IDEA
- Visual Studio Code
- Git y GitHub
- Postman / Swagger

## Ramas de trabajo

- `main`: rama principal de integración del proyecto.
- `backend`: desarrollo de servicios, controladores y seguridad, si se utiliza esta rama.
- `frontend`: desarrollo de interfaces Angular, si se utiliza esta rama.

Cada integrante trabaja en sus funcionalidades asignadas y los cambios se integran mediante GitHub para mantener el proyecto organizado.

## Funcionalidades del sistema

### Módulo de autenticación
- Inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Control de acceso según roles.
- Protección de endpoints con Spring Security.

### Módulo de productos
- Registro de productos.
- Listado de productos disponibles.
- Actualización de información.
- Control de precios y stock.
- Gestión de la carta del restaurante.

### Módulo de pedidos
- Registro de pedidos.
- Selección de productos y cantidades.
- Cálculo automático del total.
- Validación del stock disponible.
- Consulta del detalle de los pedidos.
- Actualización del estado de los pedidos.

### Módulo de delivery
- Registro de la dirección del cliente.
- Gestión de pedidos para entrega.
- Consulta del estado de los pedidos.

### Panel de administración
- Gestión de productos.
- Administración de la carta.
- Visualización de pedidos.
- Actualización del estado de pedidos.
- Control de usuarios según permisos.

### Interfaz del cliente
- Inicio de sesión y registro.
- Visualización de la carta.
- Selección de productos.
- Realización de pedidos.
- Solicitud de delivery.

## Arquitectura del sistema

El proyecto utiliza una arquitectura en capas para separar las responsabilidades del sistema.

- **Controller:** recibe las solicitudes HTTP.
- **Service:** contiene las reglas de negocio.
- **Repository:** permite acceder a la base de datos.
- **Entity:** representa las tablas de Oracle.
- **DTO:** permite transferir información.
- **Security:** administra la autenticación y autorización.

La comunicación entre Angular y Spring Boot se realiza mediante API REST utilizando JSON.

## Requisitos para ejecutar el proyecto

- JDK 21 o superior.
- Node.js compatible con la versión de Angular instalada.
- Angular CLI.
- Oracle Database.
- IntelliJ IDEA.
- Visual Studio Code.
- Maven o Maven Wrapper.

## Ejecutar el backend

1. Clonar el repositorio de GitHub.
2. Abrir el proyecto backend en IntelliJ IDEA.
3. Configurar la conexión a Oracle.
4. Verificar las dependencias de Maven.
5. Ejecutar la aplicación Spring Boot.

Desde la carpeta raíz del backend:

```bash
.\mvnw.cmd spring-boot:run
```

El backend se ejecuta normalmente en:

`http://localhost:8080`

La documentación Swagger puede consultarse en:

`http://localhost:8080/swagger-ui/index.html`

## Ejecutar el frontend

1. Abrir el proyecto Angular en Visual Studio Code.
2. Abrir una terminal en la carpeta del frontend.
3. Instalar las dependencias.
4. Iniciar el servidor de desarrollo.

```bash
npm install
ng serve
```

Abrir en el navegador:

`http://localhost:4200`

Verificar que la URL de la API corresponda a la dirección del backend.

## Configuración de base de datos

El sistema utiliza Oracle Database para almacenar información de:

- Usuarios y roles.
- Personas y clientes.
- Productos.
- Pedidos.
- Detalles de pedidos.
- Estados y datos de entrega.

Cada integrante debe configurar sus propias credenciales de Oracle en el entorno local.

**Importante:** no subir contraseñas, claves JWT ni credenciales privadas a GitHub.

## Seguridad

La autenticación se realiza mediante Spring Security y JWT.

El usuario inicia sesión y obtiene un token que debe enviar en las solicitudes protegidas:

`Authorization: Bearer TOKEN_JWT`

Los permisos se administran según el rol del usuario.

## Colaboración

El proyecto se desarrolla de forma colaborativa utilizando Git y GitHub.

Cada integrante debe:

1. Mantener actualizado su código local.
2. Trabajar en las funcionalidades asignadas.
3. Registrar sus cambios mediante commits.
4. Subir las modificaciones al repositorio.
5. Verificar el funcionamiento antes de integrar cambios.

## Objetivo del proyecto

Desarrollar un sistema web para EL BATÁN S.A.C. que permita optimizar la atención al cliente, administrar productos, registrar pedidos, controlar existencias y organizar el servicio de delivery.

## Proyecto académico

**Empresa:** EL BATÁN S.A.C.

**Curso:** Análisis y Diseño de Sistemas.

**Institución:** Universidad Peruana Unión (UPeU).

**Tipo de proyecto:** Sistema web de gestión de restaurante.

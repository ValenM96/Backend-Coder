# Servidor E-commerce - API REST

Este proyecto implementa un servidor Node.js con Express para la gestión de productos y carritos de compra, con persistencia en archivos JSON.

## Estructura del Proyecto

```
proyecto/
├── server.js
├── package.json
├── managers/
│   ├── ProductManager.js
│   └── CartManager.js
├── routes/
│   ├── products.js
│   └── carts.js
└── data/
    ├── products.json
    └── carts.json
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar el servidor:
```bash
npm start
```

O para desarrollo con auto-reinicio:
```bash
npm run dev
```

El servidor se ejecutará en el puerto 8080.

## API Endpoints

### Productos (`/api/products`)

#### GET `/api/products/`
- **Descripción**: Lista todos los productos
- **Respuesta**: Array de productos

#### GET `/api/products/:pid`
- **Descripción**: Obtiene un producto específico por ID
- **Parámetros**: `pid` - ID del producto
- **Respuesta**: Objeto producto o error 404

#### POST `/api/products/`
- **Descripción**: Crea un nuevo producto
- **Body requerido**:
```json
{
  "title": "Nombre del producto",
  "description": "Descripción del producto",
  "code": "CODIGO_UNICO",
  "price": 100,
  "stock": 10,
  "category": "Categoría",
  "status": true,
  "thumbnails": ["url1", "url2"]
}
```
- **Respuesta**: Producto creado con ID autogenerado

#### PUT `/api/products/:pid`
- **Descripción**: Actualiza un producto existente
- **Parámetros**: `pid` - ID del producto
- **Body**: Campos a actualizar (el ID no se puede modificar)
- **Respuesta**: Producto actualizado

#### DELETE `/api/products/:pid`
- **Descripción**: Elimina un producto
- **Parámetros**: `pid` - ID del producto
- **Respuesta**: Confirmación de eliminación

### Carritos (`/api/carts`)

#### POST `/api/carts/`
- **Descripción**: Crea un nuevo carrito vacío
- **Respuesta**: Carrito creado con ID autogenerado

#### GET `/api/carts/:cid`
- **Descripción**: Lista los productos de un carrito específico
- **Parámetros**: `cid` - ID del carrito
- **Respuesta**: Array de productos en el carrito

#### POST `/api/carts/:cid/product/:pid`
- **Descripción**: Agrega un producto al carrito (o incrementa cantidad si ya existe)
- **Parámetros**: 
  - `cid` - ID del carrito
  - `pid` - ID del producto
- **Respuesta**: Carrito actualizado

## Ejemplos de Uso con Postman

### Crear un producto:
```
POST http://localhost:8080/api/products/
Content-Type: application/json

{
  "title": "Laptop Gaming",
  "description": "Laptop para gaming de alta gama",
  "code": "LAP001",
  "price": 1500,
  "stock": 5,
  "category": "Electrónicos"
}
```

### Crear un carrito:
```
POST http://localhost:8080/api/carts/
```

### Agregar producto al carrito:
```
POST http://localhost:8080/api/carts/1/product/1
```

## Características

- ✅ Servidor Express en puerto 8080
- ✅ Persistencia en archivos JSON
- ✅ Validación de datos
- ✅ IDs autogenerados
- ✅ Manejo de errores HTTP apropiados
- ✅ Estructura modular con managers y routes
- ✅ Incremento automático de cantidad en carritos
- ✅ Validación de códigos únicos en productos

## Notas Técnicas

- Los archivos JSON se crean automáticamente en la carpeta `data/`
- Los IDs se autogeneran de forma incremental
- La validación evita códigos duplicados en productos
- Los carritos manejan automáticamente productos duplicados incrementando la cantidad
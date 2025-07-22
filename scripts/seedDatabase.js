require('dotenv').config();

// Debug para verificar que las variables se cargan
console.log('🔍 MONGO_URL encontrada:', !!process.env.MONGO_URL);

const mongoose = require('mongoose');
const Product = require('../models/Product');

// Datos de productos de ejemplo
const sampleProducts = [
  {
    title: "Laptop Gaming MSI",
    description: "Laptop para gaming de alta gama con procesador Intel i7, 16GB RAM, tarjeta gráfica RTX 3070, pantalla 15.6 pulgadas 144Hz",
    code: "LAP001",
    price: 1299.99,
    stock: 8,
    category: "Electrónicos",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
    ]
  },
  {
    title: "iPhone 15 Pro",
    description: "Smartphone Apple iPhone 15 Pro de 128GB en color Natural Titanium, cámara pro con zoom óptico",
    code: "PHN001",
    price: 999.99,
    stock: 15,
    category: "Smartphones",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
    ]
  },
  {
    title: "Silla Gamer RGB",
    description: "Silla ergonómica para gaming con luces LED RGB, respaldo reclinable, apoyabrazos 4D y cojines de espuma de memoria",
    code: "CHR001",
    price: 249.99,
    stock: 12,
    category: "Muebles",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500"
    ]
  },
  {
    title: "Auriculares Sony WH-1000XM5",
    description: "Auriculares inalámbricos con cancelación de ruido activa, 30 horas de batería, audio Hi-Res",
    code: "AUD001",
    price: 329.99,
    stock: 20,
    category: "Audio",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"
    ]
  },
  {
    title: "Monitor 4K UltraWide",
    description: "Monitor curvo de 34 pulgadas 4K UltraWide, 144Hz, HDR10, ideal para gaming y productividad",
    code: "MON001",
    price: 599.99,
    stock: 6,
    category: "Monitores",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
      "https://images.unsplash.com/photo-1593640408182-31174e5cdecb?w=500"
    ]
  },
  {
    title: "Teclado Mecánico Razer",
    description: "Teclado mecánico RGB con switches Cherry MX Blue, retroiluminación personalizable, reposamuñecas magnético",
    code: "KEY001",
    price: 149.99,
    stock: 25,
    category: "Periféricos",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
    ]
  },
  {
    title: "Smartwatch Samsung Galaxy Watch 6",
    description: "Reloj inteligente con GPS, monitor de frecuencia cardíaca, resistente al agua, batería de 40 horas",
    code: "WAT001",
    price: 279.99,
    stock: 18,
    category: "Wearables",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500"
    ]
  },
  {
    title: "Cámara Canon EOS R5",
    description: "Cámara mirrorless full-frame de 45MP, grabación 8K, estabilización de imagen, ideal para fotografía profesional",
    code: "CAM001",
    price: 2499.99,
    stock: 4,
    category: "Fotografía",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500"
    ]
  },
  {
    title: "Tablet iPad Air M2",
    description: "Tablet Apple iPad Air con chip M2, pantalla Liquid Retina de 10.9 pulgadas, 256GB de almacenamiento",
    code: "TAB001",
    price: 749.99,
    stock: 10,
    category: "Tablets",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500"
    ]
  },
  {
    title: "Consola PlayStation 5",
    description: "Consola de videojuegos Sony PS5 con unidad de disco, 825GB SSD, control DualSense, soporte para juegos 4K",
    code: "CON001",
    price: 499.99,
    stock: 7,
    category: "Consolas",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500"
    ]
  },
  {
    title: "Mouse Gaming Logitech G Pro X",
    description: "Mouse inalámbrico para gaming con sensor HERO 25K, 25 botones programables, batería de 120 horas",
    code: "MOU001",
    price: 129.99,
    stock: 30,
    category: "Periféricos",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
      "https://images.unsplash.com/photo-1563297007-0686ba0ed815?w=500"
    ]
  },
  {
    title: "Disco SSD Samsung 2TB",
    description: "Unidad de estado sólido NVMe PCIe 4.0 de 2TB, velocidades de lectura hasta 7000 MB/s, ideal para gaming",
    code: "SSD001",
    price: 199.99,
    stock: 15,
    category: "Almacenamiento",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"
    ]
  },
  {
    title: "Webcam Logitech Brio 4K",
    description: "Cámara web 4K Ultra HD con autoenfoque, micrófono con cancelación de ruido, ideal para streaming y videoconferencias",
    code: "WEB001",
    price: 199.99,
    stock: 22,
    category: "Cámaras Web",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
      "https://images.unsplash.com/photo-1576148587205-a0e70954e4e3?w=500"
    ]
  },
  {
    title: "Altavoces Bluetooth JBL Charge 5",
    description: "Altavoz portátil Bluetooth resistente al agua IP67, 20 horas de reproducción, función powerbank",
    code: "SPK001",
    price: 179.99,
    stock: 16,
    category: "Audio",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500"
    ]
  },
  {
    title: "Router WiFi 6 ASUS AX6000",
    description: "Router inalámbrico WiFi 6 de alta velocidad, cobertura hasta 350m², 8 antenas, perfecto para gaming y streaming",
    code: "ROU001",
    price: 299.99,
    stock: 9,
    category: "Redes",
    status: true,
    thumbnails: [
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500"
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...\n');
    
    // Verificar que MONGO_URL está configurada
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL no está configurada en .env');
    }
    
    // Conectar directamente usando mongoose
    console.log('🔄 Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado a MongoDB Atlas exitosamente');
    
    // Verificar si ya existen productos
    const existingProducts = await Product.countDocuments();
    console.log(`📊 Productos existentes en BD: ${existingProducts}`);
    
    if (existingProducts > 0) {
      console.log('\n❓ La base de datos ya contiene productos.');
      console.log('   👉 Conservando productos existentes y agregando nuevos...\n');
    } else {
      console.log('📦 Base de datos vacía, agregando productos de ejemplo...\n');
    }
    
    // Insertar productos uno por uno para manejar duplicados
    let inserted = 0;
    let skipped = 0;
    
    for (const productData of sampleProducts) {
      try {
        // Verificar si el código ya existe
        const existingProduct = await Product.findOne({ code: productData.code });
        
        if (existingProduct) {
          console.log(`⏭️  Saltando ${productData.code} - ${productData.title} (ya existe)`);
          skipped++;
        } else {
          const newProduct = new Product(productData);
          await newProduct.save();
          console.log(`✅ Agregado: ${productData.code} - ${productData.title}`);
          inserted++;
        }
      } catch (error) {
        console.log(`❌ Error con ${productData.code}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 ¡Seeding completado!');
    console.log(`   ✅ Productos insertados: ${inserted}`);
    console.log(`   ⏭️  Productos saltados: ${skipped}`);
    console.log(`   📊 Total en BD: ${await Product.countDocuments()}`);
    
    console.log('\n🚀 ¡Ahora puedes usar tu aplicación con productos de ejemplo!');
    console.log('   - Catálogo: http://localhost:8080/products');
    console.log('   - Gestión: http://localhost:8080/realtimeproducts');
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error.message);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el seeding si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };
require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const Database = require('./config/database');

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 8080;

const database = new Database();

app.engine('handlebars', engine({
    helpers: {
        multiply: (a, b) => {
            return (parseFloat(a) * parseFloat(b)).toFixed(2);
        },
        eq: (a, b) => {
            return a == b;
        },
        unless: function(conditional, options) {
            if (!conditional) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        add: (a, b) => {
            return parseFloat(a) + parseFloat(b);
        },
        formatDate: (date) => {
            return new Date(date).toLocaleDateString();
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use((req, res, next) => {
    req.dbConnected = database.isConnected();
    next();
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/health', (req, res) => {
    res.json({
        server: 'OK',
        database: req.dbConnected ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

app.post('/seed', async (req, res) => {
    if (!req.dbConnected) {
        return res.status(503).json({ 
            error: 'Base de datos no disponible' 
        });
    }

    try {
        const { seedDatabase } = require('./scripts/seedDatabase');
        
        seedDatabase().then(() => {
            console.log('🌱 Seeding completado desde endpoint /seed');
        }).catch(err => {
            console.error('❌ Error en seeding desde endpoint:', err);
        });

        res.json({ 
            message: '🌱 Iniciando carga de productos de ejemplo...',
            note: 'Revisa la consola para ver el progreso'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al iniciar seeding: ' + error.message 
        });
    }
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (!req.dbConnected) {
        res.status(503).json({ 
            error: 'Base de datos no disponible',
            message: 'MongoDB no está conectado. Ver consola para instrucciones.'
        });
    } else {
        res.status(500).json({ error: 'Algo salió mal!' });
    }
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

async function startServer() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    server.listen(PORT, () => {
        console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
        console.log(`🔗 Estado MongoDB: ${database.isConnected() ? '✅ Conectado' : '❌ Desconectado'}`);
        console.log(`📱 Vistas disponibles en:`);
        console.log(`   - http://localhost:${PORT}/ (Home)`);
        console.log(`   - http://localhost:${PORT}/products (Catálogo con paginación)`);
        console.log(`   - http://localhost:${PORT}/realtimeproducts (Gestión tiempo real)`);
        console.log(`   - http://localhost:${PORT}/carts/:id (Ver carrito específico)`);
        console.log(`   - http://localhost:${PORT}/health (Estado del sistema)`);
        
        if (database.isConnected()) {
            console.log('\n🎉 ¡TODO LISTO! Tu aplicación e-commerce está funcionando perfectamente');
            console.log('   ✅ Servidor Express corriendo');
            console.log('   ✅ MongoDB conectado');
            console.log('   ✅ WebSockets activos');
            console.log('   ✅ Todas las vistas disponibles');
            console.log('\n🚀 ¡Puedes empezar a usar tu aplicación!');
        } else {
            console.log('\n⚠️  ATENCIÓN: MongoDB no está conectado');
            console.log('   El servidor funciona pero las funciones de BD no están disponibles');
            console.log('   Consulta las instrucciones arriba para conectar MongoDB\n');
        }
    });
}

startServer();
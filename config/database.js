const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connected = false;
        this.mongoUrls = [
            process.env.MONGO_URL,
            'mongodb://localhost:27017/ecommerce'
        ].filter(Boolean);

        this.connect();
    }

    async connect() {
        let connected = false;

        for (const url of this.mongoUrls) {
            try {
                console.log(`🔄 Intentando conectar a: ${this.hidePassword(url)}`);
                await mongoose.connect(url);
                console.log(`✅ Conectado exitosamente a: ${this.hidePassword(url)}`);
                this.connected = true;
                connected = true;
                break;
            } catch (error) {
                console.log(`❌ Falló conexión a: ${this.hidePassword(url)}`);
                console.log(`   Error: ${error.message}`);
            }
        }

        if (!connected) {
            this.connected = false;
            console.log('\n🚨 No se pudo conectar a ninguna base de datos MongoDB');
            console.log('\n💡 SOLUCIONES:');
            console.log('   1. CONFIGURAR VARIABLE DE ENTORNO MONGO_URL:');
            console.log('      - Crea archivo .env en la raíz del proyecto');
            console.log('      - Agrega: MONGO_URL=tu_connection_string_de_mongodb');
            console.log('\n   2. USAR MONGODB ATLAS (Recomendado):');
            console.log('      - Ve a: https://www.mongodb.com/cloud/atlas');
            console.log('      - Crea cuenta gratuita y cluster');
            console.log('      - Obtén connection string y ponlo en .env');
            console.log('\n   3. INSTALAR MONGODB LOCAL:');
            console.log('      - Descarga: https://www.mongodb.com/try/download/community');
            console.log('      - Instala y ejecuta: mongod');
            console.log('\n🔄 El servidor continuará ejecutándose sin base de datos...\n');
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.connected = false;
            console.log('🔌 Desconectado de MongoDB');
        } catch (error) {
            console.error('❌ Error desconectando de MongoDB:', error);
        }
    }

    hidePassword(url) {
        if (!url) return 'undefined';
        return url.replace(/:([^:@]+)@/, ':***@');
    }

    isConnected() {
        return this.connected && mongoose.connection.readyState === 1;
    }
}

module.exports = Database;
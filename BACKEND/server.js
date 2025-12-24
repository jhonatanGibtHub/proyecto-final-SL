require('dotenv').config();
const express = require('express');
const cors = require('cors');



const vacunasRoutes = require('./routes/vacunasRoutes');
const ubicacionesRoutes = require('./routes/ubicacionesRoutes');
const transportistasRoutes = require('./routes/transportistasRoutes');

const inventarioStockRoutes = require('./routes/inventarioStockRoutes');
const sensoresTempRoutes = require('./routes/sensoresTempRoutes');


const lotesRoutes = require('./routes/lotesRoutes');
const medicionesTempRoutes = require('./routes/medicionesTempRoutes');
const registroMovimientoRoutes = require('./routes/registroMovimientoRoutes');
const authRoutes = require('./routes/authRoutes');
const alertasCadenaFrioRoutes = require('./routes/alertasCadenaFrioRoutes');



const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({extended: true})); 


app.use('/api/auth', authRoutes);
app.use('/api/vacunas', vacunasRoutes); 
app.use('/api/ubicaciones', ubicacionesRoutes); 
app.use('/api/transportistas', transportistasRoutes); 


app.use('/api/stock', inventarioStockRoutes); 
app.use('/api/sensores', sensoresTempRoutes); 


app.use('/api/lotes', lotesRoutes); 
app.use('/api/mediciones', medicionesTempRoutes); 
app.use('/api/movimientos', registroMovimientoRoutes); 
app.use('/api/alertas', alertasCadenaFrioRoutes); 


app.get('/', (req, res) => {
    res.json({
        mensaje: "API STGCF - Sistema de Trazabilidad y Cadena de Frío para Vacunas (v1.0)",
        status: "Online",
        
    });
});
 

app.listen(PORT, () => {
    console.log(`Servidor STGCF inicializado en el puerto: ${PORT}`);
    console.log(`Accede a la API en: http://localhost:${PORT}`);
});
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

import registros from './Services/registros.js';
import activar from './Services/activarCuenta.js';
import login from './Services/login.js';
import recuperarPass from './Services/recuperarPassword.js';
import catalogos from './Services/catalogos.js';
import necesidades from './Services/necesidades/registroNecesidad.js';
import consulta from './Services/graficas/consulta.js';
import reporte from './Services/reporte.js';
import publico from './Services/consultaPublica.js';
import descargas from './Services/descargas.js';

app.use('/api/registro', registros);
app.use('/api/activar', activar);
app.use('/api/login', login);
app.use('/api/recuperarPass', recuperarPass);
app.use('/api/catalogos', catalogos);
app.use('/api/necesidades', necesidades);
app.use('/api/consulta', consulta);
app.use('/api/reporte', reporte);
app.use('/api/publico', publico);
app.use('/api/descargas', descargas);

app.get('/env.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.URL_FRONT = "${process.env.URL_FRONT}";`);
});

app.get('/activar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'activar.html'));
});

app.listen(port, () => {
});

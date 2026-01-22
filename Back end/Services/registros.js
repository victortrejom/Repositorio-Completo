import express from "express";
import jwt from "jsonwebtoken";
import transporter from "../Config/mail.js";
import { connectToDatabase, sql } from "../Config/Configuracion.js";

const router = express.Router();

router.post("/nuevo", async (req, res) => {

  // Fecha y hora
  const original = new Date();
  const offsetInMs = original.getTimezoneOffset() * 60000;
  const fechaLocal = new Date(original.getTime() - offsetInMs);
  const ahora = new Date();
  const horaActual = ahora.toTimeString().split(' ')[0]; // formato HH:MM:SS


  try {
    const { tipo_usuario, nombre_completo, correo_electronico, password } = req.body;

    const pool = await connectToDatabase();

    // VALIDAR DUPLICADOS
    const existe = await pool.request()
      .input("correo_electronico", sql.VarChar, correo_electronico)
      .query(`
        SELECT correo_electronico
        FROM usuarios 
        WHERE correo_electronico = @correo_electronico
      `);


    if (existe.recordset.length > 0) {

      return res.status(400).json({
        error: "El usuario o correo ya existe. No se permiten duplicados.",
        detalle: existe.recordset
      });
    }

    // INSERTAR USUARIO
    await pool.request()
//    .input("usuario", sql.VarChar, usuario) // puede servir en futuro
      .input("nombre_completo", sql.VarChar, nombre_completo)
      .input("tipo_usuario", sql.Int, tipo_usuario)
      .input("correo_electronico", sql.VarChar, correo_electronico)
      .input("password", sql.VarChar, password)
      .input("estado_usuario", sql.Int, 1) // registrado no activo
      .input('fecha_registro', sql.DateTime, fechaLocal)
      .input('hora_registro', sql.VarChar, horaActual)
      .query(`
        INSERT INTO usuarios (nombre_completo, tipo_usuario, correo_electronico, password, estado_usuario ,fecha_registro, hora_registro)
        VALUES (@nombre_completo, @tipo_usuario, @correo_electronico, @password, @estado_usuario, @fecha_registro, @hora_registro)
      `);

    // GENERAR TOKEN
    const token = jwt.sign(
      { correo: correo_electronico },
      process.env.JWT_KEY,
      { expiresIn: "24h" }
    );

    const link = `${process.env.API_BASE_URL}/api/activar?token=${token}`;

    // ENVIAR CORREO
    await transporter.sendMail({
      from: `"Sistema de Registro" <${process.env.EMAIL_USER}>`,
      to: correo_electronico,
      subject: "Activa tu cuenta",
      html: `
        <h3>Hola ${nombre_completo}</h3>
        <p>Para activar tu cuenta, da clic en el siguiente enlace:</p>
        <a href="${link}" style="font-size: 18px; color: blue;">Activar cuenta</a>
      `
    });
    return res.json({
      message: "Usuario registrado. Revisa tu correo para activación."
    });

  } catch (err) {
    console.error("ERROR EN /nuevo:", err);
    return res.status(500).json({ 
      error: "Error registrando usuario", 
      detalle: err.message 
    });
  }
});


export default router;

import express from "express";
import jwt from "jsonwebtoken";
import transporter from "../Config/mail.js";
import { connectToDatabase, sql } from "../Config/Configuracion.js";
import crypto from "crypto";

const API_BASE_URL = process.env.API_BASE_URL;
const URL_FRONT = process.env.URL_FRONT;

const router = express.Router();

function hashSHA256(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}


// Endpoint para que manda la solicitud de recuperación de contraseña
router.post("/recuperar", async (req, res) => {
  try {
    const { correo } = req.body;

    const pool = await connectToDatabase();

    // Verificar que exista el usuario
    const usuarioDB = await pool.request()
      .input("correo", sql.VarChar, correo)
      .query(`SELECT correo_electronico FROM usuarios WHERE correo_electronico = @correo`);

    if (usuarioDB.recordset.length === 0) {
      return res.status(404).json({ error: "No existe usuario con este correo" });
    }

    const usuario = usuarioDB.recordset[0];

    const token = jwt.sign(
      { correo: usuario.correo_electronico },
      process.env.JWT_KEY,
      { expiresIn: "24h" }
    );

    const link = `${process.env.API_BASE_URL}/api/recuperarPass/soliciutd-contrasena?token=${token}`;

    // Enviar correo con link
    await transporter.sendMail({
      from: `"Sistema de Recuperación" <${process.env.EMAIL_USER}>`,
      to: usuario.correo_electronico,
      subject: "Recupera tu contraseña",
      html: `
        <h3>Hola ${usuario.nombre_completo}</h3>
        <p>Haz clic en el siguiente enlace para recuperar tu contraseña. El link es válido por 24 horas:</p>
        <a href="${link}" style="font-size: 18px; color: blue;">Recupera tu contraseña aquí</a>
      `
    });

    return res.json({
      message: "Correo de recuperación enviado correctamente"
    });

  } catch (err) {
    console.error("ERROR EN /recuperar:", err);
    return res.status(500).json({
      error: "Error enviando correo de recuperación",
      detalle: err.message
    });
  }
});

//endponint que recibe solicitud y redirige al html para cambio de contraseña
router.get("/soliciutd-contrasena", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Token requerido");

  try {
    jwt.verify(token, process.env.JWT_KEY);
      res.sendFile("cambioPass.html", { root: "./public" });
  } catch (err) {
    console.error(err);
    res.status(400).send("Token inválido o expirado");
  }
});

//endponit para cambio de contraseña
router.post("/cambiar-contrasena", async (req, res) => {
  try {
    const { token, nuevaPassword, repetirPassword } = req.body;
    if (!token) return res.status(400).send("Token requerido");
    if (nuevaPassword !== repetirPassword) return res.status(400).send("Las contraseñas no coinciden");

    // Decodificar token y validar expiración
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return res.status(400).send("Token inválido o expirado");
    }

    const pool = await connectToDatabase();

    // Verificar que el usuario existe
    const usuarioDB = await pool.request()
      .input("correo_electronico", sql.VarChar, decoded.correo)
      .query(`SELECT correo_electronico FROM usuarios WHERE correo_electronico = @correo_electronico`);

    if (usuarioDB.recordset.length === 0) {
      return res.status(404).send("Usuario no encontrado");
    }
    
    const hashedPassword = hashSHA256(nuevaPassword);

    // Actualizar la contraseña en la DB
    await pool.request()
      .input("correo_electronico", sql.VarChar, decoded.correo)
      .input("password", sql.VarChar, hashedPassword)
      .query(`UPDATE usuarios SET password = @password WHERE correo_electronico = @correo_electronico`);

    // Redirigir a página de confirmación
    return res.redirect(`${process.env.URL_FRONT}/`);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error actualizando contraseña");
  }
});


export default router;

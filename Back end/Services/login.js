import express from "express";
import jwt from "jsonwebtoken";
import { connectToDatabase, sql } from "../Config/Configuracion.js";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Si no lo tienes: npm i node-fetch


dotenv.config();
const router = express.Router();
const secretKey = process.env.JWT_KEY;
/*

router.post("/login", async (req, res) => {

  try {
    const { correo_electronico, password } = req.body;


    if (!correo_electronico || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const pool = await connectToDatabase();

    const userQuery = await pool.request()
      .input("correo_electronico", sql.VarChar, correo_electronico)
      .query(`
        SELECT 
          id, tipo_usuario, estado_usuario, 
          nombre_completo, correo_electronico, password, direccion_distrital
        FROM usuarios
        WHERE correo_electronico = @correo_electronico
      `);

    if (userQuery.recordset.length === 0) {
      return res.status(404).json({ message: "El correo no está registrado", code: 404 });
    }

    const user = userQuery.recordset[0];

    if (user.estado_usuario === 1) {
      return res.status(403).json({ message: "La cuenta está inactiva. Debe activarse.", code: 402 });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta", code: 101 });
    }

    const tokenPayload = {
      id: user.id,
      correo: user.correo_electronico,
      tipo_usuario: user.tipo_usuario,
      direccion_distrital: user.direccion_distrital
    };

    const token = jwt.sign(tokenPayload, secretKey, {
      expiresIn: process.env.JWT_EXPIRES || "5h"
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre_completo,
        tipo_usuario: user.tipo_usuario,
        direccion_distrital: user.direccion_distrital
      }
    });

  } catch (err) {
    console.error("ERROR /login:", err);
    return res.status(500).json({ message: "Error de servidor", detail: err.message });
  }
});

/**/

router.post("/login", async (req, res) => {
  try {
    const { correo_electronico, password, captchaToken } = req.body;

    console.log("Entro al log")

    if (!correo_electronico || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    // 1. Validar token recibido
    if (!captchaToken) {
      return res.status(400).json({ message: "Captcha requerido" });
    }

    // 2. Validar con hCaptcha
    const secret = process.env.HCAPTCHA_SECRET_KEY;

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", captchaToken);

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ 
        message: "Captcha inválido", 
        hcaptcha: data 
      });
    }

    const pool = await connectToDatabase();

    const userQuery = await pool.request()
      .input("correo_electronico", sql.VarChar, correo_electronico)
      .query(`
        SELECT id, tipo_usuario, estado_usuario,
               nombre_completo, correo_electronico, password, direccion_distrital, video_muro
        FROM usuarios
        WHERE correo_electronico = @correo_electronico
      `);

    if (userQuery.recordset.length === 0) {
      return res.status(404).json({ message: "El correo no está registrado", code: 404 });
    }

    const user = userQuery.recordset[0];

    if (user.estado_usuario === 1) {
      return res.status(403).json({ message: "La cuenta está inactiva. Debe activarse.", code: 402 });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta", code: 101 });
    }

    const tokenPayload = {
      id: user.id,
      correo: user.correo_electronico,
      tipo_usuario: user.tipo_usuario,
      direccion_distrital: user.direccion_distrital,
      video_muro: user.video_muro
    };

    const token = jwt.sign(tokenPayload, secretKey, {
      expiresIn: process.env.JWT_EXPIRES || "5h"
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre_completo,
        tipo_usuario: user.tipo_usuario,
        direccion_distrital: user.direccion_distrital,
        video_muro: user.video_muro
      }
    });

  } catch (err) {
    return res.status(500).json({ message: "Error de servidor", detail: err.message });
  }
});


//validacion de muro




export default router;

import express from "express";
import jwt from "jsonwebtoken";
import { connectToDatabase, sql } from "../Config/Configuracion.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Token requerido");
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const pool = await connectToDatabase();

    await pool.request()
      .input("correo", sql.VarChar, decoded.correo)
      .query(`
        UPDATE usuarios
        SET estado_usuario = 2
        WHERE correo_electronico = @correo
      `);
 
      res.sendFile("activado.html", { root: "./public" });

      } catch (err) {
    console.error(err);
    res.status(400).send("Token inválido o expirado");
  }
});

export default router;

import { connectToDatabase, sql } from "../Config/Configuracion.js";
import Midleware from "../Config/Midleware.js";
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();


router.patch("/updateMuro", Midleware.verifyToken, async (req, res) => {
  const { id_usuario } = req.body;

  if (id_usuario == null) {
    return res.status(400).json({ message: "El campo usuario es requerido" });
  }

  let transaction;
  try {
    const pool = await connectToDatabase();
    transaction = pool.transaction();
    await transaction.begin();

    await transaction.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query(`
                UPDATE usuarios
                SET video_muro = 1
                where id = @id_usuario;
            `);

    await transaction.commit();

    return res.status(200).json({
      message: `Usuario actualizado`,
      code: 200,
    });

  } catch (err) {
    console.error("Error en Registro:", err);
    if (transaction) {
      await transaction.rollback();
    }
    return res.status(500).json({ message: "Error al actualizar", error: err.message });
  }
});



export default router;
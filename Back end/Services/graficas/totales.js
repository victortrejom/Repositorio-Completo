import { connectToDatabase, sql } from "../../Config/Configuracion.js";
import Midleware from "../../Config/Midleware.js";
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// grafica Necesidades registradas
router.get("/getAlcaldias", Midleware.verifyToken, async (req, res) => {
  try {

    const pool = await connectToDatabase();
    const result = await pool.request()
      .query(`select COUNT(*) from registro_necesidad;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getAlcaldia: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontraron registros" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});



// grafica Ciudadanos registrados

// grafica Colonias registrados

export default router;
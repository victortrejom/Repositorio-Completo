import { connectToDatabase, sql } from "../../Config/Configuracion.js";
import Midleware from "../../Config/Midleware.js";
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// grafica alcaldias
router.get("/getAlcaldias", Midleware.verifyToken, async (req, res) => {
  try {
    const {
      id
    } = req.query

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id || null)
      .query(`SELECT 
                  rn.demarcacion_territorial AS id,
                  cdt.demarcacion_territorial AS demarcacion_territorial,
                  COUNT(*) AS total_votos
              FROM registro_necesidad rn
              JOIN cat_demarcacion_territorial cdt 
                  ON rn.demarcacion_territorial = cdt.id
              WHERE (@id IS NULL OR rn.direccion_distrital = @id)
              GROUP BY 
                  rn.demarcacion_territorial,
                  cdt.demarcacion_territorial
              ORDER BY total_votos DESC;`);

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


// Alcaldias grafiaca para distritales
router.get("/getAlcaldiasById", Midleware.verifyToken, async (req, res) => {
  try {
    const {
      id
    } = req.query

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id || null)
      .query(`SELECT 
                rn.demarcacion_territorial AS id,
                cdt.demarcacion_territorial AS demarcacion_territorial,
                rn.direccion_distrital,
                COUNT(*) AS total_votos
            FROM registro_necesidad rn
            JOIN cat_demarcacion_territorial cdt 
                ON rn.demarcacion_territorial = cdt.id
            WHERE (rn.direccion_distrital = @id)
            GROUP BY 
                rn.demarcacion_territorial,
                cdt.demarcacion_territorial,
                rn.direccion_distrital
            ORDER BY total_votos DESC;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getAlcaldiasById: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontraron registros" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


// grafica UT
router.get("/getUnidadTerritorial", Midleware.verifyToken, async (req, res) => {
  try {
    const {
      id
    } = req.query

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id || null)
      .query(`SELECT TOP 10
                rn.unidad_territorial  AS id,
                cut.unidad_territorial  AS unidad_territorial ,
                COUNT(*) AS total_votos
            FROM registro_necesidad rn
            JOIN cat_unidad_territorial cut
                ON rn.unidad_territorial  = cut.id
            WHERE (@id IS NULL OR rn.direccion_distrital = @id)
            GROUP BY 
                rn.unidad_territorial,
                cut.unidad_territorial 
            ORDER BY total_votos DESC;`);
    if (result.recordset.length > 0) {
      return res.status(200).json({
        getUnidadTerritorial: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontraron registros" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


// ut graficas para distritales
router.get("/getUnidadTerritorialById", Midleware.verifyToken, async (req, res) => {
  try {
    const {
      id
    } = req.query

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id || null)
      .query(`SELECT TOP 10
                rn.unidad_territorial AS id,
              cut.unidad_territorial  AS unidad_territorial,
                rn.direccion_distrital,
                COUNT(*) AS total_votos
            FROM registro_necesidad rn
          JOIN cat_unidad_territorial cut
              ON rn.unidad_territorial  = cut.id
          WHERE (rn.direccion_distrital = @id)
            GROUP BY 
                rn.unidad_territorial,
                cut.unidad_territorial,
                rn.direccion_distrital
            ORDER BY total_votos DESC;`);
    if (result.recordset.length > 0) {
      return res.status(200).json({
        getUnidadTerritorialById: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontraron registros" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


//reporte

export default router;

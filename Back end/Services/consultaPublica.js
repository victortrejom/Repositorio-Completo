import { connectToDatabase, sql } from '../Config/Configuracion.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// grafica alcaldias
router.get("/alcaldiasPub", async (req, res) => {
    try {

        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`SELECT 
                  rn.demarcacion_territorial AS id,
                  cdt.demarcacion_territorial AS demarcacion_territorial,
                  COUNT(*) AS total_votos
              FROM registro_necesidad rn
              JOIN cat_demarcacion_territorial cdt 
                  ON rn.demarcacion_territorial = cdt.id
              GROUP BY 
                  rn.demarcacion_territorial,
                  cdt.demarcacion_territorial
              ORDER BY total_votos DESC;`);

        if (result.recordset.length > 0) {
            return res.status(200).json({
                alcaldiasPub: result.recordset
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
router.get("/unidadPub", async (req, res) => {
    try {

        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`SELECT TOP 10
                rn.unidad_territorial  AS id,
                cut.unidad_territorial  AS unidad_territorial ,
                COUNT(*) AS total_votos
            FROM registro_necesidad rn
            JOIN cat_unidad_territorial cut
                ON rn.unidad_territorial  = cut.id
            GROUP BY 
                rn.unidad_territorial,
                cut.unidad_territorial 
            ORDER BY total_votos DESC;`);

        if (result.recordset.length > 0) {
            return res.status(200).json({
                unidadPub: result.recordset
            });
        } else {
            return res.status(200).json({ message: "No se encontraron registros" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error de servidor", error: error.message });
    }
});

export default router;

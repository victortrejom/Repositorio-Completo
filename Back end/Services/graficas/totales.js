import { connectToDatabase, sql } from "../../Config/Configuracion.js";
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// grafica Necesidades registradas
router.get("/getTotales", async (req, res) => {
    try {

        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`SELECT 'Necesidades registradas' AS concepto, COUNT(*) AS total
                    FROM registro_necesidad
                    UNION ALL
                    SELECT 'Ciudadanos registrados' AS concepto, COUNT(*) AS total
                    FROM usuarios u
                    WHERE u.tipo_usuario = 1 
                    AND u.estado_usuario = 2
                    UNION ALL
                    SELECT 'Colonias con necesidades registradas' AS concepto, 
                        COUNT(DISTINCT unidad_territorial) AS total
                    FROM registro_necesidad;`);
        if (result.recordset.length > 0) {
            return res.status(200).json({
                getTotales: result.recordset
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
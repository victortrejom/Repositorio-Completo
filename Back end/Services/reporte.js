import { connectToDatabase, sql } from '../Config/Configuracion.js';
import Midleware from '../Config/Midleware.js';
import express from 'express';
import path from "path";
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";

const API_BASE_URL = process.env.API_BASE_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const router = express.Router();


router.get("/reporteGeneral", Midleware.verifyToken, async (req, res) => {

    const {
        direccion_distrital
    }= req.query
    
    // fecha local formateada
    const original = new Date();
    const offsetInMs = original.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(original.getTime() - offsetInMs);
    const fechaFormateada = fechaLocal.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });


    try {

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input("direccion_distrital", sql.Int, direccion_distrital)
            .query(`SELECT
                a.direccion_distrital AS 'DD',
                c.demarcacion_territorial AS 'Demarcación Territorial',
                d.clave_ut AS 'Clave UT',
                d.unidad_territorial AS 'Unidad Territorial',
                f.primera_categoria AS 'Primera Categoría',
                g.segunda_categoria AS 'Segunda Categoría',
                h.tercera_categoria AS 'Tercera Categoría',
                i.enfoque_especifico AS 'Cuarta Categoría',
                a.titulo_necesidad AS 'Nombre',
                a.descripcion_necesidad AS 'Descripción',
                COUNT(j.id) AS 'Apoyos Recibidos'
                FROM registro_necesidad a
                INNER JOIN cat_demarcacion_territorial c ON a.demarcacion_territorial = c.id
                INNER JOIN cat_unidad_territorial d ON a.unidad_territorial = d.id
                INNER JOIN cat_primera_categoria f ON a.primera_categoria = f.id
                INNER JOIN cat_segunda_categoria g ON a.segunda_categoria = g.id
                INNER JOIN cat_tercera_categoria h ON a.categoria_especifica = h.id
                INNER JOIN cat_enfoque_especifico i ON a.enfoque_especifico = i.id
                LEFT JOIN apoyo_necesidad j ON a.id = j.registro_necesidad                
                WHERE (1=1${direccion_distrital ? ' AND a.direccion_distrital =  @direccion_distrital' : ''})
                GROUP BY
                a.direccion_distrital,
                c.demarcacion_territorial,
                d.clave_ut,
                d.unidad_territorial,
                f.primera_categoria,
                g.segunda_categoria,
                h.tercera_categoria,
                i.enfoque_especifico,
                a.titulo_necesidad,
                a.descripcion_necesidad;`);

        const rows = result.recordset;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Anexo 1");

        //inserta imgaen
        const logoPath = path.join(__dirname, '../assets/iecm.png');
        const logoId = workbook.addImage({
            filename: logoPath,
            extension: "png",
        });

        worksheet.addImage(logoId, {
            tl: { col: 0.1, row: 0.1 },
            ext: { width: 150, height: 70 },
        });

        // Título
        worksheet.mergeCells("A4:K4");
        const direccion = worksheet.getCell("A4");
        direccion.value = "Reporte Repositorio de necesidades 2025";
        direccion.font = { size: 14, bold: true };
        direccion.alignment = { vertical: "middle", horizontal: "center" };

        worksheet.mergeCells("J6:K6");
        const etiqueta1 = worksheet.getCell("J6");
        etiqueta1.value = "Necesidad";
        etiqueta1.font = { size: 14, bold: true };
        etiqueta1.alignment = { vertical: "middle", horizontal: "center" };

        worksheet.mergeCells("H6:I6");
        const etiqueta2 = worksheet.getCell("H6");
        etiqueta2.value = "Clasificación";
        etiqueta2.font = { size: 14, bold: true };
        etiqueta2.alignment = { vertical: "middle", horizontal: "center" };


        //mostrar fecha que se genera el reporte

        const fila5 = worksheet.getRow(5);
        fila5.getCell(11); // K = columna 11

        const cellFecha = worksheet.getCell("K5");
        cellFecha.value = {
        richText: [
            { text: "Fecha: ", font: { size: 12, bold: true } },
            { text: fechaFormateada, font: { size: 12, bold: true } },
        ],
        };
        cellFecha.alignment = { vertical: "middle", horizontal: "left" };

        // Encabezados
        const headers = [
            "DD",
            "Demarcación Territorial",
            "Clave UT",
            "Unidad Territorial",
            "Primera Categoría",
            "Segunda Categoría",
            "Tercera Categoría",
            "Cuarta Categoría",
            "Nombre",
            "Descripción",
            "Apoyos Recibidos"
        ];

        worksheet.addRow(headers);

        // Filtros
        worksheet.autoFilter = {
            from: "A7",
            to: "K7"
        };

        worksheet.getRow(7).eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true
            };
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } },
            };
            });
        
            ["H6", "I6", "J6", "K6"].forEach((cellRef) => {
            const cell = worksheet.getCell(cellRef);
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
            });


        // Datos
        rows.forEach((row) => {
            worksheet.addRow([
                row.DD,
                row["Demarcación Territorial"],
                row["Clave UT"],
                row["Unidad Territorial"],
                row["Primera Categoría"],
                row["Segunda Categoría"],
                row["Tercera Categoría"],
                row["Cuarta Categoría"],
                row["Nombre"],
                row["Descripción"],
                row["Apoyos Recibidos"]
            ]);
        });

        const filaInicioDatos = 8;
        const filaFinalDatos = worksheet.rowCount;

        for (let r = filaInicioDatos; r <= filaFinalDatos; r++) {
        worksheet.getRow(r).eachCell((cell) => {
            cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" }
            };

            cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
            };
        });
        }


        // Ancho de columnas
        worksheet.columns = headers.map(() => ({ width: 28 }));

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=reporte.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al generar el reporte");
    }
});


export default router;
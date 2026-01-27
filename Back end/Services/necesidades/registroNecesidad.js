import { connectToDatabase, sql } from "../../Config/Configuracion.js";
import Midleware from "../../Config/Midleware.js";
import transporter from "../../Config/mail.js";
import generarPDF from "../../Config/generarPDF.js";  
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();


router.post("/altaNecesidad", Midleware.verifyToken, async (req, res) => {

  const {
    direccion_distrital,
    demarcacion_territorial,
    unidad_territorial,
    primera_categoria,
    segunda_categoria,
    categoria_especifica,
    enfoque_especifico,
    titulo_necesidad,
    descripcion_necesidad,
    usuario_registro
  } = req.body;

  if (
    !direccion_distrital ||
    !demarcacion_territorial ||
    !unidad_territorial ||
    !primera_categoria ||
    !segunda_categoria ||
    !categoria_especifica ||
    !enfoque_especifico ||
    !titulo_necesidad ||
    !descripcion_necesidad ||
    !usuario_registro
  ) {
    const faltantes = [];

    if (!direccion_distrital) faltantes.push("direccion_distrital");
    if (!demarcacion_territorial) faltantes.push("demarcacion_territorial");
    if (!unidad_territorial) faltantes.push("unidad_territorial");
    if (!primera_categoria) faltantes.push("primera_categoria");
    if (!segunda_categoria) faltantes.push("segunda_categoria");
    if (!categoria_especifica) faltantes.push("categoria_especifica");
    if (!enfoque_especifico) faltantes.push("enfoque_especifico");
    if (!titulo_necesidad) faltantes.push("titulo_necesidad");
    if (!descripcion_necesidad) faltantes.push("descripcion_necesidad");
    if (!usuario_registro) faltantes.push("usuario_registro");

    return res.status(400).json({
      message: "Faltan datos requeridos",
      faltantes,
    });
  }

  // ---------------- FECHA ----------------
  const original = new Date();
  const offsetInMs = original.getTimezoneOffset() * 60000;
  const fechaLocal = new Date(original.getTime() - offsetInMs);
  const ahora = new Date();
  const horaActual = ahora.toTimeString().split(' ')[0];

  try {
    const pool = await connectToDatabase();
    const transaction = pool.transaction();
    await transaction.begin();

    const usuarioData = await pool.request()
      .input("id", sql.Int, usuario_registro)
      .query(`
        SELECT nombre_completo, correo_electronico 
        FROM usuarios 
        WHERE id = @id
      `);

    if (usuarioData.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { nombre_completo, correo_electronico } = usuarioData.recordset[0];

    const resultadoFolio = await pool.request()
      .input("direccion_distrital", sql.Int, direccion_distrital)
      .query(`
        SELECT MAX(CAST(PARSENAME(REPLACE(folio, '-', '.'), 1) AS INT)) AS ultimoFolio
        FROM registro_necesidad
        WHERE direccion_distrital = @direccion_distrital
      `);

    const ultimoFolio = resultadoFolio.recordset[0].ultimoFolio || 0;
    const siguienteFolio = ultimoFolio + 1;

    const primerCaracter = "F";
    const demarcacionDosDig = direccion_distrital.toString().padStart(2, "0");
    const consecutivoCincoDig = siguienteFolio.toString().padStart(5, "0");

    const folio = `${primerCaracter}${demarcacionDosDig}-${consecutivoCincoDig}`;

    const result = await transaction.request()
      .input("direccion_distrital", sql.Int, direccion_distrital)
      .input("demarcacion_territorial", sql.Int, demarcacion_territorial)
      .input("unidad_territorial", sql.Int, unidad_territorial)
      .input("primera_categoria", sql.Int, primera_categoria)
      .input("segunda_categoria", sql.Int, segunda_categoria)
      .input("categoria_especifica", sql.Int, categoria_especifica)
      .input("enfoque_especifico", sql.Int, enfoque_especifico)
      .input("titulo_necesidad", sql.VarChar, titulo_necesidad)
      .input("descripcion_necesidad", sql.VarChar, descripcion_necesidad)
      .input("folio", sql.VarChar, folio)
      .input("fecha_registro", sql.DateTime, fechaLocal)
      .input("hora_registro", sql.VarChar, horaActual)
      .input("usuario_registro", sql.Int, usuario_registro)
      .query(`
      INSERT INTO registro_necesidad (
        direccion_distrital, demarcacion_territorial, unidad_territorial, 
        primera_categoria, segunda_categoria, categoria_especifica, 
        enfoque_especifico, titulo_necesidad, descripcion_necesidad, 
        folio, fecha_registro, hora_registro, usuario_registro
      ) 
      OUTPUT INSERTED.id
      VALUES (
        @direccion_distrital, @demarcacion_territorial, @unidad_territorial, 
        @primera_categoria, @segunda_categoria, @categoria_especifica, 
        @enfoque_especifico, @titulo_necesidad, @descripcion_necesidad, 
        @folio, @fecha_registro, @hora_registro, @usuario_registro
      );
    `);

    await transaction.commit();

    const nuevoId = result.recordset[0].id;

    const direccionRow = (await pool.request()
      .input("id", sql.Int, direccion_distrital)
      .query(`SELECT direccion_distrital FROM cat_direccion_distrital WHERE id=@id`)
    ).recordset[0];

    const alcaldiaQuery = await pool.request()
    .input("id", sql.Int, demarcacion_territorial)
    .query(`SELECT demarcacion_territorial FROM cat_demarcacion_territorial WHERE id=@id`);
    const alcaldiaRow = alcaldiaQuery.recordset[0];

    const unidadRow = (await pool.request()
      .input("id", sql.Int, unidad_territorial)
      .query(`SELECT unidad_territorial, clave_ut FROM cat_unidad_territorial WHERE id=@id`)
    ).recordset[0];

    const primeraRow = (await pool.request()
      .input("id", sql.Int, primera_categoria)
      .query(`SELECT primera_categoria FROM cat_primera_categoria WHERE id=@id`)
    ).recordset[0];

    const segundaRow = (await pool.request()
      .input("id", sql.Int, segunda_categoria)
      .query(`SELECT segunda_categoria FROM cat_segunda_categoria WHERE id=@id`)
    ).recordset[0];

    const terceraRow = (await pool.request()
      .input("id", sql.Int, categoria_especifica)
      .query(`SELECT tercera_categoria FROM cat_tercera_categoria WHERE id=@id`)
    ).recordset[0];

    const enfoqueRow = (await pool.request()
      .input("id", sql.Int, enfoque_especifico)
      .query(`SELECT enfoque_especifico FROM cat_enfoque_especifico WHERE id=@id`)
    ).recordset[0];

    const direccionNombre = direccionRow ? direccionRow.direccion_distrital : "";
    const alcaldiaNombre = alcaldiaRow ? alcaldiaRow.demarcacion_territorial : "";
    const unidadNombre = unidadRow ? unidadRow.unidad_territorial : "";
    const claveUTValor = unidadRow ? unidadRow.clave_ut : "";
    const primeraNombre = primeraRow ? primeraRow.primera_categoria : "";
    const segundaNombre = segundaRow ? segundaRow.segunda_categoria : "";
    const terceraNombre = terceraRow ? terceraRow.tercera_categoria : "";
    const enfoqueNombre = enfoqueRow ? enfoqueRow.enfoque_especifico : "";


    const datosParaPDF = {
      folio,
      alcaldia: alcaldiaNombre,               
      direccion_distrital: direccionNombre,   
      unidad_territorial: unidadNombre,       
      clave_ut: claveUTValor,                 
      primera_categoria: primeraNombre,
      segunda_categoria: segundaNombre,
      categoria_especifica: terceraNombre,
      enfoque_especifico: enfoqueNombre,
      titulo_necesidad,
      descripcion_necesidad,
      nombre_usuario: nombre_completo,
      fecha: fechaLocal
    };

    const pdfPath = await generarPDF(datosParaPDF);

    await transporter.sendMail({
      from: `"Sistema de Necesidades" <${process.env.EMAIL_USER}>`,
      to: correo_electronico,
      subject: "Registro de Necesidad Exitoso",
      html: `
        <h2>Hola ${nombre_completo}</h2>
        <p>Tu necesidad ha sido registrada correctamente.</p>
        <p><strong>Folio asignado:</strong> ${folio}</p>
        <p>Se adjunta el PDF con la información de tu registro.</p>
      `,
      attachments: [
        {
          filename: `${folio}.pdf`,
          path: pdfPath,
          contentType: "application/pdf"
        }
      ]
    });

    return res.status(200).json({
      message: "Registro creado correctamente, PDF generado y correo enviado",
      folio,
      id: nuevoId,
      code: 200,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al guardar en BD o enviar correo" });
  }
});


////consulta sumate a una necesidad
router.get("/sumate", async (req, res) => {
  try {
    const {
      direccion_distrital,
      demarcacion_territorial,
      unidad_territorial,
      id_categoria,
      ordenar
    } = req.query;

    const ordenarNum = ordenar ? Number(ordenar) : null;

    const pool = await connectToDatabase();

    const result = await pool.request()
      .input("direccion_distrital", sql.Int, direccion_distrital || null)
      .input("demarcacion_territorial", sql.Int, demarcacion_territorial || null)
      .input("unidad_territorial", sql.Int, unidad_territorial || null)
      .input("id_categoria", sql.Int, id_categoria || null)
      .input("ordenar", sql.Int, ordenarNum)
      .query(`
        SELECT 
            rn.id AS id_necesidad,
            rn.titulo_necesidad,
            rn.descripcion_necesidad,
            cpc.id AS id_categoria,
            cpc.primera_categoria AS categoria,
            rn.unidad_territorial,
            rn.fecha_registro,
            COUNT(an.registro_necesidad) AS total_votos
        FROM registro_necesidad rn
        LEFT JOIN apoyo_necesidad an 
            ON an.registro_necesidad = rn.id 
        LEFT JOIN cat_primera_categoria cpc 
            ON rn.primera_categoria = cpc.id 
        LEFT JOIN cat_segunda_categoria csc 
            ON rn.segunda_categoria = csc.id 
        LEFT JOIN cat_tercera_categoria ctc 
            ON rn.categoria_especifica = ctc.id  
        WHERE 
            (@direccion_distrital IS NULL OR rn.direccion_distrital = @direccion_distrital) AND
            (@demarcacion_territorial IS NULL OR rn.demarcacion_territorial = @demarcacion_territorial) AND
            (@unidad_territorial IS NULL OR rn.unidad_territorial = @unidad_territorial) AND
            (@id_categoria IS NULL OR cpc.id = @id_categoria)
        GROUP BY 
            rn.id,
            rn.titulo_necesidad,
            rn.descripcion_necesidad,
            cpc.id,
            cpc.primera_categoria,
            rn.unidad_territorial,
            rn.fecha_registro
        ORDER BY
  CASE 
     WHEN @ordenar = 1 THEN COUNT(an.registro_necesidad)
  END DESC,
  CASE 
     WHEN @ordenar = 2 THEN rn.fecha_registro
  END DESC,
  CASE 
     WHEN @ordenar = 3 THEN LTRIM(RTRIM(rn.titulo_necesidad))
  END ASC;
      `);

    return res.status(200).json({ sumate: result.recordset });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});



// registro de votos
router.post("/nuevoVoto", Midleware.verifyToken, async (req, res) => {

    const {
        registro_necesidad,
        usuario_registro
    } = req.body;

    if (!registro_necesidad || !usuario_registro) {
        const faltantes = [];

        if (!registro_necesidad) faltantes.push("registro_necesidad");
        if (!usuario_registro) faltantes.push("usuario_registro");

        return res.status(400).json({
            message: "Faltan datos requeridos",
            faltantes,
        });
    }

    // fecha y hora
    const original = new Date();
    const offsetInMs = original.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(original.getTime() - offsetInMs);
    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(' ')[0];

    try {

        const pool = await connectToDatabase();

        // 🟡 1. VALIDAR SI YA EXISTE EL VOTO
        const existeVoto = await pool.request()
            .input('registro_necesidad', sql.Int, registro_necesidad)
            .input('usuario_registro', sql.Int, usuario_registro)
            .query(`
                SELECT id 
                FROM apoyo_necesidad 
                WHERE registro_necesidad = @registro_necesidad
                AND usuario_registro = @usuario_registro
            `);

        if (existeVoto.recordset.length > 0) {
            return res.status(409).json({
                message: "Este usuario ya apoyó esta necesidad",
                code: 409
            });
        }

        // 🟢 2. SI NO EXISTE, GUARDAR VOTO
        const transaction = pool.transaction();
        await transaction.begin();

        const result = await transaction.request()
            .input('registro_necesidad', sql.Int, registro_necesidad)
            .input('fecha_registro', sql.DateTime, fechaLocal)
            .input('hora_registro', sql.VarChar, horaActual)
            .input('usuario_registro', sql.Int, usuario_registro)
            .query(`
                INSERT INTO apoyo_necesidad 
                (registro_necesidad, fecha_registro, hora_registro, usuario_registro)
                OUTPUT INSERTED.id
                VALUES (@registro_necesidad, @fecha_registro, @hora_registro, @usuario_registro)
            `);

        await transaction.commit();

        return res.status(200).json({
            message: "Su apoyo fue registrado",
            code: 200,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error al guardar en BD" });
    }

});



// verificar si ya votó
router.get("/verificarVoto", Midleware.verifyToken, async (req, res) => {
    const { registro_necesidad, usuario_registro } = req.query;

    if (!registro_necesidad || !usuario_registro) {
        return res.status(400).json({
            message: "Faltan parámetros",
            faltantes: {
                registro_necesidad: !registro_necesidad,
                usuario_registro: !usuario_registro
            }
        });
    }

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('registro_necesidad', sql.Int, registro_necesidad)
            .input('usuario_registro', sql.Int, usuario_registro)
            .query(`
                SELECT id 
                FROM apoyo_necesidad 
                WHERE registro_necesidad = @registro_necesidad 
                AND usuario_registro = @usuario_registro
            `);

        const haVotado = result.recordset.length > 0;

        return res.status(200).json({
            haVotado
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en la consulta" });
    }
});


//consulta ficha
router.get("/getRegistro", async (req, res) => {
    const { idNecesidad } = req.query;

    if (!idNecesidad) {
        return res.status(400).json({
            message: "Faltan parámetros",
            faltantes: {
                idNecesidad: !idNecesidad
            }
        });
    }

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('idNecesidad', sql.Int, idNecesidad)
            .query(`select 
                rn.id, 
                rn.demarcacion_territorial, 
                rn.unidad_territorial, 
                rn.primera_categoria, 
                rn.segunda_categoria, 
                rn.categoria_especifica, 
                rn.enfoque_especifico, 
                rn.titulo_necesidad, 
                rn.descripcion_necesidad,
                rn.folio                  
                from registro_necesidad rn 
                where rn.id=@idNecesidad;`);

   if (result.recordset.length > 0) {
      return res.status(200).json({
        getRegistro: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
}); 




export default router;

import { connectToDatabase, sql } from '../Config/Configuracion.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();


//catalogo Alcaldia
router.get("/cat_alcaldia", async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .query(`SELECT 
                    id,
                    demarcacion_territorial                    
                FROM cat_demarcacion_territorial
                order by demarcacion_territorial asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        cat_alcaldia: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


//catalogo Unidad Territorial
router.get("/cat_unidadTerritorial", async (req, res) => {
  
  const { id } = req.query;

    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`select id, unidad_territorial, clave_ut, direccion_distrital   
            from cat_unidad_territorial  
            where demarcacion_territorial = @id
            order by unidad_territorial asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        cat_unidadTerritorial: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


//catalogo Clave UT
router.get("/getClaveUT", async (req, res) => {
  
  const { id } = req.query;

    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`select id, unidad_territorial, clave_ut, direccion_distrital   
            from cat_unidad_territorial  
            where id = @id
            order by clave_ut asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getClaveUT: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

router.get("/getPrimerCategoria", async (req, res) => {
  
    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .query(`select id, primera_categoria  
              from cat_primera_categoria
              order by primera_categoria asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getPrimerCategoria: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


//catalogo segunda categoria
router.get("/getSegundaCategoria", async (req, res) => {
  
  const { id } = req.query;

    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`select csc.id, csc.segunda_categoria  
              from cat_segunda_categoria csc 
              join cat_primera_categoria cpc on csc.primera_categoria = cpc.id 
              where cpc.id = @id
            order by csc.segunda_categoria asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getSegundaCategoria: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

//catalogo tercer categoria
router.get("/getTercerCategoria", async (req, res) => {
  
  const { id } = req.query;

    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`select ctc.id, ctc.tercera_categoria 
              from cat_tercera_categoria ctc 
              join cat_segunda_categoria csc on ctc.segunda_categoria = csc.id  
            where csc.id = @id
            order by ctc.tercera_categoria asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getTercerCategoria: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


//catalogo tercer categoria
router.get("/getCatalogoEnfoqueEsp", async (req, res) => {
  
    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .query(`select id, enfoque_especifico  
   		        from cat_enfoque_especifico
            order by enfoque_especifico asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        getCatalogoEnfoqueEsp: result.recordset
      });
    } else {
      return res.status(200).json({ message: "No se encontro catalogo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});


//catalogo Unidad Territorial general
router.get("/cat_unidadTerritorialAll", async (req, res) => {
  
    try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .query(`select id, unidad_territorial, clave_ut, direccion_distrital   
            from cat_unidad_territorial  
            order by unidad_territorial asc;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        cat_unidadTerritorialAll: result.recordset
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

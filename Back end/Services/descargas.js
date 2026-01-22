import express from 'express';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//descarga 
router.get("/downloadCategoria/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads/docx", filename);

  if (!fs.existsSync(filePath)) {
    console.error("Archivo no encontrado:", filePath);
    return res.status(404).json({ message: "Archivo no encontrado" });
  }

  // Validar extensión solo Word (.doc o .docx)
  const ext = path.extname(filename).toLowerCase();
  if (ext !== ".doc" && ext !== ".docx") {
    return res.status(400).json({ message: "Solo se permiten archivos de Word" });
  }

  let nombreOriginal = filename;
  const guionIndex = filename.indexOf("-");
  if (guionIndex > -1) {
    nombreOriginal = filename.substring(guionIndex + 1);
  }

  res.download(filePath, nombreOriginal, (err) => {
    if (err) {
      console.error("Error al descargar:", err);
      res.status(500).json({ message: "Error al descargar archivo" });
    }
  });
});


export default router;

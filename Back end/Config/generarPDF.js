// Config/generarPDF.js
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generarPDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // valores por defecto para evitar undefined
      const {
        folio = "",
        alcaldia = "",
        direccion_distrital = "",
        unidad_territorial = "",
        clave_ut = "",
        primera_categoria = "",
        segunda_categoria = "",
        categoria_especifica = "",
        enfoque_especifico = "",
        titulo_necesidad = "",
        descripcion_necesidad = "",
        nombre_usuario = ""
      } = data || {};

      const folderPath = "./public/pdfs";
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

      const safeFolio = folio.replace(/[^a-zA-Z0-9-_]/g, "_") || `registro_${Date.now()}`;
      const filePath = path.join(folderPath, `${safeFolio}.pdf`);
      const doc = new PDFDocument({ size: "LETTER", margin: 50 });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const margin = 50;

      // ========= STYLES =========
      const labelFont = "Helvetica";
      const valueFont = "Helvetica-Bold";
      const titleFontSize = 14;
      const sectionTitleSize = 12;
      const labelSize = 10;
      const valueSize = 11;
      const lineGap = 6;

      // ---------- Folio arriba a la derecha ----------
      const folioBoxWidth = 160;
      const folioBoxHeight = 30;
      const folioX = pageWidth - margin - folioBoxWidth;
      const folioY = margin - 10;

      // dibujar caja del folio (fondo claro)
      doc
        .rect(folioX, folioY, folioBoxWidth, folioBoxHeight)
        .fillOpacity(0.12)
        .fillAndStroke("#0f5132", "#0f5132")
        .fillOpacity(1);

      // escribir folio
      doc
        .font(valueFont)
        .fontSize(12)
        .fillColor("#000")
        .text(`Folio: ${folio}`, folioX + 10, folioY + 7, {
          width: folioBoxWidth - 20,
          align: "left"
        });

      // ---------- Encabezado principal (sin imagen) ----------
      doc.moveDown(2);
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#000")
        .text("Registro de Necesidad", margin, folioY + folioBoxHeight + 10, {
          align: "left"
        });

      doc.moveDown(0.5);

      // Usuario (a la izquierda, bajo el título)
      doc
        .font(labelFont)
        .fontSize(labelSize)
        .fillColor("#333")
        .text(`Registrado por:`, margin, doc.y + 6);
      doc
        .font(valueFont)
        .fontSize(valueSize)
        .text(` ${nombre_usuario}`, doc.x, doc.y - lineGap, { continued: false });

      doc.moveDown(1);

      // ---------- Sección: Ubicación ----------
      doc
        .moveTo(margin, doc.y)
        .lineTo(pageWidth - margin, doc.y)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke();

      doc.moveDown(0.8);

      doc
        .font("Helvetica-Bold")
        .fontSize(sectionTitleSize)
        .fillColor("#000")
        .text("Ubicación", margin);

      doc.moveDown(0.6);

      // Layout columnas para ubicación
      const col1X = margin;
      const col2X = margin + 300;
      let currentY = doc.y;

      // Alcaldía
      doc.font(labelFont).fontSize(labelSize).fillColor("#333").text("Alcaldía:", col1X, currentY);
      doc.font(valueFont).fontSize(valueSize).text(alcaldia, col1X + 80, currentY);

      // Unidad Territorial (col2)
      doc.font(labelFont).fontSize(labelSize).text("Unidad Territorial:", col2X, currentY);
      doc.font(valueFont).fontSize(valueSize).text(unidad_territorial, col2X + 110, currentY);

      currentY = doc.y + 12;

      // Dirección Distrital (full width)
      doc.font(labelFont).fontSize(labelSize).text("Dirección Distrital:", col1X, currentY);
      doc.font(valueFont).fontSize(valueSize).text(direccion_distrital, col1X + 110, currentY);

      currentY = doc.y + 12;

      // Clave UT (col2 small)
      doc.font(labelFont).fontSize(labelSize).text("Clave UT:", col2X, currentY - 24);
      doc.font(valueFont).fontSize(valueSize).text(clave_ut, col2X + 60, currentY - 24);

      doc.moveDown(1.2);

      // ---------- Sección: Categorías ----------
      doc
        .font("Helvetica-Bold")
        .fontSize(sectionTitleSize)
        .fillColor("#000")
        .text("Categorías", margin);

      doc.moveDown(0.6);

      // Primera / Segunda / Específica / Enfoque
      const catCol1X = margin;
      const catCol2X = margin + 300;

      // Primera categoria
      doc.font(labelFont).fontSize(labelSize).fillColor("#333").text("Primera categoría:", catCol1X);
      doc.font(valueFont).fontSize(valueSize).text(primera_categoria, catCol1X + 120, doc.y - lineGap);

      // Segunda categoria (col2)
      doc.font(labelFont).fontSize(labelSize).text("Segunda categoría:", catCol2X, doc.y - lineGap - 2);
      doc.font(valueFont).fontSize(valueSize).text(segunda_categoria, catCol2X + 120, doc.y - lineGap - 2);

      doc.moveDown(1);

      // Categoría específica
      doc.font(labelFont).fontSize(labelSize).text("Categoría específica:", catCol1X);
      doc.font(valueFont).fontSize(valueSize).text(categoria_especifica, catCol1X + 130, doc.y - lineGap);

      // Enfoque específico
      doc.font(labelFont).fontSize(labelSize).text("Enfoque específico:", catCol2X, doc.y - lineGap - 2);
      doc.font(valueFont).fontSize(valueSize).text(enfoque_especifico, catCol2X + 120, doc.y - lineGap - 2);

      doc.moveDown(1.2);

      // ---------- Línea separadora ----------
      doc
        .moveTo(margin, doc.y)
        .lineTo(pageWidth - margin, doc.y)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke();

      doc.moveDown(0.8);

      // ---------- TÍTULO ----------
      doc
        .font("Helvetica-Bold")
        .fontSize(titleFontSize)
        .fillColor("#000")
        .text("Título de la necesidad", margin);

      doc.moveDown(0.6);

      doc.font("Helvetica").fontSize(valueSize).text(titulo_necesidad, {
        width: pageWidth - margin * 2,
        align: "left"
      });

      doc.moveDown(0.8);

      // ---------- DESCRIPCIÓN ----------
      doc
        .font("Helvetica-Bold")
        .fontSize(sectionTitleSize)
        .fillColor("#000")
        .text("Descripción", margin);

      doc.moveDown(0.6);

      doc.font("Helvetica").fontSize(valueSize).text(descripcion_necesidad, {
        width: pageWidth - margin * 2,
        align: "justify",
        lineGap: 3
      });

      // ---------- Pie (opcional) ----------
      doc.moveDown(1.2);
      doc.fontSize(9).font("Helvetica").fillColor("#666");
      doc.text(`Documento generado automáticamente. Folio: ${folio}`, { align: "left" });

      // terminar
      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export default generarPDF;

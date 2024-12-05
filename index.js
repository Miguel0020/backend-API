import express from "express"
import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express()
const port = parseInt(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;


const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

app.get('/', async(req, res) => {
  res.send("I am alive")
})

app.get("/tarjeta", async (req, res) => {
  const ans = await turso.execute(`
    SELECT tarjeta.*, categoria.nombre AS categoria_nombre 
    FROM tarjeta 
    LEFT JOIN categoria ON tarjeta.categoria_id = categoria.id
  `);
  console.log(ans);
  res.json(ans.rows);
});


app.post("/tarjeta", async (req, res) => {
  const { title, value, description, images, categoria_id} = req.body;

  try {
    const ans = await turso.execute({
      sql: `INSERT INTO tarjeta (title, value, description, images, categoria_id, create_ad) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [title, value, description, images, categoria_id]
    });
    res.json({
      mensaje: "Tarjeta creada",
      usuario: ans,
    });
  } catch (error) {
    console.error("Error al crear la tarjeta:", error);
    res.status(404).json({
      mensaje: "Error al crear la tarjeta"
    });
  }
});



// Ruta para actualizar una tarjeta
app.put("/tarjeta/:tarj_id", async (req, res) => {
  const { tarj_id } = req.params;
  const { title, value, description, images, categoria_id} = req.body;

  try {
    // Verificar si la tarjeta existe
    const check = await turso.execute({
      sql: `SELECT * FROM tarjeta WHERE tarj_id = ?`,
      args: [tarj_id]
    });

    if (check.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarjeta no encontrada" });
    }

    // Si la tarjeta existe, realiza el UPDATE
    const ans = await turso.execute({
      sql: `UPDATE tarjeta SET title = ?, value = ?, description = ?, images = ?, categoria_id = ?, updated_at = CURRENT_TIMESTAMP WHERE tarj_id = ? `,
      args: [title, value, description, images, categoria_id, tarj_id]
    });
    
    res.json({
      mensaje: "Tarjeta actualizada",
      tarjeta: ans
    });
  } catch (error) {
    console.error("Error al actualizar la tarjeta:", error);
    res.status(404).json({
      mensaje: "Error al actualizar la tarjeta"
    });
  }
});

// Eliminar una tarjeta
app.delete("/tarjeta/:tarj_id", async (req, res) => {
  const { tarj_id } = req.params;

  try {
    const ans = await turso.execute({
      sql: `DELETE FROM tarjeta WHERE tarj_id = ?`,
      args: [tarj_id]
    });
    
    // Verificar si se eliminó alguna fila
    if (ans.rowsAffected === 0) {
      return res.status(404).json({ mensaje: "Tarjeta no encontrada" });
    }

    res.json({
      mensaje: "Tarjeta eliminada",
      resultado: ans
    });
  } catch (error) {
    console.error("Error al eliminar la tarjeta:", error);
    res.status(404).json({
      mensaje: "Error al eliminar la tarjeta"
    });
  }
});

app.get("/categoria", async(req, res) => {
  //"Select * from categoria"
  const ans = await turso.execute(`SELECT * FROM categoria`);
  console.log(ans);
  res.json( ans.rows )
});

app.post("/categoria", async (req, res) => {
  const { nombre } = req.body;

  try {
    const ans = await turso.execute({
      sql: `INSERT INTO categoria (nombre) VALUES (?)`,
      args: [nombre]
    });
    res.json({
      mensaje: "Categoria creada",
      usuario: ans,
    });
  } catch (error) {
    console.error("Error al crear la Categoria:", error);
    res.status(404).json({
      mensaje: "Error al crear la categoria"
    });
  }
});


app.put("/categoria/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre} = req.body;

  try {
    const check = await turso.execute({
      sql: `SELECT * FROM categoria WHERE id = ?`,
      args: [id]
    });

    if (check.rows.length === 0) {
      return res.status(404).json({ mensaje: "Categoria no encontrada" });
    }

    // Si la tarjeta existe, realiza el UPDATE
    const ans = await turso.execute({
      sql: `UPDATE categoria SET nombre = ? WHERE id = ?`,
      args: [nombre, id]
    });
    
    res.json({
      mensaje: "categoria actualizada",
      tarjeta: ans
    });
  } catch (error) {
    console.error("Error al actualizar la categoria:", error);
    res.status(404).json({
      mensaje: "Error al actualizar la categoria"
    });
  }
});


app.delete("/categoria/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const ans = await turso.execute({
      sql: `DELETE FROM categoria WHERE id = ?`,
      args: [id]
    });
    
    // Verificar si se eliminó alguna fila
    if (ans.rowsAffected === 0) {
      return res.status(404).json({ mensaje: "Categoria no encontrada" });
    }
    res.json({
      mensaje: "Categoria eliminada",
      resultado: ans
    });
  } catch (error) {
    console.error("Error al eliminar la Categoria:", error);
    res.status(404).json({
      mensaje: "Error al eliminar la Categoria"
    });
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})


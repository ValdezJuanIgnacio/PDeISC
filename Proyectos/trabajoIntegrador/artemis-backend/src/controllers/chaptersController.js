const db = require("../config/database");

// NUEVA FUNCIÓN - Obtener capítulos por ID de libro
exports.getChaptersByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log("📖 Obteniendo capítulos del libro:", bookId);

    // Verificar que el libro existe
    const [books] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Obtener capítulos
    const [chapters] = await db.query(
      "SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number",
      [bookId]
    );

    console.log("✅ Capítulos encontrados:", chapters.length);
    res.json(chapters);
  } catch (error) {
    console.error("❌ Error en getChaptersByBookId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createChapter = async (req, res) => {
  try {
    const { book_id, chapter_number, title, content } = req.body;

    console.log("📝 Creando capítulo para libro:", book_id);
    console.log("Contenido recibido - longitud:", content?.length);

    // Validaciones básicas
    if (!book_id || !title || !content) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
        details: {
          book_id: !book_id,
          title: !title,
          content: !content,
        },
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        message: "El título es demasiado largo (máximo 255 caracteres)",
      });
    }

    // Verificar que el libro pertenece al usuario
    const [books] = await db.query("SELECT * FROM books WHERE id = ?", [
      book_id,
    ]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (books[0].writer_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [result] = await db.query(
      "INSERT INTO chapters (book_id, chapter_number, title, content) VALUES (?, ?, ?, ?)",
      [book_id, chapter_number, title, content]
    );

    console.log("✅ Capítulo creado con ID:", result.insertId);

    res.status(201).json({
      message: "Chapter created successfully",
      chapterId: result.insertId,
      chapter: {
        id: result.insertId,
        book_id,
        chapter_number,
        title,
        content: content.substring(0, 100) + "...",
      },
    });
  } catch (error) {
    console.error("❌ Error en createChapter:", error);
    res.status(500).json({
      message: "Error al crear el capítulo",
      error: error.sqlMessage || error.message,
    });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const chapterId = req.params.id;

    console.log("✏️ Actualizando capítulo:", chapterId);

    // Verificar permisos
    const [chapters] = await db.query(
      `
      SELECT c.*, b.writer_id 
      FROM chapters c 
      JOIN books b ON c.book_id = b.id 
      WHERE c.id = ?
    `,
      [chapterId]
    );

    if (chapters.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapters[0].writer_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query("UPDATE chapters SET title = ?, content = ? WHERE id = ?", [
      title,
      content,
      chapterId,
    ]);

    console.log("✅ Capítulo actualizado");

    res.json({ message: "Chapter updated successfully" });
  } catch (error) {
    console.error("❌ Error actualizando capítulo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;

    const [chapters] = await db.query(
      `
      SELECT c.*, b.writer_id 
      FROM chapters c 
      JOIN books b ON c.book_id = b.id 
      WHERE c.id = ?
    `,
      [chapterId]
    );

    if (chapters.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapters[0].writer_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query("DELETE FROM chapters WHERE id = ?", [chapterId]);
    res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const db = require("../config/database");

exports.getAllBooks = async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT b.*, u.username as writer_name 
      FROM books b 
      JOIN users u ON b.writer_id = u.id 
      WHERE b.status = 'published'
      ORDER BY b.published_at DESC
    `);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NUEVA FUNCIÓN - Obtener solo libros publicados con estadísticas
exports.getPublishedBooks = async (req, res) => {
  try {
    console.log("📚 Obteniendo libros publicados con estadísticas");

    const [books] = await db.query(`
      SELECT 
        b.*, 
        u.username as writer_name,
        u.profile_image_url as writer_profile_image,
        (SELECT COUNT(*) FROM likes WHERE book_id = b.id) as like_count,
        (SELECT COUNT(*) FROM dislikes WHERE book_id = b.id) as dislike_count,
        (SELECT COUNT(*) FROM comments WHERE book_id = b.id) as comment_count
      FROM books b 
      JOIN users u ON b.writer_id = u.id 
      WHERE b.status = 'published'
      ORDER BY b.published_at DESC
    `);

    console.log("✅ Libros publicados encontrados:", books.length);
    res.json(books);
  } catch (error) {
    console.error("❌ Error en getPublishedBooks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Obtener libros del usuario autenticado
exports.getMyBooks = async (req, res) => {
  try {
    console.log("📚 Obteniendo libros del usuario:", req.user.id);

    const [books] = await db.query(
      `
      SELECT b.*, u.username as writer_name 
      FROM books b 
      JOIN users u ON b.writer_id = u.id 
      WHERE b.writer_id = ?
      ORDER BY b.created_at DESC
    `,
      [req.user.id]
    );

    console.log("✅ Libros encontrados:", books.length);
    res.json(books);
  } catch (error) {
    console.error("❌ Error en getMyBooks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const [books] = await db.query(
      `
      SELECT 
        b.*, 
        u.username as writer_name,
        u.profile_image_url as writer_profile_image,
        (SELECT COUNT(*) FROM likes WHERE book_id = b.id) as like_count,
        (SELECT COUNT(*) FROM dislikes WHERE book_id = b.id) as dislike_count
      FROM books b 
      JOIN users u ON b.writer_id = u.id 
      WHERE b.id = ?
    `,
      [req.params.id]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Si el libro es de tipo in_app, obtener capítulos
    if (books[0].type === "in_app") {
      const [chapters] = await db.query(
        "SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number",
        [req.params.id]
      );
      books[0].chapters = chapters;
    }

    res.json(books[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, genre, synopsis, cover_image_url, type } = req.body;
    const writer_id = req.user.id;

    console.log("📗 Creando libro para usuario:", writer_id);

    const [result] = await db.query(
      "INSERT INTO books (writer_id, title, genre, synopsis, cover_image_url, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        writer_id,
        title,
        genre,
        synopsis,
        cover_image_url,
        type || "in_app",
        "draft",
      ]
    );

    console.log("✅ Libro creado con ID:", result.insertId);

    res.status(201).json({
      message: "Book created successfully",
      bookId: result.insertId,
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error creando libro:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, genre, synopsis, cover_image_url, status } = req.body;
    const bookId = req.params.id;

    // Verificar que el libro pertenece al usuario o es admin
    const [books] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (books[0].writer_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Construir query dinámicamente según los campos proporcionados
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (genre !== undefined) {
      updates.push("genre = ?");
      values.push(genre);
    }
    if (synopsis !== undefined) {
      updates.push("synopsis = ?");
      values.push(synopsis);
    }
    if (cover_image_url !== undefined) {
      updates.push("cover_image_url = ?");
      values.push(cover_image_url);
    }
    // Permitir cambiar el status (para despublicar)
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    values.push(bookId);

    await db.query(
      `UPDATE books SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const [books] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (books[0].writer_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query("DELETE FROM books WHERE id = ?", [bookId]);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.submitBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const [books] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (books[0].writer_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query("UPDATE books SET status = ? WHERE id = ?", [
      "submitted",
      bookId,
    ]);
    res.json({ message: "Book submitted for review" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.publishBook = async (req, res) => {
  try {
    console.log("📚 Iniciando proceso de publicación...");
    const bookId = req.params.id;

    // Verificar que el libro existe
    const [books] = await db.query(`SELECT * FROM books WHERE id = ?`, [
      bookId,
    ]);

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    const book = books[0];

    // Permitir que el escritor publique su propio libro
    if (book.writer_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para publicar este libro",
      });
    }

    // Verificar que el libro tenga la información necesaria
    if (!book.title || !book.genre || !book.synopsis) {
      return res.status(400).json({
        success: false,
        message:
          "El libro debe tener título, género y sinopsis antes de ser publicado",
        missingFields: {
          title: !book.title,
          genre: !book.genre,
          synopsis: !book.synopsis,
        },
      });
    }

    // Verificar que tenga al menos un capítulo
    const [chapters] = await db.query(
      "SELECT id, title, content FROM chapters WHERE book_id = ?",
      [bookId]
    );

    if (chapters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El libro debe tener al menos un capítulo para ser publicado",
      });
    }

    // Verificar que todos los capítulos tengan contenido
    const chaptersWithoutContent = chapters.filter(
      (chapter) => !chapter.content || chapter.content.trim().length === 0
    );

    if (chaptersWithoutContent.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Todos los capítulos deben tener contenido",
        emptyChapters: chaptersWithoutContent.map((c) => ({
          id: c.id,
          title: c.title,
        })),
      });
    }

    // Todo está bien, publicar el libro
    await db.query(
      "UPDATE books SET status = ?, published_at = NOW() WHERE id = ?",
      ["published", bookId]
    );

    console.log("✅ Libro publicado exitosamente");
    res.json({
      success: true,
      message: "Libro publicado exitosamente",
      publishedAt: new Date(),
    });
  } catch (error) {
    console.error("❌ Error publicando libro:", error);
    res.status(500).json({
      success: false,
      message: "Error al publicar el libro",
      error: error.message,
    });
  }
};

// NUEVA FUNCIÓN - Descargar libro como PDF
exports.downloadPDF = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Obtener el libro con todos sus capítulos
    const [books] = await db.query(
      `SELECT b.*, u.username as writer_name 
       FROM books b 
       JOIN users u ON b.writer_id = u.id 
       WHERE b.id = ?`,
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = books[0];

    // Obtener capítulos
    const [chapters] = await db.query(
      "SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number",
      [bookId]
    );

    // Aquí deberías usar una librería como pdfkit para generar el PDF
    // Por ahora, retornamos los datos
    res.json({
      message: "PDF generation would happen here",
      book,
      chapters,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = exports;

const db = require("../config/database");

// Obtener comentarios de un libro
exports.getBookComments = async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log("💬 Obteniendo comentarios del libro:", bookId);

    const [comments] = await db.query(
      `SELECT 
        c.*, 
        u.username, 
        u.profile_image_url as user_profile_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.book_id = ? AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC`,
      [bookId]
    );

    console.log("✅ Comentarios encontrados:", comments.length);
    res.json(comments);
  } catch (error) {
    console.error("❌ Error en getBookComments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Obtener comentarios de un capítulo
exports.getChapterComments = async (req, res) => {
  try {
    const { chapterId } = req.params;

    console.log("💬 Obteniendo comentarios del capítulo:", chapterId);

    const [comments] = await db.query(
      `SELECT 
        c.*, 
        u.username, 
        u.profile_image_url as user_profile_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.chapter_id = ? AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC`,
      [chapterId]
    );

    console.log("✅ Comentarios encontrados:", comments.length);
    res.json(comments);
  } catch (error) {
    console.error("❌ Error en getChapterComments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Crear comentario
exports.createComment = async (req, res) => {
  try {
    const { content, book_id, chapter_id, parent_comment_id } = req.body;
    const userId = req.user.id;

    console.log("💬 Creando comentario - Usuario:", userId);

    // Validaciones
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (!book_id && !chapter_id) {
      return res.status(400).json({
        message: "Either book_id or chapter_id is required",
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: "Comment is too long (max 1000 characters)",
      });
    }

    // Insertar comentario
    const [result] = await db.query(
      `INSERT INTO comments (content, book_id, chapter_id, user_id, parent_comment_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        content,
        book_id || null,
        chapter_id || null,
        userId,
        parent_comment_id || null,
      ]
    );

    console.log("✅ Comentario creado con ID:", result.insertId);

    // Obtener el comentario creado con los datos del usuario
    const [newComment] = await db.query(
      `SELECT 
        c.*, 
        u.username, 
        u.profile_image_url as user_profile_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Comment created successfully",
      comment: newComment[0],
    });
  } catch (error) {
    console.error("❌ Error en createComment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Actualizar comentario
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    console.log("✏️ Actualizando comentario:", id);

    // Verificar que el comentario pertenece al usuario
    const [comments] = await db.query(
      "SELECT * FROM comments WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        message: "Comment not found or you don't have permission",
      });
    }

    // Validar contenido
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: "Comment is too long (max 1000 characters)",
      });
    }

    await db.query(
      "UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?",
      [content, id]
    );

    console.log("✅ Comentario actualizado");
    res.json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("❌ Error en updateComment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Eliminar comentario
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("🗑️ Eliminando comentario:", id);

    // Verificar que el comentario pertenece al usuario o es admin
    const [comments] = await db.query("SELECT * FROM comments WHERE id = ?", [
      id,
    ]);

    if (comments.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comments[0].user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query("DELETE FROM comments WHERE id = ?", [id]);

    console.log("✅ Comentario eliminado");
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("❌ Error en deleteComment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Responder a un comentario
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    console.log("↩️ Respondiendo a comentario:", commentId);

    // Verificar que el comentario padre existe
    const [parentComments] = await db.query(
      "SELECT * FROM comments WHERE id = ?",
      [commentId]
    );

    if (parentComments.length === 0) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const parentComment = parentComments[0];

    // Crear la respuesta
    const [result] = await db.query(
      `INSERT INTO comments (content, book_id, chapter_id, user_id, parent_comment_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        content,
        parentComment.book_id,
        parentComment.chapter_id,
        userId,
        commentId,
      ]
    );

    console.log("✅ Respuesta creada con ID:", result.insertId);

    res.status(201).json({
      message: "Reply created successfully",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error en replyToComment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Obtener respuestas de un comentario
exports.getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    console.log("💬 Obteniendo respuestas del comentario:", commentId);

    const [replies] = await db.query(
      `SELECT 
        c.*, 
        u.username, 
        u.profile_image_url as user_profile_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id = ?
      ORDER BY c.created_at ASC`,
      [commentId]
    );

    console.log("✅ Respuestas encontradas:", replies.length);
    res.json(replies);
  } catch (error) {
    console.error("❌ Error en getCommentReplies:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = exports;

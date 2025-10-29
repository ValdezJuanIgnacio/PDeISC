const pool = require("../config/database");

// Obtener comentarios de un libro
exports.getBookComments = async (req, res) => {
  try {
    const { bookId } = req.params;
    const [comments] = await pool.query(
      `SELECT 
        c.*,
        u.username as author_name,
        COUNT(r.id) as replies_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN comments r ON r.parent_id = c.id
       WHERE c.book_id = ? AND c.parent_id IS NULL
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [bookId]
    );

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error getting book comments:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving book comments",
    });
  }
};

// Obtener comentarios de un capítulo
exports.getChapterComments = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const [comments] = await pool.query(
      `SELECT 
        c.*,
        u.username as author_name,
        COUNT(r.id) as replies_count
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN comments r ON r.parent_id = c.id
       WHERE c.chapter_id = ? AND c.parent_id IS NULL
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [chapterId]
    );

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error getting chapter comments:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chapter comments",
    });
  }
};

// Obtener respuestas a un comentario
exports.getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const [replies] = await pool.query(
      `SELECT 
        c.*,
        u.username as author_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = ?
       ORDER BY c.created_at ASC`,
      [commentId]
    );

    res.json({
      success: true,
      data: replies,
    });
  } catch (error) {
    console.error("Error getting comment replies:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving comment replies",
    });
  }
};

// Crear un nuevo comentario
exports.createComment = async (req, res) => {
  try {
    const { bookId, chapterId, content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    if (!bookId && !chapterId) {
      return res.status(400).json({
        success: false,
        message: "Either bookId or chapterId is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO comments (user_id, book_id, chapter_id, content)
       VALUES (?, ?, ?, ?)`,
      [userId, bookId || null, chapterId || null, content]
    );

    const [newComment] = await pool.query(
      `SELECT 
        c.*,
        u.username as author_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      data: newComment[0],
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating comment",
    });
  }
};

// Responder a un comentario
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    // Verificar que el comentario padre existe
    const [parentComment] = await pool.query(
      "SELECT * FROM comments WHERE id = ?",
      [commentId]
    );

    if (parentComment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    // Crear la respuesta
    const [result] = await pool.query(
      `INSERT INTO comments (user_id, book_id, chapter_id, parent_id, content)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        parentComment[0].book_id,
        parentComment[0].chapter_id,
        commentId,
        content,
      ]
    );

    const [newReply] = await pool.query(
      `SELECT 
        c.*,
        u.username as author_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      data: newReply[0],
      message: "Reply added successfully",
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({
      success: false,
      message: "Error replying to comment",
    });
  }
};

// Actualizar un comentario
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Verificar que el comentario existe y pertenece al usuario
    const [comment] = await pool.query("SELECT * FROM comments WHERE id = ?", [
      id,
    ]);

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    // Actualizar el comentario
    await pool.query("UPDATE comments SET content = ? WHERE id = ?", [
      content,
      id,
    ]);

    const [updatedComment] = await pool.query(
      `SELECT 
        c.*,
        u.username as author_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedComment[0],
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating comment",
    });
  }
};

// Eliminar un comentario
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el comentario existe y pertenece al usuario
    const [comment] = await pool.query("SELECT * FROM comments WHERE id = ?", [
      id,
    ]);

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Eliminar el comentario y sus respuestas
    await pool.query("DELETE FROM comments WHERE id = ? OR parent_id = ?", [
      id,
      id,
    ]);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
};

var express = require('express');
var router = express.Router();
var sequelize = require('../utils/db.utils');

const {
  authenticateJWT,
  authenticateAdmin,
  authenticateStudent,
  authenticateManager
} = require('../middleware/authMiddleware');

/** Get all tasks - All authenticated users */
router.get('/', authenticateJWT,authenticateAdmin, async (req, res, next) => {
  try {
    const query = `
      SELECT id, title
      FROM tasks;
    `;

    const result = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

/** Create user - Admin only */
router.post(
  '/createuser',
  authenticateJWT,
  authenticateAdmin,
  async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role;
      `;

      const result = await sequelize.query(query, {
        bind: [name, email, password, role],
        type: sequelize.QueryTypes.INSERT
      });

      res.json({
        success: true,
        user: result[0][0]
      });
    } catch (e) {
      next(e);
    }
  }
);

/** Assign role - Admin only */
router.put(
  '/assignrole',
  authenticateJWT,
  authenticateAdmin,
  async (req, res, next) => {
    try {
      const { userId, role } = req.body;

      const query = `
        UPDATE users
        SET role = :role
        WHERE id = :userId
        RETURNING id, name, email, role;
      `;

      const result = await sequelize.query(query, {
        replacements: { userId, role },
        type: sequelize.QueryTypes.UPDATE
      });

      res.json({
        success: true,
        user: result[0][0]
      });
    } catch (e) {
      next(e);
    }
  }
);

/** Create task - Admin only */
router.post(
  '/createtask',authenticateJWT,authenticateAdmin,async (req, res, next) => {
    try {
      const { title, description, assigned_to, deadline } = req.body;

      const query = `
        INSERT INTO tasks (title, description, assigned_to, deadline)
        VALUES ($1, $2, $3, $4::date)
        RETURNING *;
      `;

      const result = await sequelize.query(query, {
        bind: [title, description, assigned_to, deadline],
        type: sequelize.QueryTypes.INSERT
      });

      res.json({
        success: true,
        task: result[0][0]
      });
    } catch (e) {
      next(e);
    }
  }
);

/** Update task status - Admin & Manager */
router.put(
  '/updatestatus',
  authenticateJWT,
  authenticateManager,
  async (req, res, next) => {
    try {
      const { id, status } = req.body;

      const query = `
        UPDATE tasks
        SET status = :status
        WHERE id = :id
        RETURNING *;
      `;

      const result = await sequelize.query(query, {
        replacements: { id, status },
        type: sequelize.QueryTypes.UPDATE
      });

      res.json({
        success: true,
        task: result[0][0]
      });
    } catch (e) {
      next(e);
    }
  }
);

/** View all tasks - Admin & Manager */
router.get(
  '/alltasks',
  authenticateJWT,
  authenticateManager,
  async (req, res, next) => {
    try {
      const query = `
        SELECT id, title, description, assigned_to, deadline, status
        FROM tasks;
      `;

      const result = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
      });

      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  }
);

/** View tasks assigned to student */
router.get(
  '/studenttasks',
  authenticateJWT,
  authenticateStudent,
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const query = `
        SELECT id, title, status
        FROM tasks
        WHERE assigned_to = :userId;
      `;

      const result = await sequelize.query(query, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  }
);

/** Student updates own task status */
router.put(
  '/updatestudentstatus',
  authenticateJWT,
  authenticateStudent,
  async (req, res, next) => {
    try {
      const { id } = req.body;

      const query = `
        UPDATE tasks
        SET status = 'completed'
        WHERE id = :id AND assigned_to = :userId
        RETURNING *;
      `;

      const result = await sequelize.query(query, {
        replacements: { id, userId: req.user.id },
        type: sequelize.QueryTypes.UPDATE
      });

      res.json({
        success: true,
        task: result[0][0]
      });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;

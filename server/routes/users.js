const router = require('express').Router();
const {
  models: { User },
} = require('../db');
/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */
// Add your routes here:
router.get('/unassigned', async (req, res, next) => {
  try {
    const users = await User.findUnassignedStudents();
    res.json(users);
  } catch (error) {
    next(error);
  }
});
router.get('/teachers', async (req, res, next) => {
  try {
    const teachers = await User.findTeachersAndMentees();
    res.json(teachers);
  } catch (error) {
    next(error);
  }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isNaN(id)) {
      const err = new Error();
      err.status = 400;
      throw err;
    }
  } catch (error) {
    next(error);
  }
  try {
    const id = req.params.id;
    const doesIdExist = await User.findByPk(+id);
    if (doesIdExist === null) {
      const err = new Error();
      err.status = 404;
      throw err;
    }
    res.status(204);
    await User.deleteUser(id);
    res.send('User Deleted');
  } catch (error) {
    next(error);
  }
});
router.post('/', async (req, res, next) => {
  try {
    if (await User.findOne({ where: { name: req.body.name } })) {
      const err = new Error();
      err.status = 409;
      throw err;
    }
    res.status(201);
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const findId = await User.findByPk(+id);
    if (findId === null) {
      const err = new Error();
      err.status = 404;
      throw err;
    }
    res.status(200);
    const update = await findId.update({
      name: req.body.name,
      userType: req.body.userType,
    });
    res.json(update);
  } catch (error) {
    next(error);
  }
});
module.exports = router;

const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  userType: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [['STUDENT', 'TEACHER']],
    },
    defaultValue: 'STUDENT',
  },
  isStudent: {
    type: Sequelize.VIRTUAL,
    get() {
      const studentValue = this.getDataValue('userType');
      return studentValue === 'STUDENT' ? true : false;
    },
  },
  isTeacher: {
    type: Sequelize.VIRTUAL,
    get() {
      const teacherValue = this.getDataValue('userType');
      return teacherValue === 'TEACHER' ? true : false;
    },
  },
});

User.findUnassignedStudents = async function () {
  return User.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: null,
    },
  });
};

User.findTeachersAndMentees = async function () {
  return this.findAll({
    where: {
      userType: 'TEACHER',
    },
    include: {
      model: User,
      as: 'mentees',
    },
  });
};

User.deleteUser = async function (identifier) {
  User.destroy({
    where: {
      id: identifier,
    },
  });
};

User.doesIdExist = async function (identifer) {
  const findId = await User.findOne({ where: { id: identifer } });
  console.log(findId);

  if (findId != null) {
    return true;
  } else {
    return false;
  }
};

User.beforeUpdate(async (user) => {
  const teacherId = user.mentorId;
  const findId = await User.findOne({ where: { id: teacherId } });
  if (teacherId !== null && findId.userType !== 'TEACHER') {
    throw new Error('Mentor is not a teacher');
  }
});

User.beforeUpdate(async (user) => {
  if (user.userType === 'TEACHER' && user.mentorId) {
    throw new Error('A teacher cannot have a mentor');
  }
});

User.beforeUpdate(async (user) => {
  const hasMentees = await User.findOne({ where: { mentorId: user.id } });
  if (user.userType === 'STUDENT' && hasMentees) {
    throw new Error('A student cannot have mentees');
  }
});

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
const db = require("../config/db");

const completeUsers = async () => {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
};
const getTotalCount = async () => {
  const [result] = await db.query("SELECT COUNT(*) AS count FROM users");
  return result[0].count;
};

const getUsers = async (
  page = 1,
  limit = 5,
  searchTerm = "",
  sortField = "idusers",
  sortOrder = "asc"
) => {
  const offset = (page - 1) * limit;


  const validSortFields = [
    "idusers",
    "firstName",
    "lastName",
    "dob",
    "mobile",
    "addr",
  ];
  if (!validSortFields.includes(sortField)) {
    throw new Error("Invalid sort field");
  }


  sortOrder = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

  // search query
  const searchPattern = `%${searchTerm}%`;
  const query = `
    SELECT * FROM users 
    WHERE firstName LIKE ? OR lastName LIKE ? OR dob LIKE ? OR mobile LIKE ? OR addr LIKE ?
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const values = [
    searchPattern,
    searchPattern,
    searchPattern,
    searchPattern,
    searchPattern,
    limit,
    offset,
  ];

  try {
    const [rows] = await db.query(query, values);

    // count for pagination
    const countQuery = `
      SELECT COUNT(*) AS count FROM users 
      WHERE firstName LIKE ? OR lastName LIKE ? OR dob LIKE ? OR mobile LIKE ? OR addr LIKE ?
    `;
    const [countResult] = await db.query(countQuery, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ]);

    return {
      users: rows,
      Count: countResult[0].count,
      pagination: {
        totalPages: Math.ceil(countResult[0].count / limit),
        currentPage: page,
        pageSize: limit,
        totalItems: countResult[0].count,
      },
    };
  } catch (error) {
    console.error("Database query error:", error.message);
    throw new Error("Error in retrieving users");
  }
};

const updateUser = async (id, userData) => {
  const { firstName, lastName, dob, mobile, addr } = userData;
  const fieldsToUpdate = [];
  const values = [];

  if (firstName !== undefined) {
    fieldsToUpdate.push("firstName = ?");
    values.push(firstName);
  }
  if (lastName !== undefined) {
    fieldsToUpdate.push("lastName = ?");
    values.push(lastName);
  }
  if (dob !== undefined) {
    fieldsToUpdate.push("dob = ?");
    values.push(dob);
  }
  if (mobile !== undefined) {
    fieldsToUpdate.push("mobile = ?");
    values.push(mobile);
  }
  if (addr !== undefined) {
    fieldsToUpdate.push("addr = ?");
    values.push(addr);
  }

  if (fieldsToUpdate.length === 0) {
    return { affectedRows: 0 };
  }

  values.push(id);

  const sql = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE idusers = ?`;

  const [result] = await db.query(sql, values);
  return result;
};

const deleteUser = async (id) => {
  const sql = "DELETE FROM users WHERE idusers = ?";
  const [result] = await db.query(sql, [id]);
  return result;
};

const insertUser = async (user) => {
  const insertSql = `
    INSERT INTO users (firstName, lastName, dob, mobile, addr)
    VALUES (?, ?, ?, ?, ?)
  `;
  const insertValues = [
    user.firstName,
    user.lastName,
    user.dob,
    user.mobile,
    user.addr,
  ];
  const [result] = await db.query(insertSql, insertValues);

  return result;
};

module.exports = {
  completeUsers,
  getUsers,
  updateUser,
  deleteUser,
  insertUser,
  getTotalCount,
};

const userService = require("../services/userService");

// simple get
const completeUsers = async (req, res) => {
  try {
    const users = await userService.completeUsers();
    res.status(200).json({
      success: true,
      message: "Fetched all users successfully",
      data: users,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Error in retrieving users",
      error: err.message,
    });
  }
};

// get pagination
const getUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const searchTerm = req.query.searchTerm || "";

  const sortField = req.query.sortField || "idusers";
  const sortOrder = req.query.sortOrder || "desc";

  try {
    const result = await userService.getUsers(
      page,
      limit,
      searchTerm,
      sortField,
      sortOrder
    );

    if (result.users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found matching the criteria",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetched users successfully",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in retrieving users",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  try {
    const result = await userService.updateUser(id, userData);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await userService.deleteUser(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in deleting user",
      error: error.message,
    });
  }
};

const insertUser = async (req, res) => {
  const newUser = req.body;

  try {
    const result = await userService.insertUser(newUser);
    res.status(201).json({
      success: true,
      message: "User inserted successfully",
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "An error occurred while inserting the user",
      error: err.message,
    });
  }
};

module.exports = {
  completeUsers,
  getUsers,
  updateUser,
  deleteUser,
  insertUser,
};

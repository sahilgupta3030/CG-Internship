import { Request, Response } from "express";
import userService from "../services/userService";
import { CommonResponse } from "../types/type";

// Simple get
export const completeUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users = await userService.completeUsers();
        const response: CommonResponse = {
            success: true,
            message: "Fetched all users successfully",
            data: users,
        };
        return res.status(200).json(response);
    } catch (err) {
        const response: CommonResponse = {
            success: false,
            message: "Error in retrieving users",
        };
        return res.status(404).json(response);
    }
};

// Get with pagination
export const getUsers = async (req: Request, res: Response): Promise<Response> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const searchTerm = (req.query.searchTerm as string) || "";
    const sortField = (req.query.sortField as string) || "idusers";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    try {
        const result = await userService.getUsers(page, limit, searchTerm, sortField, sortOrder);

        const response: CommonResponse = {
            success: true,
            message: "Fetched users successfully",
            data: result.users,
            pagination: result.pagination,
        };

        if (result.users.length === 0) {
            response.success = false;
            response.message = "No users found matching the criteria";
            return res.status(404).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        const response: CommonResponse = {
            success: false,
            message: "Error in retrieving users",
        };
        return res.status(400).json(response);
    }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userData = req.body;

    try {
        const result = await userService.updateUser(Number(id), userData);

        const response: CommonResponse = {
            success: true,
            message: "User updated successfully",
            data: userData,
        };

        if (result.affectedRows === 0) {
            response.success = false;
            response.message = "User not found";
            return res.status(404).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        const response: CommonResponse = {
            success: false,
            message: "Error in User update",
        };
        return res.status(400).json(response);
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    try {
        const result = await userService.deleteUser(Number(id));

        const response: CommonResponse = {
            success: true,
            message: "User deleted successfully",
        };

        if (result.affectedRows === 0) {
            response.success = false;
            response.message = "User not found";
            return res.status(404).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        const response: CommonResponse = {
            success: false,
            message: "Error in deleting user",
        };
        return res.status(400).json(response);
    }
};

export const insertUser = async (req: Request, res: Response): Promise<Response> => {
    const newUser = req.body;

    try {
        await userService.insertUser(newUser);
        const response: CommonResponse = {
            success: true,
            message: "User inserted successfully",
            data: newUser,
        };
        return res.status(201).json(response);
    } catch (err) {
        const response: CommonResponse = {
            success: false,
            message: "An error occurred while inserting the user",
        };
        return res.status(400).json(response);
    }
};



const userController = {
    completeUsers,
    getUsers,
    updateUser,
    deleteUser,
    insertUser,
};

export default userController;


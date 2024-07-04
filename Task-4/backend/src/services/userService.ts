import db from "../config/db";
import { User } from "../types/type";

// Function to fetch all users
export const completeUsers = async (): Promise<User[]> => {
    const [rows] = await db.query("SELECT * FROM users");
    return rows as User[];
};

// Function to get total count of users
export const getTotalCount = async (): Promise<number> => {
    const [[result]] = await db.query("SELECT COUNT(*) AS count FROM users") as [Array<{ count: number }>, any];
    return result.count;
};

// Function to fetch users with pagination and filtering
export const getUsers = async (
    page: number = 1,
    limit: number = 5,
    searchTerm: string = "",
    sortField: string = "idusers",
    sortOrder: string = "asc"
): Promise<{
    users: User[];
    Count: number;
    pagination: {
        totalPages: number;
        currentPage: number;
        pageSize: number;
        totalItems: number;
    };
}> => {
    const offset = (page - 1) * limit;

    const validSortFields = ["idusers", "firstName", "lastName", "dob", "mobile", "addr"];
    if (!validSortFields.includes(sortField)) {
        throw new Error("Invalid sort field");
    }

    sortOrder = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

    const searchPattern = `%${searchTerm}%`;
    const query = `
    SELECT * FROM users 
    WHERE firstName LIKE ? OR lastName LIKE ? OR dob LIKE ? OR mobile LIKE ? OR addr LIKE ?
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

    const values = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit, offset];

    try {
        const [rows] = await db.query(query, values) as [User[], any];

        const [[countResult]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE firstName LIKE ? OR lastName LIKE ? OR dob LIKE ? OR mobile LIKE ? OR addr LIKE ?", [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]) as [Array<{ count: number }>, any];

        return {
            users: rows,
            Count: countResult.count,
            pagination: {
                totalPages: Math.ceil(countResult.count / limit),
                currentPage: page,
                pageSize: limit,
                totalItems: countResult.count,
            },
        };
    } catch (error: any) {
        console.error("Database query error:", error.message);
        throw new Error("Error in retrieving users");
    }
};

// Function to update a user
export const updateUser = async (id: number, userData: User): Promise<{ affectedRows: number }> => {
    const { firstName, lastName, dob, mobile, addr } = userData;
    const fieldsToUpdate = [];
    const values: any[] = [];

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

    const [result] = await db.query(sql, values) as [any, any];
    return result;
};

// Function to delete a user
export const deleteUser = async (id: number): Promise<{ affectedRows: number }> => {
    const sql = "DELETE FROM users WHERE idusers = ?";
    const [result] = await db.query(sql, [id]) as [any, any];
    return result;
};

// Function to insert a user
export const insertUser = async (user: User): Promise<{ insertId: number }> => {
    const insertSql = `
    INSERT INTO users (firstName, lastName, dob, mobile, addr)
    VALUES (?, ?, ?, ?, ?)
  `;
    const insertValues = [user.firstName, user.lastName, user.dob, user.mobile, user.addr];
    const [result] = await db.query(insertSql, insertValues) as [any, any];

    return result;
};

const userService = {
    completeUsers,
    getUsers,
    updateUser,
    deleteUser,
    insertUser,
    getTotalCount
};

export default userService;
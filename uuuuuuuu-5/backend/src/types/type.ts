export interface User {
    idusers?: number;
    firstName?: string;
    lastName?: string;
    dob?: string;
    mobile?: string;
    addr?: string;
}

export type CommonResponse = {
    success: boolean;
    message: string;
    data?: object;
    pagination?: object;
};
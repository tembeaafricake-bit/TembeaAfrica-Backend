import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        user: any;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: any;
    }>;
    refresh(req: Request, bodyRefreshToken: string, res: Response): Promise<{
        success: boolean;
    }>;
    getMe(user: {
        userId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").UserDocument, {}, {}> & import("../users/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, password: string): Promise<{
        message: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    logVisit(req: Request, pageUrl: string): Promise<{
        success: boolean;
    }>;
    googleAuth(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    googleCallback(req: Request, res: Response): Promise<void>;
}

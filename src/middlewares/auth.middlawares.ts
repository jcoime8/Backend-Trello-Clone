import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken';

const secret_key = process.env.SECRET_KEY

export interface AuthRequest extends Request {
    userId?: number
}

// Nota: A veces TypeScript se queja si retornas el objeto Response cuando la función dice :void. 
// Si te da error de tipos, simplemente pon 'return;' en la línea siguiente al res.json.

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        // AGREGADO: return
        return res.status(401).json({
            error: 'Acceso denegado: No hay token'
        });
    }

    try {
        const decoded = jwt.verify(token, secret_key!) as { userId: number };
        (req as AuthRequest).userId = decoded.userId;

        next();
    } catch (error) {
        // AGREGADO: return (por seguridad)
        return res.status(403).json({
            error: "Token inválido e incorrecto"
        });
    }
}
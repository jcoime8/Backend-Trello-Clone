import { NextFunction, Request, Response } from "express"

import jwt from 'jsonwebtoken';
const secret_key = process.env.SECRET_KEY

export interface AuthRequest extends Request {
    userId?: number
}

export const verifyToken = (req:Request, res:Response, next:NextFunction): void => {
    const token = req.cookies.token;

    if(!token){
        res.status(401).json({
            error: 'Acceso denegado: No hay token'
        })
    }


    try {
        const decoded = jwt.verify(token, secret_key!) as {userId: number};
        (req as AuthRequest).userId = decoded.userId;

        next()
    } catch (error) {
        res.status(403).json({
            error: "Toquen incalido e incorrecto"
        })
    }
}
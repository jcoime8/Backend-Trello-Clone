import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_key = process.env.SECRET_KEY;

// Determinar si estamos en producción (Render) para ajustar las cookies
const isProduction = process.env.NODE_ENV === 'production';

export const registerUser = async (req: Request, res: Response) => {

    const { email, password, name } = req.body;
    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name: name
            }
        })

        res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id,
        })
        console.log("Usuario registrado")
    } catch (error) {

        if ((error as any).code === 'P2002') {
            // Agregado 'return'
            return res.status(400).json({ error: "El correo ya está registrado, intenta con otro." });
        }
        // Agregado 'return'
        return res.status(500).json({ message: "Internal server error", error });
    }
}


export const LoginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } })
        
        if (!user) {
            // CORRECCIÓN IMPORTANTE: Agregado 'return' para detener la ejecución aquí
            return res.status(404).json({
                error: "Usuario no encontrado"
            })
        }

        const contraseña = await bcrypt.compare(password, user.password) // user.password ya es seguro de acceder aquí
        
        if (!contraseña) {
            // CORRECCIÓN IMPORTANTE: Agregado 'return'
            return res.status(401).json({
                error: "Error contraseña incorrecta"
            })
        }

        const token = jwt.sign({
            userId: user.id
        },
            JWT_key!,
            { expiresIn: "1h" }
        )

        // CONFIGURACIÓN PARA RENDER (HTTPS)
        res.cookie('token', token, {
            httpOnly: true,
            // 'none' es obligatorio si back y front están en dominios distintos (o puerto distinto)
            sameSite:'none', 
            // 'true' es obligatorio si usas sameSite: 'none'
            secure:  true, 
            maxAge: 3600000
        })
        
        /* NOTA: Si sigues teniendo problemas en desarrollo, prueba forzar:
           sameSite: 'none',
           secure: true 
           (Pero asegúrate de acceder a tu frontend y backend vía HTTPS o que el navegador lo tolere).
        */

        return res.json({
            message: "Login Exitoso",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })

    } catch (e) {
        return res.status(500).json({
            error: "Error al inicio de sesión", e
        })
    }
}


export const Logout = (req: Request, res: Response) => {
    // Para borrar la cookie correctamente, debes pasar las mismas opciones que usaste al crearla
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction ? true : false,
    });
    
    return res.json({ message: "Sesión cerrada exitosamente" });
};
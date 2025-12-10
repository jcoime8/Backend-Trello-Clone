import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_key = process.env.SECRET_KEY


export const registerUser = async(req:Request, res:Response) => {
    
    const {email, password, name} = req.body;
    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data:{
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
            res.status(400).json({ error: "El correo ya está registrado, intenta con otro." });
            return;
        }

        res.status(500).json({message: "Internal server error", error});
    }
}


export const LoginUser = async(req:Request, res:Response) => {
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findUnique({where:{email}})
        if(!user){
            res.status(404).json({
                error: "Usuario no encontrado"
            })
        }

        const contraseña = await bcrypt.compare(password, user?.password!)
        if(!contraseña){
            res.status(401).json({
                error: "Error contraseña incorrecta"
            })
        }

        const token = jwt.sign({
            userId: user?.id},
            JWT_key!,
            {expiresIn: "1h"}
        )

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 3600000
        })

        res.json({
            message: "Login Exitoso",
            user: {
                id: user?.id,
                email: user?.email,
                name: user?.name
            }
        })

    } catch (e) {
        res.status(500).json({
            error:"Error al inicio de seccion", e
        })
    }
}


export const Logout = (req: Request, res: Response) => {
    res.clearCookie('token'); 
    res.json({ message: "Sesión cerrada exitosamente" });
};
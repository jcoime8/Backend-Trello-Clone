import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middlawares";
import {  PrismaClient } from "@prisma/client";
import { error, table } from "console";


const prisma = new PrismaClient() 

export const getTask = async (req:AuthRequest, res:Response) => {
    try {
        const data = await  prisma.task.findMany({
            where: {userId: req.userId}
        })
        
        res.json(data)
    } catch (error) {
        res.status(500).json({
            error: "Error al mostrar las tareas"
        })
    }
}


export const createTask = async (req:AuthRequest, res:Response) => {
    try {
        
        const {title, description, status} = req.body

        if(!title){
            res.status(400).json({
                error:"Error no se ha dado el titulo de la tarea"
            })
            return;
        }

        const newTast = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'pending',
                userId: req.userId!

            }
        })
        console.log("Mosatrando todos los elementos")
        res.json(newTast)

    } catch (error) {
        res.status(500).json({
            error: "Error en la creacion de la tarea"
        })
    }
}


export const putTasks = async (req:AuthRequest, res:Response) => {
    try {
        const {id} = req.params
        const {title, description, status} = req.body
        
        const elemento = await prisma.task.findFirst({
            where: {
                id: Number(id),
                userId: req.userId
            }
        })

        if(!elemento){
            res.status(404).json({error:"Tarea no encontrada"})
            return;
        }

        const taskUpdate = await prisma.task.update({
            where: {id: Number(id)},
            data: {
                title: title || elemento.title,
                description: description || elemento.description,
                status: status || elemento.status
            }
        })

        res.json(taskUpdate)
        
    } catch (error) {
        res.status(500).json({error: "Error al actualizar la tarea"})
    }
}


export const deleteTask = async (req:AuthRequest, res:Response) => {
    try {
        const {id} = req.params
        const tast = await prisma.task.findFirst({
            where: {id: Number(id), userId: req.userId}
        })

        if(!tast){
            res.status(400).json({error:"no se ha encontrado la tarea"})
            return;
        }

        await prisma.task.delete({where: {id: Number(id)}})
        res.json({message: "Tarea eliminada"})
    } catch (error) {
        res.status(500).json({error:"Error al eliminar la tarea"})
    }
}
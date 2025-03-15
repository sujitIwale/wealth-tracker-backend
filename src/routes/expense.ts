import { Router, Request, Response } from "express";
import { GenericResponse } from "../utils/response";
import { ResponseStatus } from "../types/response";
import prisma from "../prisma";

const expenseRouter = Router();

expenseRouter.post("/create", async (req: Request, res: Response) => {
    console.log(req.body)
    const response = new GenericResponse();

    try {       
        const { amount,comment, name, category } = req.body    
        const expense = await prisma.expense.create({
            data: {
                amount,
                comment,
                name,
                category,
            },
        })
        console.log(expense)
        response.setStatus(ResponseStatus.SUCCESS);
        response.setData(expense);
        res.send(response);
    } catch (error:unknown) {
        response.setStatus(ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
    }
});

expenseRouter.get("/all", async (req: Request, res: Response) => {
   const response = new GenericResponse();
   try {
        const expenses = await prisma.expense.findMany();
        response.setStatus(ResponseStatus.SUCCESS);
        response.setData(expenses);
   } catch (error:unknown) {
        response.setStatus(ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
    }
    res.send(response);
});


export default expenseRouter;
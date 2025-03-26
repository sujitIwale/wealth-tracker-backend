import { GenericResponse } from "../utils/response";
import { ResponseStatus } from "../types/response";
import prisma from "../prisma";
import { Request, Response, Router } from "express";

const expenseRouter = Router();

expenseRouter.get("/", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const { limit, from, to, order } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user?.id,
        createdAt: {
          gte: from ? new Date(from as string) : undefined,
          lte: to ? new Date(to as string) : undefined,
        },
      },
      orderBy: {
        createdAt: order === "asc" ? "asc" : "desc",
      },
      take: limit ? parseInt(limit as string) : undefined,
    });

    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(expenses);
    res.send(response);
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(error instanceof Error ? error.message : "");
    res.status(400).send(response);
  }
});

expenseRouter.get("/all", async (req: Request, res: Response) => {
  const response = new GenericResponse();
  try {
    // Only get expenses for the current user
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user?.id,
      },
    });
    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(expenses);
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(error instanceof Error ? error.message : "");
    res.status(400).send(response);
  }
  res.send(response);
});

expenseRouter.get("/:id", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const {id} = req.params;
    const expense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
        userId: req.user?.id,
      },
    })

    if(!expense) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("Expense not found");
      res.status(404).json(response);
      return;
    }

    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(expense);
    res.send(response);
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(error instanceof Error ? error.message : "");
    res.status(500).send(response);
  }
})

expenseRouter.post("/create", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const { amount, comment, name, category,date } = req.body;
    if(!req.user?.id) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("User not found");
      res.status(400).json(response);
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        amount: Number(amount),
        comment,
        name,
        category,
        userId: req.user?.id, // Link expense to the authenticated userm
        createdAt: date ? new Date(date) : new Date(),
      },
    });
    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(expense);
    res.send(response);
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(error instanceof Error ? error.message : "");
    res.status(400).send(response);
  }
});

expenseRouter.put("/update/:id", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const {id} = req.params;
    const {amount, comment, name, category, date} = req.body;

    if(!req.user?.id) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("User not found");  
      res.status(400).json(response);
      return;
    }

    const expense = await prisma.expense.update({
      where: {
        id: Number(id),
        userId: req.user?.id,
      },
      data: {
        amount: Number(amount),
        comment,
        name,
        category,
        createdAt: date ? new Date(date) : new Date(),
      },
    })

    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(expense);
    res.send(response);
  } catch (error: unknown) {  
    response.setStatus(ResponseStatus.FAILED);  
    response.setMessage(error instanceof Error ? error.message : "");
    res.status(400).send(response);
  }
})

expenseRouter.delete("/delete/:id", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const { id } = req.params;  

    if(!req.user?.id) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("User not found");
      res.status(400).json(response);
      return;
    } 

    await prisma.expense.delete({
      where: {
        id: Number(id),
        userId: req.user?.id,
      },
    })
    response.setStatus(ResponseStatus.SUCCESS);
    res.send(response);
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(error instanceof Error ? error.message : "");
    res.status(400).send(response);
  }
})

export default expenseRouter;

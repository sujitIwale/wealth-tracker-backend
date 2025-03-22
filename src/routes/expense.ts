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

expenseRouter.post("/create", async (req: Request, res: Response) => {
  console.log(req.body);
  const response = new GenericResponse();

  try {
    const { amount, comment, name, category } = req.body;
    const expense = await prisma.expense.create({
      data: {
        amount,
        comment,
        name,
        category,
        userId: req.user?.id, // Link expense to the authenticated user
      },
    });
    console.log(expense);
    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(expense);
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

export default expenseRouter;

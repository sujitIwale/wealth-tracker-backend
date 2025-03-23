import { Router, Request, Response } from "express";
import { GenericResponse } from "../utils/response";
import { ResponseStatus } from "../types/response";
import prisma from "../prisma";
const incomeRouter = Router();

incomeRouter.get("/:id", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const { id } = req.params;
    const income = await prisma.income.findUnique({
      where: {
        id: Number(id),
        userId: req.user?.id || "",
      },
    });

    if(!income) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("Income not found");
      res.status(404).json(response);
      return;
    }

    response.setStatus(ResponseStatus.SUCCESS);
    response.setData(income);
    
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
    res.status(500).json(response);
  }
});

incomeRouter.post("/create", async (req: Request, res: Response) => {
  const response = new GenericResponse();

  try {
    const { amount, name, date, source, comment } = req.body;

    if (!amount || !name || !date || !source) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("All fields are required");
      res.status(400).json(response);
      return;
    }

    const income = await prisma.income.create({
      data: {
        amount: Number(amount),
        name,
        source,
        comment,
        userId: req.user?.id || "",
        createdAt: date ? new Date(date) : new Date(),
      },
    });

    response.setStatus(ResponseStatus.SUCCESS);
    response.setMessage("Income created successfully");
    response.setData(income);
    res.status(200).json(response);
  } catch (error: unknown) {
    response.setStatus(ResponseStatus.FAILED);
    response.setMessage(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
    res.status(500).json(response);
  }
});

export default incomeRouter;

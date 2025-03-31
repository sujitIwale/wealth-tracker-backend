import { Request, Response, Router } from "express";
import { expenseService } from "../services/expense.service";
import incomeService  from "../services/income.service";
import { GenericResponse } from "../utils/response";
import { ResponseStatus } from "../types/response";
const dashboardRouter = Router();

dashboardRouter.get("/summary", async (req:Request, res:Response) => {
  const response = new GenericResponse();
  try {
      const user = req.user;
      if(!user) {
        response.setMessage("Unauthorized");
        response.setStatus(ResponseStatus.FAILED);
        res.status(401).json(response);
        return;
      }
      const { all, from, to } = req.query;
      const totalExpenses = await expenseService.getExpenses({userId:user.id,all:Boolean(all),from:from ? new Date(from as string) : undefined,to:to ? new Date(to as string) : undefined});
      const totalIncomes = await incomeService.getTotalIncomes({userId:user.id,all:Boolean(all),from:from ? new Date(from as string) : undefined,to:to ? new Date(to as string) : undefined});
      response.setData({ totalExpenses, totalIncomes });
      response.setStatus(ResponseStatus.SUCCESS);
      res.json(response);
  } catch (error) {
    response.setMessage("Internal server error " + error);
    response.setStatus(ResponseStatus.FAILED);
    res.status(500).json(response);
  }
});

export default dashboardRouter;
import { Request, Response } from "express";
import { GenericResponse } from "../utils/response";
import { ResponseStatus } from "../types/response";
import express from "express";

const userRouter = express.Router();

userRouter.get('/me', (req:Request, res:Response) => {
    const response = new GenericResponse()

    response.setData(req.user)
    response.setMessage('User fetched successfully')
    response.setStatus(ResponseStatus.SUCCESS)

    setTimeout(() => {
        res.json(response)
    }, 3000)
});

export default userRouter;
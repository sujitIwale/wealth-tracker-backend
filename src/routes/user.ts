import prisma from "../prisma";

import { Request, Response } from "express";
import { GenericResponse } from "../utils/response";
import { ResponseStatus } from "../types/response";
import express from "express";
import { currenciesMap } from "../constants/common";

const userRouter = express.Router();

userRouter.get('/me', (req:Request, res:Response) => {
    const response = new GenericResponse()

    response.setData(req.user)
    response.setMessage('User fetched successfully')
    response.setStatus(ResponseStatus.SUCCESS)

    res.json(response)
});

userRouter.put('/onboard', async (req:Request, res:Response) => {
    const response = new GenericResponse();

    try {
        const {currency} = req.body;

        if(!currency) {
            response.setStatus(ResponseStatus.FAILED);
            response.setMessage("Currency is required");
            res.status(400).json(response);
            return;
        }

        await prisma.user.update({
            where: {id:req.user?.id},
            data: {
                onboarded: true,
                currency
            }
        })

        response.setStatus(ResponseStatus.SUCCESS);
        response.setMessage("User onboarded successfully");

        res.json(response);
    } catch (error:unknown) {
        response.setStatus(ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "An unknown error occurred");
        res.status(500).json(response);
    }
})

userRouter.put('/currency', async (req:Request, res:Response) => {
    const response = new GenericResponse();

    try {
        const {currency} = req.body;

        if(!currency || !currenciesMap[currency]) {
            response.setStatus(ResponseStatus.FAILED);
            response.setMessage("Invalid currency");
            res.status(400).json(response);
            return;
        }

        await prisma.user.update({
            where: {id:req.user?.id},
            data: {
                currency
            }
        })

        response.setStatus(ResponseStatus.SUCCESS);
        response.setMessage("Currency updated successfully");

        res.json(response);
    } catch (error:unknown) {
        response.setStatus(ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "An unknown error occurred");
        res.status(500).json(response);
    }
})

export default userRouter;
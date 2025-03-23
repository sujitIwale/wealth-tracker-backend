"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const response_1 = require("../utils/response");
const response_2 = require("../types/response");
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
userRouter.get('/me', (req, res) => {
    const response = new response_1.GenericResponse();
    response.setData(req.user);
    response.setMessage('User fetched successfully');
    response.setStatus(response_2.ResponseStatus.SUCCESS);
    setTimeout(() => {
        res.json(response);
    }, 2000);
});
userRouter.put('/onboard', async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { currency } = req.body;
        if (!currency) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("Currency is required");
            res.status(400).json(response);
            return;
        }
        await prisma_1.default.user.update({
            where: { id: req.user?.id },
            data: {
                onboarded: true,
                currency
            }
        });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setMessage("User onboarded successfully");
        res.json(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "An unknown error occurred");
        res.status(500).json(response);
    }
});
exports.default = userRouter;

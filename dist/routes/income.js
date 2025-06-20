"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const response_2 = require("../types/response");
const prisma_1 = __importDefault(require("../prisma"));
const income_service_1 = __importDefault(require("../services/income.service"));
const user_service_1 = require("../services/user.service");
const incomeRouter = (0, express_1.Router)();
incomeRouter.get("/", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { limit, from, to, order, giveSum } = req.query;
        const incomes = await income_service_1.default.getTotalIncomes({
            userId: req.user?.id || "",
            all: false,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            giveSum: giveSum,
            limit: limit ? parseInt(limit) : undefined,
            order: order
        });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(incomes);
        res.status(200).json(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "An unknown error occurred");
        res.status(500).json(response);
    }
});
incomeRouter.get("/:id", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { id } = req.params;
        const income = await prisma_1.default.income.findUnique({
            where: {
                id: Number(id),
                userId: req.user?.id || "",
            },
        });
        if (!income) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("Income not found");
            res.status(404).json(response);
            return;
        }
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(income);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "An unknown error occurred");
        res.status(500).json(response);
    }
});
incomeRouter.post("/create", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { amount, name, date, source, comment } = req.body;
        if (!amount || !name || !date || !source) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("All fields are required");
            res.status(400).json(response);
            return;
        }
        const income = await prisma_1.default.income.create({
            data: {
                amount: Number(amount),
                name,
                source,
                comment,
                userId: req.user?.id || "",
                createdAt: date ? new Date(date) : new Date(),
            },
        });
        if (!req.user?.addedTransaction) {
            await user_service_1.userService.markTransactionAdded(req.user?.id || "");
        }
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setMessage("Income created successfully");
        response.setData(income);
        res.status(200).json(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "An unknown error occurred");
        res.status(500).json(response);
    }
});
exports.default = incomeRouter;

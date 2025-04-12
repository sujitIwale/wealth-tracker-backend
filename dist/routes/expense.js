"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const response_2 = require("../types/response");
const prisma_1 = __importDefault(require("../prisma"));
const express_1 = require("express");
const expense_service_1 = require("../services/expense.service");
const user_service_1 = require("../services/user.service");
const expenseRouter = (0, express_1.Router)();
expenseRouter.get("/", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { limit, from, to, order, giveSum } = req.query;
        if (!req.user?.id) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("User not found");
            res.status(400).json(response);
            return;
        }
        const expenses = await expense_service_1.expenseService.getExpenses({
            userId: req.user?.id,
            all: false,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            order: order,
            giveSum: giveSum,
        });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(expenses);
        res.send(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
        res.status(400).send(response);
    }
});
expenseRouter.get("/all", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        // Only get expenses for the current user
        const expenses = await prisma_1.default.expense.findMany({
            where: {
                userId: req.user?.id,
            },
        });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(expenses);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
        res.status(400).send(response);
    }
    res.send(response);
});
expenseRouter.get("/:id", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { id } = req.params;
        const expense = await prisma_1.default.expense.findUnique({
            where: {
                id: Number(id),
                userId: req.user?.id,
            },
        });
        if (!expense) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("Expense not found");
            res.status(404).json(response);
            return;
        }
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(expense);
        res.send(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
        res.status(500).send(response);
    }
});
expenseRouter.post("/create", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { amount, comment, name, category, date } = req.body;
        if (!req.user?.id) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("User not found");
            res.status(400).json(response);
            return;
        }
        const expense = await prisma_1.default.expense.create({
            data: {
                amount: Number(amount),
                comment,
                name,
                category,
                userId: req.user?.id, // Link expense to the authenticated userm
                createdAt: date ? new Date(date) : new Date(),
            },
        });
        if (!req.user?.addedTransaction) {
            await user_service_1.userService.markTransactionAdded(req.user?.id || "");
        }
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(expense);
        res.send(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
        res.status(400).send(response);
    }
});
expenseRouter.put("/update/:id", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { id } = req.params;
        const { amount, comment, name, category, date } = req.body;
        if (!req.user?.id) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("User not found");
            res.status(400).json(response);
            return;
        }
        const expense = await prisma_1.default.expense.update({
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
        });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        response.setData(expense);
        res.send(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
        res.status(400).send(response);
    }
});
expenseRouter.delete("/delete/:id", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const { id } = req.params;
        if (!req.user?.id) {
            response.setStatus(response_2.ResponseStatus.FAILED);
            response.setMessage("User not found");
            res.status(400).json(response);
            return;
        }
        await prisma_1.default.expense.delete({
            where: {
                id: Number(id),
                userId: req.user?.id,
            },
        });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        res.send(response);
    }
    catch (error) {
        response.setStatus(response_2.ResponseStatus.FAILED);
        response.setMessage(error instanceof Error ? error.message : "");
        res.status(400).send(response);
    }
});
exports.default = expenseRouter;

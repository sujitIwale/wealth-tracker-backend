"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_service_1 = require("../services/expense.service");
const income_service_1 = __importDefault(require("../services/income.service"));
const response_1 = require("../utils/response");
const response_2 = require("../types/response");
const dashboardRouter = (0, express_1.Router)();
dashboardRouter.get("/summary", async (req, res) => {
    const response = new response_1.GenericResponse();
    try {
        const user = req.user;
        if (!user) {
            response.setMessage("Unauthorized");
            response.setStatus(response_2.ResponseStatus.FAILED);
            res.status(401).json(response);
            return;
        }
        const { all, from, to } = req.query;
        const totalExpenses = await expense_service_1.expenseService.getExpenses({ userId: user.id, all: Boolean(all), from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined });
        const totalIncomes = await income_service_1.default.getTotalIncomes({ userId: user.id, all: Boolean(all), from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined });
        response.setData({ totalExpenses, totalIncomes });
        response.setStatus(response_2.ResponseStatus.SUCCESS);
        res.json(response);
    }
    catch (error) {
        response.setMessage("Internal server error " + error);
        response.setStatus(response_2.ResponseStatus.FAILED);
        res.status(500).json(response);
    }
});
exports.default = dashboardRouter;

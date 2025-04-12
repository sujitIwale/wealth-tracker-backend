"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const incomeService = {
    getTotalIncomes: async ({ userId, all, from, to, giveSum, limit, order, }) => {
        let sum = 0;
        if (all) {
            from = new Date("0001-01-01");
            to = new Date();
        }
        if (giveSum === "true") {
            const result = await prisma_1.default.income.aggregate({
                where: {
                    userId,
                    createdAt: {
                        gte: from,
                        lte: to,
                    },
                },
                orderBy: {
                    createdAt: order,
                },
                take: limit,
                _sum: {
                    amount: true,
                },
            });
            sum = result._sum.amount || 0;
        }
        return {
            incomes: await prisma_1.default.income.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: from,
                        lte: to,
                    },
                },
                orderBy: {
                    createdAt: order,
                },
                take: limit,
            }),
            sum,
        };
    },
    createIncomeFromImportedTransaction: async (importedTransactions) => {
        return await prisma_1.default.income.createMany({
            data: importedTransactions.map(transaction => ({
                userId: transaction.userId,
                amount: transaction.amount,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
                name: transaction.name || "",
                source: transaction.fromAccount || "",
            }))
        });
    },
};
exports.default = incomeService;

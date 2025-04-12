"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
exports.expenseService = {
    getExpenses: async ({ userId, all, from, to, giveSum, limit, order, }) => {
        let sum = 0;
        if (all) {
            from = new Date("0001-01-01");
            to = new Date();
        }
        if (giveSum === "true") {
            const result = await prisma_1.default.expense.aggregate({
                where: {
                    userId,
                    createdAt: {
                        gte: from,
                        lte: to,
                    },
                },
                _sum: {
                    amount: true,
                },
                orderBy: {
                    createdAt: order,
                },
                take: limit,
            });
            sum = result._sum.amount || 0;
        }
        return {
            expenses: await prisma_1.default.expense.findMany({
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
    createExpenseFromImportedTransaction: async (importedTransactions) => {
        return await prisma_1.default.expense.createMany({
            data: importedTransactions.map(transaction => ({
                userId: transaction.userId,
                amount: transaction.amount,
                createdAt: transaction.date,
                updatedAt: transaction.updatedAt,
                name: transaction.name || "",
                category: transaction.category || "",
                comment: transaction.toAccount || "",
            })),
        });
    },
};

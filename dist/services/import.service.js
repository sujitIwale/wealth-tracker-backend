"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../prisma"));
const importService = {
    handleImport: async (transactions, userId) => {
        const importedTransactions = await prisma_1.default.importedTransaction.createManyAndReturn({
            data: transactions.map((transaction) => ({
                ...transaction,
                userId,
            })),
        });
        return importedTransactions;
    },
    separateTransactions: (transactions) => {
        const creditTransactions = [];
        const debitTransactions = [];
        transactions.forEach((transaction) => {
            if (transaction.type === client_1.TransactionType.CREDIT) {
                creditTransactions.push(transaction);
            }
            else {
                debitTransactions.push(transaction);
            }
        });
        return { creditTransactions, debitTransactions };
    },
};
exports.default = importService;

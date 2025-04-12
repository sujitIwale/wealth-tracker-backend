"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
exports.userService = {
    markTransactionAdded: async (userId) => {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { addedTransaction: true }
        });
    }
};

import { ImportedTransaction } from "@prisma/client";
import prisma from "../prisma";

export const expenseService = {
  getExpenses: async ({
    userId,
    all,
    from,
    to,
    giveSum,
    limit,
    order,
  }: {
    userId: string;
    all: boolean;
    from?: Date;
    to?: Date;
    giveSum?: string;
    limit?: number;
    order?: "asc" | "desc";
  }) => {
    let sum = 0;
    if (all) {
      from = new Date("0001-01-01");
      to = new Date();
    }
    if (giveSum === "true") {
      const result = await prisma.expense.aggregate({
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
      expenses: await prisma.expense.findMany({
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
  createExpenseFromImportedTransaction: async (importedTransactions: ImportedTransaction[]) => {
    return await prisma.expense.createMany({
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

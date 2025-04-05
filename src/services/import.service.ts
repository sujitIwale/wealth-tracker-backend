import prisma from "../prisma";
import { ImportedTransactionBase } from "../types/import";

const importService = {
  handleImport: async (transactions: ImportedTransactionBase[], userId: string) => {
    const importedTransactions = await prisma.importedTransaction.createManyAndReturn({
      data: transactions.map((transaction) => ({
        ...transaction,
        userId,
      })),
    });

    return importedTransactions;
  },
};

export default importService;

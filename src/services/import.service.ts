import { ImportedTransaction, TransactionType } from "@prisma/client";
import prisma from "../prisma";
import { ImportedTransactionBase } from "../types/import";

const importService = {
  handleImport: async (
    transactions: ImportedTransactionBase[],
    userId: string
  ) => {
    const importedTransactions =
      await prisma.importedTransaction.createManyAndReturn({
        data: transactions.map((transaction) => ({
          ...transaction,
          userId,
        })),
      });

    return importedTransactions;
  },
  separateTransactions: (transactions: ImportedTransaction[]) => {
    const creditTransactions: ImportedTransaction[] = [];
    const debitTransactions: ImportedTransaction[] = [];

    transactions.forEach((transaction) => {
      if (transaction.type === TransactionType.CREDIT) {
        creditTransactions.push(transaction);
      } else {
        debitTransactions.push(transaction);
      }
    });
    return { creditTransactions, debitTransactions };
  },
};

export default importService;

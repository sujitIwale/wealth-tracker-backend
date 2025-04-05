import { ImportedTransaction } from "@prisma/client";

export type ImportedTransactionBase = Omit<ImportedTransaction, "id" | "createdAt" | "updatedAt" | "userId">
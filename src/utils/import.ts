import { TransactionType } from "@prisma/client";
import { ImportedTransactionBase } from "../types/import";
import fs from "fs";
import csv from "csv-parser";
import xlsx from "xlsx";
import { Categories, Category, foodExpenseServices, otherExpenseServices, shoppingExpenseServices, travelExpenseServices } from "../constants/expense";

export const processCSV = (
  filePath: string
): Promise<ImportedTransactionBase[]> => {
  return new Promise((resolve, reject) => {
    const transactions: ImportedTransactionBase[] = [];
    let isTransactionRow = false;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headers) => {
        if (headers.includes("Transaction Date")) {
          isTransactionRow = true;
        }
      })
      .on("data", (row) => {
        if (isTransactionRow) {
          transactions.push({
            date: row["Transaction Date"],
            name: row["Particulars"],
            toAccount: row["Particulars"],
            fromAccount: row["Particulars"],
            amount: row["Debit"]
              ? parseFloat(row["Debit"].replace(/,/g, ""))
              : parseFloat(row["Credit"].replace(/,/g, "")),
            type:
              typeof row["Debit"] === "number"
                ? TransactionType.DEBIT
                : TransactionType.CREDIT,
            category: getTransactionCategory(row["Particulars"]),
          });
        }
      })
      .on("end", () => {
        fs.unlinkSync(filePath); // Delete file after processing
        resolve(transactions);
      })
      .on("error", (error) => reject(error));
  });
};

// Function to process XLSX file
export const processXLSX = (filePath: string): ImportedTransactionBase[] => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
  let transactions: ImportedTransactionBase[] = [];

  let startIndex = data.findIndex((row) => row.includes("Transaction Date"));

  if (startIndex === -1) return transactions;

  const headerRow = data[startIndex];
  const transactionDateIndex = headerRow.findIndex((header) => header === "Transaction Date");
  const particularsIndex = headerRow.findIndex((header) => header === "Particulars");
  const toAccountIndex = headerRow.findIndex((header) => header === "To Account");
  const fromAccountIndex = headerRow.findIndex((header) => header === "From Account");
  const debitIndex = headerRow.findIndex((header) => header === "Debit");
  const creditIndex = headerRow.findIndex((header) => header === "Credit");

  for (let i = startIndex + 1; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty or invalid rows
    if (!row || !row[transactionDateIndex]) continue;

    const transaction: ImportedTransactionBase = {
      date: new Date(row[transactionDateIndex]),
      name: particularsIndex !== -1 ? row[particularsIndex] || "" : "",
      toAccount: toAccountIndex !== -1 ? row[toAccountIndex] || "" : 
                 (particularsIndex !== -1 ? row[particularsIndex] || "" : ""),
      fromAccount: fromAccountIndex !== -1 ? row[fromAccountIndex] || "" : 
                  (particularsIndex !== -1 ? row[particularsIndex] || "" : ""),
      amount: 0,
      type: TransactionType.DEBIT,
      category: getTransactionCategory(row[particularsIndex] || ""),
    };

    // Handle debit and credit amounts
    if (debitIndex !== -1 && row[debitIndex]) {
      transaction.amount = typeof row[debitIndex] === 'string' 
        ? parseFloat(row[debitIndex].replace(/,/g, "")) 
        : row[debitIndex];
      transaction.type = TransactionType.DEBIT;
    } else if (creditIndex !== -1 && row[creditIndex]) {
      transaction.amount = typeof row[creditIndex] === 'string' 
        ? parseFloat(row[creditIndex].replace(/,/g, "")) 
        : row[creditIndex];
      transaction.type = TransactionType.CREDIT;
    }

    // Only add transactions with valid amounts
    if (transaction.amount && !isNaN(transaction.amount)) {
      transactions.push(transaction);
    }
  }

  fs.unlinkSync(filePath); // Delete file after processing
  return transactions;
};

export const getTransactionCategory = (toAccount: string) => {
  let category: keyof typeof Categories = Categories.other.id;
   toAccount = toAccount?.toLowerCase();
  if(toAccount) {
    if (travelExpenseServices.find((service) => toAccount.includes(service))) {
      category = Categories.transportation.id;
    } else if (foodExpenseServices.find((service) => toAccount.includes(service))) {
      category = Categories.food.id;
    } else if (shoppingExpenseServices.find((service) => toAccount.includes(service))) {
      category = Categories.shopping.id;
    } else if (otherExpenseServices.find((service) => toAccount.includes(service))) {
      category = Categories.other.id;
    }
  }

  return category;
}
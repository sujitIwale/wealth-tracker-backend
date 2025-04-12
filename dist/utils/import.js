"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionCategory = exports.processXLSX = exports.processCSV = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const xlsx_1 = __importDefault(require("xlsx"));
const expense_1 = require("../constants/expense");
const processCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const transactions = [];
        let isTransactionRow = false;
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
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
                    type: typeof row["Debit"] === "number"
                        ? client_1.TransactionType.DEBIT
                        : client_1.TransactionType.CREDIT,
                    category: (0, exports.getTransactionCategory)(row["Particulars"]),
                });
            }
        })
            .on("end", () => {
            fs_1.default.unlinkSync(filePath); // Delete file after processing
            resolve(transactions);
        })
            .on("error", (error) => reject(error));
    });
};
exports.processCSV = processCSV;
// Function to process XLSX file
const processXLSX = (filePath) => {
    const workbook = xlsx_1.default.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx_1.default.utils.sheet_to_json(sheet, { header: 1 });
    let transactions = [];
    let startIndex = data.findIndex((row) => row.includes("Transaction Date"));
    if (startIndex === -1)
        return transactions;
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
        if (!row || !row[transactionDateIndex])
            continue;
        const transaction = {
            date: new Date(row[transactionDateIndex]),
            name: particularsIndex !== -1 ? row[particularsIndex] || "" : "",
            toAccount: toAccountIndex !== -1 ? row[toAccountIndex] || "" :
                (particularsIndex !== -1 ? row[particularsIndex] || "" : ""),
            fromAccount: fromAccountIndex !== -1 ? row[fromAccountIndex] || "" :
                (particularsIndex !== -1 ? row[particularsIndex] || "" : ""),
            amount: 0,
            type: client_1.TransactionType.DEBIT,
            category: (0, exports.getTransactionCategory)(row[particularsIndex] || ""),
        };
        // Handle debit and credit amounts
        if (debitIndex !== -1 && row[debitIndex]) {
            transaction.amount = typeof row[debitIndex] === 'string'
                ? parseFloat(row[debitIndex].replace(/,/g, ""))
                : row[debitIndex];
            transaction.type = client_1.TransactionType.DEBIT;
        }
        else if (creditIndex !== -1 && row[creditIndex]) {
            transaction.amount = typeof row[creditIndex] === 'string'
                ? parseFloat(row[creditIndex].replace(/,/g, ""))
                : row[creditIndex];
            transaction.type = client_1.TransactionType.CREDIT;
        }
        // Only add transactions with valid amounts
        if (transaction.amount && !isNaN(transaction.amount)) {
            transactions.push(transaction);
        }
    }
    fs_1.default.unlinkSync(filePath); // Delete file after processing
    return transactions;
};
exports.processXLSX = processXLSX;
const getTransactionCategory = (toAccount) => {
    let category = expense_1.Categories.other.id;
    toAccount = toAccount?.toLowerCase();
    if (toAccount) {
        if (expense_1.travelExpenseServices.find((service) => toAccount.includes(service))) {
            category = expense_1.Categories.transportation.id;
        }
        else if (expense_1.foodExpenseServices.find((service) => toAccount.includes(service))) {
            category = expense_1.Categories.food.id;
        }
        else if (expense_1.shoppingExpenseServices.find((service) => toAccount.includes(service))) {
            category = expense_1.Categories.shopping.id;
        }
        else if (expense_1.otherExpenseServices.find((service) => toAccount.includes(service))) {
            category = expense_1.Categories.other.id;
        }
    }
    return category;
};
exports.getTransactionCategory = getTransactionCategory;

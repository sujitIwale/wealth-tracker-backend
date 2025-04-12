"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const response_1 = require("../types/response");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const import_1 = require("../utils/import");
const import_service_1 = __importDefault(require("../services/import.service"));
const expense_service_1 = require("../services/expense.service");
const income_service_1 = __importDefault(require("../services/income.service"));
const response_2 = require("../utils/response");
const user_service_1 = require("../services/user.service");
const importRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
// Unified route for CSV and XLSX upload
importRouter.post("/transactions", upload.single("file"), async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    console.log("file type", req.file.mimetype);
    try {
        const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
        let transactions = [];
        if (fileExtension === ".csv") {
            transactions = await (0, import_1.processCSV)(req.file.path);
        }
        else if (fileExtension === ".xlsx") {
            transactions = (0, import_1.processXLSX)(req.file.path);
        }
        else {
            fs_1.default.unlinkSync(req.file.path); // Delete unsupported file
            res.status(400).json({ message: "Unsupported file format" });
            return;
        }
        const importedTransactions = await import_service_1.default.handleImport(transactions, userId);
        const separatedTransactions = import_service_1.default.separateTransactions(importedTransactions);
        res.status(200).json({
            status: response_1.ResponseStatus.SUCCESS,
            data: separatedTransactions,
            message: "Transactions imported successfully",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error processing file", error });
    }
});
importRouter.post("/transactions/accept/:type", async (req, res) => {
    const userId = req.user?.id;
    const response = new response_2.GenericResponse();
    if (!userId) {
        response.setStatus(response_1.ResponseStatus.FAILED);
        response.setMessage("Unauthorized");
        res.status(401).json(response);
        return;
    }
    const type = req.params.type;
    const transactions = req.body.transactions;
    try {
        if (type === "credit") {
            await income_service_1.default.createIncomeFromImportedTransaction(transactions);
        }
        else if (type === "debit") {
            await expense_service_1.expenseService.createExpenseFromImportedTransaction(transactions);
        }
        if (!req.user?.addedTransaction) {
            await user_service_1.userService.markTransactionAdded(req.user?.id || "");
        }
        response.setStatus(response_1.ResponseStatus.SUCCESS);
        response.setMessage("Transactions accepted successfully");
        res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        response.setStatus(response_1.ResponseStatus.FAILED);
        response.setMessage("Error accepting transactions");
        res.status(500).json(response);
    }
});
// Router.post(
//   "/transactions",
//   upload.single("file"),
//   async (req: Request, res: Response) => {
//     const response = new GenericResponse();
//     if (!req.file) {
//       response.setStatus(ResponseStatus.FAILED);
//       response.setMessage("File is required");
//       res.status(400).json(response);
//       return;
//     }
//     const fileType = req.file.mimetype;
//     if(fileType !== 'text/csv') {
//       response.setStatus(ResponseStatus.FAILED);
//       response.setMessage("File must be a CSV file");
//       res.status(400).json(response);
//       return;
//     }
//     try {
//       let isTransactionRow = false;
//       let transactions: any[] = [];
//       fs.createReadStream(req.file.path)
//         .pipe(csv())
//         .on("headers", (headers) => {
//           console.log({headers})
//           if (headers.includes("Transaction Date")) {
//             isTransactionRow = true;
//           }
//         })
//         .on("data", (row) => {
//           if (isTransactionRow) {
//             transactions.push({
//               date: row["Transaction Date"],
//               valueDate: row["Value Date"],
//               particulars: row["Particulars"],
//               chequeNo: row["Cheque No."],
//               debit: row["Debit"]
//                 ? parseFloat(row["Debit"].replace(/,/g, ""))
//                 : undefined,
//               credit: row["Credit"]
//                 ? parseFloat(row["Credit"].replace(/,/g, ""))
//                 : undefined,
//               balance: parseFloat(row["Balance"].replace(/,/g, "")),
//             });
//           }
//         })
//         .on("end", () => {
//           fs.unlinkSync(req.file!.path); // Delete file after processing
//           response.setStatus(ResponseStatus.SUCCESS);
//           response.setData(transactions);
//           res.status(200).json(response);
//         });
//     } catch (error) {
//       response.setStatus(ResponseStatus.FAILED);
//       response.setMessage(
//         error instanceof Error ? error.message : "An unknown error occurred"
//       );
//       res.status(500).json(response);
//     }
//   }
// );
exports.default = importRouter;

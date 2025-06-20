import { Request, Response, Router } from "express";
import multer from "multer";
import { ResponseStatus } from "../types/response";
import fs from "fs";
import path from "path";
import { processCSV, processXLSX } from "../utils/import";
import { ImportedTransactionBase } from "../types/import";
import importService from "../services/import.service";
import { expenseService } from "../services/expense.service";
import incomeService from "../services/income.service";
import { GenericResponse } from "../utils/response";
import { userService } from "../services/user.service";

const importRouter = Router();

const upload = multer({ dest: "uploads/" });

// Unified route for CSV and XLSX upload
importRouter.post(
  "/transactions",
  upload.single("file"),
  async (req: Request, res: Response) => {
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
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      let transactions: ImportedTransactionBase[] = [];

      if (fileExtension === ".csv") {
        transactions = await processCSV(req.file.path);
      } else if (fileExtension === ".xlsx") {
        transactions = processXLSX(req.file.path);
      } else {
        fs.unlinkSync(req.file.path); // Delete unsupported file
        res.status(400).json({ message: "Unsupported file format" });
        return;
      }

      const importedTransactions = await importService.handleImport(
        transactions,
        userId
      );
      const separatedTransactions =
        importService.separateTransactions(importedTransactions);
      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        data: separatedTransactions,
        message: "Transactions imported successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error processing file", error });
    }
  }
);

importRouter.post(
  "/transactions/accept/:type",
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const response = new GenericResponse();

    if (!userId) {
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("Unauthorized");
      res.status(401).json(response);
      return;
    }

    const type = req.params.type;
    const transactions = req.body.transactions;

    try {
      if (type === "credit") {
        await incomeService.createIncomeFromImportedTransaction(transactions);
      } else if (type === "debit") {
        await expenseService.createExpenseFromImportedTransaction(transactions);
      }

      if(!req.user?.addedTransaction) {
        await userService.markTransactionAdded(req.user?.id || "");
      }

      response.setStatus(ResponseStatus.SUCCESS);
      response.setMessage("Transactions accepted successfully");
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      response.setStatus(ResponseStatus.FAILED);
      response.setMessage("Error accepting transactions");
      res.status(500).json(response);
    }
  }
);

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

export default importRouter;

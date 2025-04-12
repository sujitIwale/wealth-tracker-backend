"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otherExpenseServices = exports.shoppingExpenseServices = exports.foodExpenseServices = exports.travelExpenseServices = exports.Categories = void 0;
exports.Categories = {
    food: {
        id: "food",
        name: "Food",
        icon: "🍽️",
    },
    transportation: {
        id: "transportation",
        name: "Transportation",
        icon: "🚗",
    },
    entertainment: {
        id: "entertainment",
        name: "Entertainment",
        icon: "🎮",
    },
    other: {
        id: "other",
        name: "Other",
        icon: "📦",
    },
    groceries: {
        id: "groceries",
        name: "Groceries",
        icon: "🛒",
    },
    shopping: {
        id: "shopping",
        name: "Shopping",
        icon: "🛍️",
    },
};
exports.travelExpenseServices = [
    "uber",
    "ola",
    "lyft",
    "gojek",
    "grab",
    "other",
];
exports.foodExpenseServices = ["zomato", "swiggy", "foodpanda", "other"];
exports.shoppingExpenseServices = [
    "amazon",
    "flipkart",
    "myntra",
    "other",
];
exports.otherExpenseServices = ["gpay", "phonepe", "other"];

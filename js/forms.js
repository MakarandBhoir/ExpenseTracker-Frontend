import { formatDateForInput } from "./utils.js";

function readValue(form, fieldName) {
    return new FormData(form).get(fieldName)?.toString().trim() || "";
}

export function getCategoryPayload(form) {
    const name = readValue(form, "name");
    const description = readValue(form, "description");

    if (!name) {
        throw new Error("Category name is required.");
    }

    return { name, description };
}

export function fillCategoryForm(form, category) {
    form.querySelector("#category-id").value = category.id;
    form.querySelector("#category-name").value = category.name || "";
    form.querySelector("#category-description").value = category.description || "";
}

export function resetCategoryForm(form) {
    form.reset();
    form.querySelector("#category-id").value = "";
}

export function getExpensePayload(form) {
    const description = readValue(form, "description");
    const amountValue = readValue(form, "amount");
    const expenseDate = readValue(form, "expenseDate");
    const categoryIdValue = readValue(form, "categoryId");
    const amount = Number(amountValue);
    const categoryId = Number(categoryIdValue);

    if (!description) {
        throw new Error("Expense description is required.");
    }

    if (!expenseDate) {
        throw new Error("Expense date is required.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Expense amount must be greater than zero.");
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        throw new Error("Select a valid category.");
    }

    return {
        description,
        amount,
        expenseDate,
        categoryId
    };
}

export function fillExpenseForm(form, expense) {
    form.querySelector("#expense-id").value = expense.id;
    form.querySelector("#expense-description").value = expense.description || "";
    form.querySelector("#expense-amount").value = expense.amount ?? "";
    form.querySelector("#expense-date").value = formatDateForInput(expense.expenseDate);
    form.querySelector("#expense-category").value = String(expense.categoryId || "");
}

export function resetExpenseForm(form) {
    form.reset();
    form.querySelector("#expense-id").value = "";
}
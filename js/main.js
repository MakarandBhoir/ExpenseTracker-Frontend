import { api } from "./api.js";
import {
    fillCategoryForm,
    fillExpenseForm,
    getCategoryPayload,
    getExpensePayload,
    resetCategoryForm,
    resetExpenseForm
} from "./forms.js";
import {
    renderCategoryList,
    renderCategoryOptions,
    renderDashboard,
    renderExpenseList,
    renderNavigation,
    renderStatus,
    renderSummary,
    setCategoryFormTitle,
    setExpenseFormTitle,
    syncExpenseFilterInputs,
    syncSummaryInputs
} from "./render.js";
import {
    resetExpenseFilters,
    setCategoryEditor,
    setExpenseEditor,
    setLoading,
    setNotice,
    setView,
    state,
    updateCategories,
    updateExpenses,
    updateExpenseFilters,
    updateSummary,
    updateSummaryFilters
} from "./state.js";
import { sortExpenses } from "./utils.js";

const categoryForm = document.querySelector("#category-form");
const expenseForm = document.querySelector("#expense-form");
const summaryForm = document.querySelector("#summary-form");
const categoryList = document.querySelector("#category-list");
const expenseList = document.querySelector("#expense-list");

function renderApp() {
    renderNavigation(state.currentView);
    renderStatus(state.notice, state.loading);
    renderCategoryList(state.categories);
    renderCategoryOptions(state.categories);
    renderExpenseList(state.expenses, state.expenseFilters);
    renderSummary(state.summary);
    renderDashboard(state.categories, state.expenses, state.summary);
    syncExpenseFilterInputs(state.expenseFilters);
    syncSummaryInputs(state.summaryFilters);
    setCategoryFormTitle(Boolean(state.categoryEditorId));
    setExpenseFormTitle(Boolean(state.expenseEditorId));
}

async function runWithLoading(scope, task) {
    setLoading(scope, true);
    renderStatus(state.notice, state.loading);

    try {
        return await task();
    } finally {
        setLoading(scope, false);
        renderStatus(state.notice, state.loading);
    }
}

async function refreshCategories() {
    const categories = await api.getCategories();
    updateCategories(categories || []);
}

async function refreshExpenses() {
    const expenses = await api.getExpenses();
    updateExpenses(sortExpenses(expenses || []));
}

async function refreshSummary() {
    const { year, month } = state.summaryFilters;
    const summary = await api.getMonthlySummary(year, month);
    updateSummary(summary);
}

async function refreshAllData() {
    await runWithLoading("bootstrap", async () => {
        await Promise.all([
            refreshCategories(),
            refreshExpenses(),
            refreshSummary()
        ]);
    });

    renderApp();
}

function clearCategoryEditor() {
    setCategoryEditor(null);
    resetCategoryForm(categoryForm);
    renderApp();
}

function clearExpenseEditor() {
    setExpenseEditor(null);
    resetExpenseForm(expenseForm);
    renderApp();
}

function findCategoryById(id) {
    return state.categories.find((category) => String(category.id) === String(id));
}

function findExpenseById(id) {
    return state.expenses.find((expense) => String(expense.id) === String(id));
}

function bindNavigation() {
    document.querySelectorAll(".nav-link").forEach((button) => {
        button.addEventListener("click", () => {
            setView(button.dataset.view);
            renderApp();
        });
    });
}

function bindCategoryHandlers() {
    categoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const payload = getCategoryPayload(categoryForm);

            await runWithLoading("categories", async () => {
                if (state.categoryEditorId) {
                    await api.updateCategory(state.categoryEditorId, payload);
                    setNotice("success", "Category updated.");
                } else {
                    await api.createCategory(payload);
                    setNotice("success", "Category created.");
                }

                await Promise.all([refreshCategories(), refreshExpenses()]);
            });

            clearCategoryEditor();
            renderApp();
        } catch (error) {
            setNotice("error", error.message);
            renderApp();
        }
    });

    document.querySelector("#category-cancel").addEventListener("click", clearCategoryEditor);

    categoryList.addEventListener("click", async (event) => {
        const action = event.target.dataset.categoryAction;
        const categoryId = event.target.dataset.categoryId;

        if (!action || !categoryId) {
            return;
        }

        if (action === "edit") {
            const category = findCategoryById(categoryId);
            if (!category) {
                return;
            }

            setCategoryEditor(category.id);
            fillCategoryForm(categoryForm, category);
            setView("categories");
            renderApp();
            return;
        }

        if (action === "delete") {
            const confirmed = window.confirm("Delete this category?");
            if (!confirmed) {
                return;
            }

            try {
                await runWithLoading("categories", async () => {
                    await api.deleteCategory(categoryId);
                    await Promise.all([refreshCategories(), refreshExpenses()]);
                });

                setNotice("success", "Category deleted.");
                if (String(state.categoryEditorId) === String(categoryId)) {
                    clearCategoryEditor();
                }
                renderApp();
            } catch (error) {
                setNotice("error", error.message);
                renderApp();
            }
        }
    });
}

function bindExpenseHandlers() {
    expenseForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const payload = getExpensePayload(expenseForm);

            await runWithLoading("expenses", async () => {
                if (state.expenseEditorId) {
                    await api.updateExpense(state.expenseEditorId, payload);
                    setNotice("success", "Expense updated.");
                } else {
                    await api.createExpense(payload);
                    setNotice("success", "Expense created.");
                }

                await Promise.all([refreshExpenses(), refreshSummary()]);
            });

            clearExpenseEditor();
            renderApp();
        } catch (error) {
            setNotice("error", error.message);
            renderApp();
        }
    });

    document.querySelector("#expense-cancel").addEventListener("click", clearExpenseEditor);

    expenseList.addEventListener("click", async (event) => {
        const action = event.target.dataset.expenseAction;
        const expenseId = event.target.dataset.expenseId;

        if (!action || !expenseId) {
            return;
        }

        if (action === "edit") {
            const expense = findExpenseById(expenseId);
            if (!expense) {
                return;
            }

            setExpenseEditor(expense.id);
            fillExpenseForm(expenseForm, expense);
            setView("expenses");
            renderApp();
            return;
        }

        if (action === "delete") {
            const confirmed = window.confirm("Delete this expense?");
            if (!confirmed) {
                return;
            }

            try {
                await runWithLoading("expenses", async () => {
                    await api.deleteExpense(expenseId);
                    await Promise.all([refreshExpenses(), refreshSummary()]);
                });

                setNotice("success", "Expense deleted.");
                if (String(state.expenseEditorId) === String(expenseId)) {
                    clearExpenseEditor();
                }
                renderApp();
            } catch (error) {
                setNotice("error", error.message);
                renderApp();
            }
        }
    });

    document.querySelector("#expense-search").addEventListener("input", (event) => {
        updateExpenseFilters({ query: event.target.value });
        renderApp();
    });

    document.querySelector("#expense-filter-category").addEventListener("change", (event) => {
        updateExpenseFilters({ categoryId: event.target.value });
        renderApp();
    });

    document.querySelector("#expense-filter-month").addEventListener("change", (event) => {
        updateExpenseFilters({ month: event.target.value });
        renderApp();
    });

    document.querySelector("#expense-filter-reset").addEventListener("click", () => {
        resetExpenseFilters();
        renderApp();
    });
}

function bindSummaryHandlers() {
    summaryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const year = Number(document.querySelector("#summary-year").value);
        const month = Number(document.querySelector("#summary-month").value);

        if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
            setNotice("error", "Enter a valid year and month for the summary.");
            renderApp();
            return;
        }

        updateSummaryFilters({ year, month });

        try {
            await runWithLoading("summary", refreshSummary);
            setNotice("success", "Monthly summary loaded.");
            renderApp();
        } catch (error) {
            setNotice("error", error.message);
            renderApp();
        }
    });
}

async function initialize() {
    bindNavigation();
    bindCategoryHandlers();
    bindExpenseHandlers();
    bindSummaryHandlers();
    renderApp();

    try {
        await refreshAllData();
        setNotice("success", "Frontend connected to the backend API.");
    } catch (error) {
        setNotice("error", `${error.message} Check that the backend is running and CORS allows this origin.`);
    }

    renderApp();
}

initialize();
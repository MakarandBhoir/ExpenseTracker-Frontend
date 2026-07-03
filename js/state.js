import { getCurrentMonthParts } from "./utils.js";

const currentMonth = getCurrentMonthParts();

export const state = {
    currentView: "dashboard",
    categories: [],
    expenses: [],
    summary: null,
    notice: null,
    loading: {
        bootstrap: false,
        categories: false,
        expenses: false,
        summary: false
    },
    categoryEditorId: null,
    expenseEditorId: null,
    expenseFilters: {
        query: "",
        categoryId: "",
        month: ""
    },
    summaryFilters: {
        year: currentMonth.year,
        month: currentMonth.month
    }
};

export function setView(viewName) {
    state.currentView = viewName;
}

export function setNotice(tone, message) {
    state.notice = message ? { tone, message } : null;
}

export function setLoading(scope, value) {
    state.loading[scope] = value;
}

export function updateCategories(categories) {
    state.categories = categories;
}

export function updateExpenses(expenses) {
    state.expenses = expenses;
}

export function updateSummary(summary) {
    state.summary = summary;
}

export function setCategoryEditor(id) {
    state.categoryEditorId = id;
}

export function setExpenseEditor(id) {
    state.expenseEditorId = id;
}

export function updateExpenseFilters(partial) {
    state.expenseFilters = {
        ...state.expenseFilters,
        ...partial
    };
}

export function resetExpenseFilters() {
    state.expenseFilters = {
        query: "",
        categoryId: "",
        month: ""
    };
}

export function updateSummaryFilters(partial) {
    state.summaryFilters = {
        ...state.summaryFilters,
        ...partial
    };
}
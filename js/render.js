import {
    escapeHtml,
    filterExpenses,
    formatCurrency,
    formatDateDisplay,
    getCategorySpendBreakdown,
    getDashboardMetrics
} from "./utils.js";

const viewTitles = {
    dashboard: "Overview",
    categories: "Categories",
    expenses: "Expenses",
    summary: "Monthly Summary"
};

function getPanel(viewName) {
    return document.querySelector(`[data-view-panel="${viewName}"]`);
}

function renderEmptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

export function renderNavigation(currentView) {
    document.querySelectorAll(".nav-link").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.view === currentView);
    });

    document.querySelector("#view-title").textContent = viewTitles[currentView] || "Overview";

    document.querySelectorAll(".view").forEach((panel) => {
        panel.classList.remove("is-active");
    });

    const activePanel = getPanel(currentView);
    if (activePanel) {
        activePanel.classList.add("is-active");
    }
}

export function renderStatus(notice, loadingState) {
    const panel = document.querySelector("#status-panel");
    const isLoading = Object.values(loadingState).some(Boolean);

    if (isLoading) {
        panel.innerHTML = '<div class="status-message info">Syncing with backend...</div>';
        return;
    }

    if (!notice) {
        panel.innerHTML = "";
        return;
    }

    panel.innerHTML = `<div class="status-message ${escapeHtml(notice.tone)}">${escapeHtml(notice.message)}</div>`;
}

export function renderDashboard(categories, expenses, summary) {
    const statsHost = document.querySelector("#dashboard-stats");
    const recentHost = document.querySelector("#recent-expenses");
    const breakdownHost = document.querySelector("#category-breakdown");

    const metrics = getDashboardMetrics(categories, expenses, summary);
    statsHost.innerHTML = metrics.map((metric) => `
        <article class="stat-card">
            <p class="eyebrow">${escapeHtml(metric.label)}</p>
            <strong>${escapeHtml(metric.value)}</strong>
            <p>${escapeHtml(metric.detail)}</p>
        </article>
    `).join("");

    if (!expenses.length) {
        recentHost.innerHTML = renderEmptyState("No expenses yet. Create one from the Expenses section.");
    } else {
        recentHost.innerHTML = `<div class="list-stack">${expenses.slice(0, 5).map((expense) => `
            <article class="mini-card">
                <h4>${escapeHtml(expense.description)}</h4>
                <p class="text-muted">${escapeHtml(expense.categoryName || "Uncategorized")} • ${escapeHtml(formatDateDisplay(expense.expenseDate))}</p>
                <span class="amount-pill">${escapeHtml(formatCurrency(expense.amount))}</span>
            </article>
        `).join("")}</div>`;
    }

    const breakdown = getCategorySpendBreakdown(expenses);
    if (!breakdown.length) {
        breakdownHost.innerHTML = renderEmptyState("Category totals will appear once expenses are available.");
    } else {
        breakdownHost.innerHTML = `<div class="list-stack">${breakdown.map((item, index) => `
            <article class="mini-card">
                <p class="eyebrow">Rank ${index + 1}</p>
                <h4>${escapeHtml(item.name)}</h4>
                <span class="amount-pill">${escapeHtml(formatCurrency(item.total))}</span>
            </article>
        `).join("")}</div>`;
    }
}

export function renderCategoryList(categories) {
    const host = document.querySelector("#category-list");

    if (!categories.length) {
        host.innerHTML = renderEmptyState("No categories found. Create your first category.");
        return;
    }

    host.innerHTML = categories.map((category) => `
        <article class="category-card">
            <div>
                <h4>${escapeHtml(category.name)}</h4>
                <p class="text-muted">${escapeHtml(category.description || "No description")}</p>
            </div>
            <div class="card-actions">
                <button class="button button-secondary" type="button" data-category-action="edit" data-category-id="${category.id}">Edit</button>
                <button class="button button-danger" type="button" data-category-action="delete" data-category-id="${category.id}">Delete</button>
            </div>
        </article>
    `).join("");
}

export function renderCategoryOptions(categories) {
    const optionMarkup = categories.map((category) => `
        <option value="${category.id}">${escapeHtml(category.name)}</option>
    `).join("");

    const expenseSelect = document.querySelector("#expense-category");
    const filterSelect = document.querySelector("#expense-filter-category");
    const currentExpenseValue = expenseSelect.value;
    const currentFilterValue = filterSelect.value;

    expenseSelect.innerHTML = `<option value="">Select a category</option>${optionMarkup}`;
    filterSelect.innerHTML = `<option value="">All categories</option>${optionMarkup}`;

    expenseSelect.value = currentExpenseValue;
    filterSelect.value = currentFilterValue;
}

export function renderExpenseList(expenses, filters) {
    const host = document.querySelector("#expense-list");
    const filtered = filterExpenses(expenses, filters);

    if (!filtered.length) {
        host.innerHTML = renderEmptyState("No expenses match the current filters.");
        return;
    }

    host.innerHTML = `<div class="card-list">${filtered.map((expense) => `
        <article class="expense-row">
            <div>
                <h4>${escapeHtml(expense.description)}</h4>
                <p class="text-muted">${escapeHtml(expense.categoryName || "Uncategorized")} • ${escapeHtml(formatDateDisplay(expense.expenseDate))}</p>
            </div>
            <div class="card-actions">
                <span class="amount-pill">${escapeHtml(formatCurrency(expense.amount))}</span>
                <button class="button button-secondary" type="button" data-expense-action="edit" data-expense-id="${expense.id}">Edit</button>
                <button class="button button-danger" type="button" data-expense-action="delete" data-expense-id="${expense.id}">Delete</button>
            </div>
        </article>
    `).join("")}</div>`;
}

export function renderSummary(summary) {
    const host = document.querySelector("#summary-cards");

    if (!summary) {
        host.innerHTML = renderEmptyState("Request a monthly summary to see totals.");
        return;
    }

    host.innerHTML = `
        <article class="stat-card">
            <p class="eyebrow">Period</p>
            <strong>${escapeHtml(`${summary.month}/${summary.year}`)}</strong>
            <p class="summary-note">Requested from the summary endpoint.</p>
        </article>
        <article class="stat-card">
            <p class="eyebrow">Total amount</p>
            <strong>${escapeHtml(formatCurrency(summary.totalAmount))}</strong>
            <p class="summary-note">Aggregate monthly spend</p>
        </article>
        <article class="stat-card">
            <p class="eyebrow">Expense count</p>
            <strong>${escapeHtml(String(summary.expenseCount))}</strong>
            <p class="summary-note">Transactions recorded</p>
        </article>
    `;
}

export function syncSummaryInputs(filters) {
    document.querySelector("#summary-year").value = String(filters.year);
    document.querySelector("#summary-month").value = String(filters.month);
}

export function syncExpenseFilterInputs(filters) {
    document.querySelector("#expense-search").value = filters.query;
    document.querySelector("#expense-filter-category").value = filters.categoryId;
    document.querySelector("#expense-filter-month").value = filters.month;
}

export function setCategoryFormTitle(isEditing) {
    document.querySelector("#category-form-title").textContent = isEditing ? "Edit category" : "Create category";
}

export function setExpenseFormTitle(isEditing) {
    document.querySelector("#expense-form-title").textContent = isEditing ? "Edit expense" : "Create expense";
}
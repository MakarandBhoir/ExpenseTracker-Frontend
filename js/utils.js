export function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

export function formatDateDisplay(value) {
    if (!value) {
        return "-";
    }

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(parsed);
}

export function formatDateForInput(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 10);
}

export function getCurrentMonthParts() {
    const now = new Date();

    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1
    };
}

export function getMonthFilterValue(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 7);
}

export function sortExpenses(expenses) {
    return [...expenses].sort((left, right) => right.expenseDate.localeCompare(left.expenseDate));
}

export function filterExpenses(expenses, filters) {
    return expenses.filter((expense) => {
        const query = filters.query.trim().toLowerCase();
        const matchesQuery = !query
            || expense.description.toLowerCase().includes(query)
            || (expense.categoryName || "").toLowerCase().includes(query);
        const matchesCategory = !filters.categoryId || String(expense.categoryId) === String(filters.categoryId);
        const matchesMonth = !filters.month || getMonthFilterValue(expense.expenseDate) === filters.month;

        return matchesQuery && matchesCategory && matchesMonth;
    });
}

export function getDashboardMetrics(categories, expenses, summary) {
    const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    return [
        {
            label: "Categories",
            value: String(categories.length),
            detail: "Available category groups"
        },
        {
            label: "Expenses",
            value: String(expenses.length),
            detail: "Tracked transactions"
        },
        {
            label: "All-time spend",
            value: formatCurrency(totalSpent),
            detail: "Based on loaded expenses"
        },
        {
            label: "Current month",
            value: summary ? formatCurrency(summary.totalAmount) : formatCurrency(0),
            detail: summary ? `${summary.expenseCount} entries this month` : "Summary unavailable"
        }
    ];
}

export function getCategorySpendBreakdown(expenses) {
    const totals = expenses.reduce((accumulator, expense) => {
        const key = expense.categoryName || "Uncategorized";
        accumulator[key] = (accumulator[key] || 0) + Number(expense.amount || 0);
        return accumulator;
    }, {});

    return Object.entries(totals)
        .map(([name, total]) => ({ name, total }))
        .sort((left, right) => right.total - left.total)
        .slice(0, 5);
}
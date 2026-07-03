const DEFAULT_API_ORIGIN = "https://baendend-expensetracker.azurewebsites.net";

function normalizeOrigin(value) {
    return String(value || "").replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
    const configuredOrigin = window.ExpenseTrackerConfig?.apiOrigin;
    const apiOrigin = configuredOrigin ? normalizeOrigin(configuredOrigin) : DEFAULT_API_ORIGIN;

    return `${apiOrigin}/api/v1`;
}

const API_BASE_URL = resolveApiBaseUrl();

function buildHeaders(body) {
    const headers = {
        Accept: "application/json"
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

async function parseResponse(response) {
    const rawText = await response.text();

    if (!rawText) {
        return null;
    }

    try {
        return JSON.parse(rawText);
    } catch {
        return rawText;
    }
}

function toErrorMessage(payload, fallback) {
    if (!payload) {
        return fallback;
    }

    if (typeof payload === "string") {
        return payload;
    }

    if (payload.message) {
        return payload.message;
    }

    if (payload.error) {
        return payload.error;
    }

    return fallback;
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...buildHeaders(options.body),
            ...(options.headers || {})
        }
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
        throw new Error(toErrorMessage(payload, `Request failed with status ${response.status}.`));
    }

    return payload;
}

export const api = {
    getCategories() {
        return request("/categories");
    },
    createCategory(payload) {
        return request("/categories", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    updateCategory(id, payload) {
        return request(`/categories/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    },
    deleteCategory(id) {
        return request(`/categories/${id}`, {
            method: "DELETE"
        });
    },
    getExpenses() {
        return request("/expenses");
    },
    createExpense(payload) {
        return request("/expenses", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    updateExpense(id, payload) {
        return request(`/expenses/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    },
    deleteExpense(id) {
        return request(`/expenses/${id}`, {
            method: "DELETE"
        });
    },
    getMonthlySummary(year, month) {
        const params = new URLSearchParams({
            year: String(year),
            month: String(month)
        });

        return request(`/expenses/summary/monthly?${params.toString()}`);
    }
};
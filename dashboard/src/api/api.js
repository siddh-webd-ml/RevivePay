const API_BASE = "http://127.0.0.1:8000";

export async function getMetrics() {
  const response = await fetch(
    `${API_BASE}/metrics`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch metrics");
  }

  return response.json();
}


export async function getAudit() {
  const response = await fetch(
    `${API_BASE}/audit`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch audit");
  }

  return response.json();
}


export async function recoverPayment(transaction) {
  const response = await fetch(
    `${API_BASE}/recover`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(transaction)
    }
  );

  if (!response.ok) {
    throw new Error("Recovery request failed");
  }

  return response.json();
}
const API_URL = "http://localhost:5000";

export async function createAdmin(tenantId, adminData) {
  const response = await fetch(`${API_URL}/tenants/${tenantId}/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar admin");
  }

  return response.json();
}
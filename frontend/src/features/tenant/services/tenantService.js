const API_URL = "http://localhost:5000"; 

export async function createTenantDraft(companyData) {
  const response = await fetch(`${API_URL}/tenants/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar tenant");
  }

  return response.json();
}
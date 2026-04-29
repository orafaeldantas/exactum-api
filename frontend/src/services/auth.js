const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function loginRequest(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao autenticar");
  }

  return data;
}
"use client";

import { useState } from "react";

export default function TokenPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/token");
      if (!res.ok) throw new Error("Falha na requisição");
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      console.error(err);
      setError("Erro ao obter token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Obter Token de Acesso</h1>

      <button
        onClick={handleGetToken}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Consultando..." : "Obter Token"}
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {token && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Token:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {token}
          </pre>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatAnaliseDetalhe } from "@/app/datapf/format";

export default function ArkPage() {
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleConsultar() {
    setCarregando(true);

    const res = await fetch("/api/ark");
    const data = await res.json();

    const detalheStr = data?.elements?.[0]?.AnaliseDetalhe || "";
    const detalheObj = formatAnaliseDetalhe(detalheStr);

    console.log(detalheObj);

    setResultado(detalheObj);
    setCarregando(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Consulta Ark</h1>
      <button
        onClick={handleConsultar}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={carregando}
      >
        {carregando ? "Consultando..." : "Consultar"}
      </button>

      {resultado && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Resultado formatado:</h2>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Lead = {
  id: string;
  nome?: string | null;
  telefone?: string | null;
  createdAt?: string | null;
};

type Corretor = {
  id: string;
  name: string;
};

export default function LeadsSemCorretorPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>({}); // leadId -> corretorId
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [distributing, setDistributing] = useState<boolean>(false);

  const loadCorretores = async () => {
    try {
      const res = await fetch("/api/corretores", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar corretores");
      const data = await res.json();
      setCorretores((data?.corretores || data || []).map((c: any) => ({ id: c.id, name: c.name ?? c.nome ?? "Sem nome" })));
    } catch (e: any) {
      console.error(e);
    }
  };

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads/sem-corretor", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar leads");
      const data = await res.json();
      const list: Lead[] = Array.isArray(data?.leads) ? data.leads : data;
      setLeads(list);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erro desconhecido ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorretores();
    loadLeads();
  }, []);

  const handleSelect = (leadId: string, corretorId: string) => {
    setSelectedMap((prev) => ({ ...prev, [leadId]: corretorId }));
  };

  const associarLead = async (leadId: string) => {
    const corretorId = selectedMap[leadId];
    if (!corretorId) {
      alert("Selecione um corretor para associar.");
      return;
    }
    setAssigning((p) => ({ ...p, [leadId]: true }));
    try {
      const res = await fetch(`/api/leads/${leadId}/associar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: corretorId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Não foi possível associar o lead");
      }
      await loadLeads();
    } catch (e: any) {
      alert(e?.message || "Erro ao associar lead");
    } finally {
      setAssigning((p) => ({ ...p, [leadId]: false }));
    }
  };

  const distribuirAutomaticamente = async () => {
    if (!confirm("Distribuir automaticamente todos os leads sem corretor?")) return;
    setDistributing(true);
    try {
      const res = await fetch("/api/leads/sem-corretor/distribuir", { method: "POST" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Falha ao distribuir automaticamente");
      }
      await loadLeads();
      alert("Leads distribuídos com sucesso.");
    } catch (e: any) {
      alert(e?.message || "Erro na distribuição automática");
    } finally {
      setDistributing(false);
    }
  };

  const leadRows = useMemo(() => leads, [leads]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">Leads sem corretor</h1>
        <Button onClick={distribuirAutomaticamente} disabled={distributing} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
          {distributing ? "Distribuindo..." : "Distribuir leads automaticamente"}
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-300">Carregando...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : leadRows.length === 0 ? (
        <div className="text-gray-300">Nenhum lead sem corretor encontrado.</div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Criado em</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Corretor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {leadRows.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 text-sm text-white">{lead.nome || "(Sem nome)"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.telefone || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      className="bg-slate-800 border border-slate-700 text-gray-200 rounded-md px-2 py-1"
                      value={selectedMap[lead.id] || ""}
                      onChange={(e) => handleSelect(lead.id, e.target.value)}
                    >
                      <option value="">Selecione um corretor</option>
                      {corretores.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button
                      variant="outline"
                      className="border-slate-600 text-gray-200 hover:bg-slate-700"
                      onClick={() => associarLead(lead.id)}
                      disabled={assigning[lead.id]}
                    >
                      {assigning[lead.id] ? "Associando..." : "Associar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

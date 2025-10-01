"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, ArrowLeft } from "lucide-react";

interface Imobiliaria {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo?: boolean;
}

export default function EditarImobiliariaPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [data, setData] = useState<Imobiliaria | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/imobiliarias/${id}`);
        if (!res.ok) throw new Error("Falha ao carregar imobiliária");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message ?? "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (field: keyof Imobiliaria, value: string | boolean) => {
    if (!data) return;
    setData({ ...data, [field]: value } as Imobiliaria);
  };

  const handleSave = async () => {
    if (!id || !data) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/imobiliarias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          cnpj: data.cnpj,
          telefone: data.telefone,
          email: data.email,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          ativo: data.ativo,
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar alterações");
      router.push("/admmaster/imobiliarias");
    } catch (e: any) {
      setError(e.message ?? "Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 min-h-screen">
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" size="sm" className="border-blue-400/30 bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 hover:text-white">
          <Link href="/admmaster/imobiliarias">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-300 via-teal-300 to-green-300 bg-clip-text text-transparent">
          Editar Imobiliária
        </h2>
      </div>

      <Card className="py-0 border-blue-500/30 shadow-2xl shadow-blue-900/50 bg-slate-800/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="py-3 bg-gradient-to-r from-blue-800 via-teal-700 to-green-700 text-white border-b border-blue-500/30">
          <CardTitle className="flex items-center text-white">
            <Building className="mr-2 h-5 w-5" />
            Dados da Imobiliária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/60">
          {loading ? (
            <div className="text-blue-200">Carregando...</div>
          ) : error ? (
            <div className="text-red-300">{error}</div>
          ) : (
            <>
              <Input value={data?.nome ?? ""} onChange={(e) => handleChange("nome", e.target.value)} placeholder="Nome" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.cnpj ?? ""} onChange={(e) => handleChange("cnpj", e.target.value)} placeholder="CNPJ" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.telefone ?? ""} onChange={(e) => handleChange("telefone", e.target.value)} placeholder="Telefone" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} placeholder="Email" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.endereco ?? ""} onChange={(e) => handleChange("endereco", e.target.value)} placeholder="Endereço" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.cidade ?? ""} onChange={(e) => handleChange("cidade", e.target.value)} placeholder="Cidade" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.estado ?? ""} onChange={(e) => handleChange("estado", e.target.value)} placeholder="Estado" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <Input value={data?.cep ?? ""} onChange={(e) => handleChange("cep", e.target.value)} placeholder="CEP" className="bg-slate-700/50 border-blue-500/30 text-white" />
              <div className="col-span-1 md:col-span-2 flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
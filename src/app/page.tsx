import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Shield, User } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-lg">
            <Building className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            Sistema CRM Imobiliária
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gerencie leads, corretores e vendas de forma eficiente
          </p>
        </div>

        {/* Cards de Acesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-teal-400" />
                Administrador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                Acesso completo ao sistema para gerenciar corretores, leads e relatórios
              </p>
              <Link href="/admmaster">
                <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                  Acessar Painel Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <User className="h-6 w-6 text-green-400" />
                Corretor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                Gerencie seus leads, gere links de captura e acompanhe seu desempenho
              </p>
              <Link href="/corretor">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Acessar Painel Corretor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Link para Login */}
        <div className="pt-8">
          <p className="text-gray-400 mb-4">Já tem uma conta?</p>
          <Link href="/authentication">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
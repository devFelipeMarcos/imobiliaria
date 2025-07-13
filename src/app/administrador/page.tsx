import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/prisma";

export default async function AdministradorPage() {
  const users = await db.user.findMany();
  const usersActive = users.filter((user) => user.status === "ACTIVE").length;
  const usersInactive = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  const newUserstoday = users.filter(
    (user) =>
      new Date(user.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-slate-600">
            Bem-vindo ao painel administrativo da LogiSecure. Acompanhe as
            métricas e gerencie os clientes da plataforma.
          </p>
        </div>

        {/* Métricas de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Clientes
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-slate-800">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Clientes Ativos
              </CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-green-700">
                {usersActive}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Clientes Inativos
              </CardTitle>
              <UserX className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-red-700">
                {usersInactive}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Funcionalidades */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Funcionalidades Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">
                      Gerenciar Acessos
                    </CardTitle>
                    <CardDescription>
                      Cadastre e edite clientes da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Novos cadastros hoje</span>
                    <span className="font-semibold text-purple-600">
                      {newUserstoday}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">
                      Histórico de Consultas
                    </CardTitle>
                    <CardDescription>
                      Visualize todas as consultas realizadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Consultas hoje</span>
                    <span className="font-semibold text-blue-600">342</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">
                      Relatório Financeiro
                    </CardTitle>
                    <CardDescription>
                      Análises financeiras e faturamento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Receita mensal</span>
                    <span className="font-semibold text-green-600">
                      R$ 47.892
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Atividade Recente */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Atividade Recente
          </h2>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    action: "Novo cliente cadastrado",
                    client: "TransLog Brasil Ltda",
                    time: "há 15 minutos",
                    status: "success",
                  },
                  {
                    action: "Consulta de antecedentes aprovada",
                    client: "João Silva - Motorista",
                    time: "há 32 minutos",
                    status: "success",
                  },
                  {
                    action: "Cliente reativado",
                    client: "Rota Segura Transportes",
                    time: "há 1 hora",
                    status: "info",
                  },
                  {
                    action: "Pagamento processado",
                    client: "Express Cargo S.A.",
                    time: "há 2 horas",
                    status: "success",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-green-500"
                            : activity.status === "info"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {activity.action}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {activity.client}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

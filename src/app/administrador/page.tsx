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
import { prisma } from "@/lib/prisma";

interface User {
  id: string;
  status: string | null;
  createdAt: Date;
}

export default async function AdministradorPage() {
  const users: User[] = await prisma.user.findMany();
  const usersActive = users.filter((user: User) => user.status === "ACTIVE").length;
  const usersInactive = users.filter(
    (user: User) => user.status === "INACTIVE"
  ).length;

  const newUserstoday = users.filter(
    (user: User) =>
      new Date(user.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Bem-vindo ao painel administrativo da Imobiliária. Gerencie leads, corretores e acompanhe o desempenho da sua equipe.
          </p>
        </div>

        {/* Métricas de Clientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl text-white overflow-hidden relative hover:bg-white/15 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 md:-translate-y-16 md:translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-300">
                Total de Usuários
              </CardTitle>
              <div className="bg-purple-600 p-1.5 md:p-2 rounded-lg">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-4 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">
                {users.length}
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl text-white overflow-hidden relative hover:bg-white/15 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 md:-translate-y-16 md:translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-300">
                Usuários Ativos
              </CardTitle>
              <div className="bg-green-600 p-1.5 md:p-2 rounded-lg">
                <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-4 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">
                {usersActive}
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                {((usersActive / users.length) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl text-white overflow-hidden relative hover:bg-white/15 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 md:-translate-y-16 md:translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-300">
                Usuários Inativos
              </CardTitle>
              <div className="bg-red-600 p-1.5 md:p-2 rounded-lg">
                <UserX className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-4 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">
                {usersInactive}
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                {((usersInactive / users.length) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Funcionalidades */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Funcionalidades Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4 p-4 md:p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 md:p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-white group-hover:text-purple-400 transition-colors">
                      Gerenciar Usuários
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-xs md:text-sm">
                      Cadastre e edite usuários da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Novos cadastros hoje</span>
                    <span className="font-bold text-purple-400 bg-purple-600/20 px-2 py-1 rounded-full">
                      {newUserstoday}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4 p-4 md:p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 md:p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-white group-hover:text-blue-400 transition-colors">
                      Gerenciar Leads
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-xs md:text-sm">
                      Acompanhe e gerencie todos os leads
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Leads ativos</span>
                    <span className="font-bold text-blue-400 bg-blue-600/20 px-2 py-1 rounded-full">
                      156
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 group md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4 p-4 md:p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 md:p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-white group-hover:text-green-400 transition-colors">
                      Relatórios
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-xs md:text-sm">
                      Análises e relatórios detalhados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Conversões este mês</span>
                    <span className="font-bold text-green-400 bg-green-600/20 px-2 py-1 rounded-full">
                      23
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Atividade Recente */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Atividade Recente
          </h2>
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl text-white">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 md:h-6 md:w-6" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3 md:space-y-4">
                {[
                  {
                    action: "Novo usuário cadastrado",
                    user: "João Silva",
                    time: "há 2 minutos",
                    type: "user",
                  },
                  {
                    action: "Lead convertido",
                    user: "Maria Santos",
                    time: "há 15 minutos",
                    type: "lead",
                  },
                  {
                    action: "Consulta realizada",
                    user: "Pedro Costa",
                    time: "há 1 hora",
                    type: "query",
                  },
                  {
                    action: "Relatório gerado",
                    user: "Ana Oliveira",
                    time: "há 2 horas",
                    type: "report",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {activity.type === "user" && (
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 md:p-2 rounded-lg">
                          <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      )}
                      {activity.type === "lead" && (
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-1.5 md:p-2 rounded-lg">
                          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      )}
                      {activity.type === "query" && (
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1.5 md:p-2 rounded-lg">
                          <Activity className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      )}
                      {activity.type === "report" && (
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-1.5 md:p-2 rounded-lg">
                          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm md:text-base truncate">
                        {activity.action}
                      </p>
                      <p className="text-gray-300 text-xs md:text-sm truncate">{activity.user}</p>
                      <p className="text-gray-400 text-xs">
                        {activity.time}
                      </p>
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

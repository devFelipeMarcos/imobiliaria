'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Download,
  Filter,
  Eye,
  DollarSign,
  Phone,
  Mail,
  Clock
} from 'lucide-react'

interface RelatorioData {
  periodo: string
  totalLeads: number
  leadsConvertidos: number
  taxaConversao: number
  valorVendas: number
  leadsPorOrigem: { origem: string; quantidade: number }[]
  leadsPorStatus: { status: string; quantidade: number }[]
  performanceMensal: { mes: string; leads: number; vendas: number }[]
}

export default function RelatoriosPage() {
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30dias')

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setRelatorioData({
        periodo: 'Últimos 30 dias',
        totalLeads: 45,
        leadsConvertidos: 8,
        taxaConversao: 17.8,
        valorVendas: 2400000,
        leadsPorOrigem: [
          { origem: 'Site', quantidade: 18 },
          { origem: 'WhatsApp', quantidade: 12 },
          { origem: 'Indicação', quantidade: 8 },
          { origem: 'Redes Sociais', quantidade: 7 }
        ],
        leadsPorStatus: [
          { status: 'Novo', quantidade: 12 },
          { status: 'Contatado', quantidade: 15 },
          { status: 'Interessado', quantidade: 10 },
          { status: 'Negociação', quantidade: 5 },
          { status: 'Convertido', quantidade: 8 },
          { status: 'Perdido', quantidade: 3 }
        ],
        performanceMensal: [
          { mes: 'Jan', leads: 38, vendas: 6 },
          { mes: 'Fev', leads: 42, vendas: 7 },
          { mes: 'Mar', leads: 45, vendas: 8 }
        ]
      })
      setIsLoading(false)
    }, 1000)
  }, [periodoSelecionado])

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Novo': 'bg-blue-500',
      'Contatado': 'bg-yellow-500',
      'Interessado': 'bg-green-500',
      'Negociação': 'bg-purple-500',
      'Convertido': 'bg-emerald-500',
      'Perdido': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Relatórios
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg">
            Acompanhe sua performance e resultados
          </p>
        </div>

        {/* Filtros */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '7dias', label: '7 dias' },
                  { value: '30dias', label: '30 dias' },
                  { value: '90dias', label: '90 dias' },
                  { value: '1ano', label: '1 ano' }
                ].map((periodo) => (
                  <Button
                    key={periodo.value}
                    variant={periodoSelecionado === periodo.value ? 'default' : 'outline'}
                    onClick={() => setPeriodoSelecionado(periodo.value)}
                    className={`text-xs md:text-sm ${
                      periodoSelecionado === periodo.value 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {periodo.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs md:text-sm"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-300 mt-4 text-sm md:text-base">Carregando relatórios...</p>
          </div>
        ) : relatorioData ? (
          <>
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs md:text-sm">Total de Leads</p>
                      <p className="text-white text-xl md:text-2xl font-bold">{relatorioData.totalLeads}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 md:p-3 rounded-xl">
                      <Users className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs md:text-sm">Convertidos</p>
                      <p className="text-white text-xl md:text-2xl font-bold">{relatorioData.leadsConvertidos}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 md:p-3 rounded-xl">
                      <Target className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs md:text-sm">Taxa de Conversão</p>
                      <p className="text-white text-xl md:text-2xl font-bold">{relatorioData.taxaConversao}%</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-2 md:p-3 rounded-xl">
                      <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs md:text-sm">Valor em Vendas</p>
                      <p className="text-white text-lg md:text-xl font-bold">{formatarMoeda(relatorioData.valorVendas)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 md:p-3 rounded-xl">
                      <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Análises */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Leads por Origem */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-white flex items-center space-x-2 text-lg md:text-xl">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Leads por Origem</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {relatorioData.leadsPorOrigem.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                          <span className="text-gray-300 text-sm md:text-base">{item.origem}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold text-sm md:text-base">{item.quantidade}</span>
                          <div className="w-16 md:w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                              style={{ width: `${(item.quantidade / relatorioData.totalLeads) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Leads por Status */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-white flex items-center space-x-2 text-lg md:text-xl">
                    <Target className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Leads por Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {relatorioData.leadsPorStatus.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold text-sm md:text-base">{item.quantidade}</span>
                          <div className="w-16 md:w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`${getStatusColor(item.status)} h-2 rounded-full`}
                              style={{ width: `${(item.quantidade / relatorioData.totalLeads) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Mensal */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-white flex items-center space-x-2 text-lg md:text-xl">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Performance Mensal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  {relatorioData.performanceMensal.map((item, index) => (
                    <div key={index} className="text-center p-4 md:p-6 rounded-xl bg-white/10 border border-white/20">
                      <h3 className="text-white font-semibold text-lg md:text-xl mb-2 md:mb-3">{item.mes}</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-300 text-xs md:text-sm">Leads</p>
                          <p className="text-white text-xl md:text-2xl font-bold">{item.leads}</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-xs md:text-sm">Vendas</p>
                          <p className="text-green-400 text-xl md:text-2xl font-bold">{item.vendas}</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-xs md:text-sm">Taxa</p>
                          <p className="text-purple-400 text-lg md:text-xl font-bold">
                            {((item.vendas / item.leads) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8 md:py-12">
            <BarChart3 className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-sm md:text-base">Erro ao carregar relatórios</p>
          </div>
        )}
      </div>
    </div>
  )
}
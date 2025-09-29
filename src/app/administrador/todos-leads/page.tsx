'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Phone, User, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getAllLeads } from '@/app/leads/actions';

interface Lead {
  id: string
  nome: string
  telefone: string
  status?: string
  createdAt: Date | string
  corretor: {
    nome: string
  }
}

export default function TodosLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [corretorFilter, setCorretorFilter] = useState('todos')

  // Lista única de corretores para o filtro
  const corretores = Array.from(new Set(leads.map(lead => lead.corretor.nome)))

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    let filtered = leads

    // Filtro por termo de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.includes(searchTerm) ||
        lead.corretor.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(lead => lead.status?.toLowerCase() === statusFilter)
    }

    // Filtro por corretor
    if (corretorFilter !== 'todos') {
      filtered = filtered.filter(lead => lead.corretor.nome === corretorFilter)
    }

    setFilteredLeads(filtered)
  }, [searchTerm, statusFilter, corretorFilter, leads])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const result = await getAllLeads()
      
      if (result.success && result.data) {
        setLeads(result.data)
        setFilteredLeads(result.data)
      } else {
        toast.error(result.error || 'Erro ao carregar leads')
      }
    } catch (error) {
      toast.error('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-slate-500/20 text-slate-300 border-slate-400/30'
    
    switch (status.toLowerCase()) {
      case 'novo':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'em_andamento':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'convertido':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'perdido':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30'
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('todos')
    setCorretorFilter('todos')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 md:mb-3">
            Todos os Leads
          </h1>
          <p className="text-slate-300 text-sm md:text-base lg:text-lg">Visualize e gerencie todos os leads do sistema</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6 md:mb-8 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-white text-base md:text-lg">
              <Filter className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-400" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Pesquisa */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-3 w-3 md:h-4 md:w-4" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 md:pl-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 h-10 md:h-12 rounded-xl text-sm md:text-base"
                />
              </div>

              {/* Filtro por Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-10 md:h-12 rounded-xl text-sm md:text-base">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Corretor */}
              <Select value={corretorFilter} onValueChange={setCorretorFilter}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-10 md:h-12 rounded-xl text-sm md:text-base">
                  <SelectValue placeholder="Corretor" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="todos">Todos os Corretores</SelectItem>
                  {corretores.map((corretor) => (
                    <SelectItem key={corretor} value={corretor}>
                      {corretor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão Limpar Filtros */}
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 md:h-12 rounded-xl text-xs md:text-sm sm:col-span-2 lg:col-span-1"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 col-span-2 md:col-span-1">
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-300">Total</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{leads.length}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 md:p-3 rounded-xl">
                  <User className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-300">Novos</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'novo').length}
                  </p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">Novo</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-300">Andamento</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'em_andamento').length}
                  </p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 text-xs">Andamento</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-300">Convertidos</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'convertido').length}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">Convertido</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-300">Perdidos</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'perdido').length}
                  </p>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">Perdido</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs md:text-sm text-slate-300">
            Mostrando {filteredLeads.length} de {leads.length} leads
          </p>
          <Button 
            onClick={fetchLeads} 
            variant="outline" 
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm w-fit"
          >
            Atualizar
          </Button>
        </div>

        {/* Lista de leads */}
        {filteredLeads.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 md:p-8 lg:p-12 text-center">
              <User className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-slate-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-white mb-2">
                Nenhum lead encontrado
              </h3>
              <p className="text-slate-300 text-sm md:text-base">
                Tente ajustar os filtros ou termos de pesquisa.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-white truncate">{lead.nome}</h3>
                        <div className="flex items-center text-slate-300 text-xs md:text-sm">
                          <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 text-purple-400 flex-shrink-0" />
                          <span className="truncate">{lead.telefone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-slate-300 truncate max-w-[120px]">
                        {lead.corretor.nome}
                      </Badge>
                      <Badge className={`${getStatusColor(lead.status)} text-xs`}>
                        {lead.status?.replace('_', ' ').toUpperCase() || 'SEM STATUS'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center text-slate-300 text-xs md:text-sm">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 text-purple-400 flex-shrink-0" />
                      <span className="truncate">Criado em {formatDate(lead.createdAt)}</span>
                    </div>
                    <div className="flex space-x-2 md:space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm px-2 md:px-3"
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs md:text-sm px-2 md:px-3"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
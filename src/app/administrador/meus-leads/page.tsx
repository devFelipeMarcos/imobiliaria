'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getLeadsByCorretor } from '@/app/leads/actions';

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

export default function MeusLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = leads.filter(lead =>
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.includes(searchTerm)
      )
      setFilteredLeads(filtered)
    } else {
      setFilteredLeads(leads)
    }
  }, [searchTerm, leads])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const result = await getLeadsByCorretor()
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Meus Leads
          </h1>
          <p className="text-slate-300 text-lg">Gerencie seus leads atribuídos</p>
        </div>

        {/* Barra de pesquisa */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Pesquisar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total de Leads</p>
                  <p className="text-3xl font-bold text-white">{leads.length}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Novos</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'novo').length}
                  </p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Novo</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Em Andamento</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'em_andamento').length}
                  </p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Andamento</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Convertidos</p>
                  <p className="text-3xl font-bold text-green-400">
                    {leads.filter(lead => lead.status?.toLowerCase() === 'convertido').length}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Convertido</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de leads */}
        <div className="space-y-6">
          {filteredLeads.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead atribuído'}
                </h3>
                <p className="text-slate-300">
                  {searchTerm 
                    ? 'Tente ajustar os termos de pesquisa.' 
                    : 'Você ainda não possui leads atribuídos.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLeads.map((lead) => (
              <Card key={lead.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{lead.nome}</h3>
                        <div className="flex items-center text-slate-300 text-sm">
                          <Phone className="h-4 w-4 mr-1 text-purple-400" />
                          {lead.telefone}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                        {lead.status?.replace('_', ' ').toUpperCase() || 'SEM STATUS'}
                      </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-300 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-purple-400" />
                      Criado em {formatDate(lead.createdAt)}
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        Ver Detalhes
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                        Editar Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
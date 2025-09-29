'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  Eye,
  MessageCircle,
  Star,
  Clock,
  ChevronDown
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

interface Lead {
  id: string
  nome: string
  telefone: string
  createdAt: string
  corretor: {
    id: string
    nome: string
    email: string
  }
  status?: {
    id: string
    nome: string
    cor: string
    descricao: string
  }
}

interface StatusOption {
  id: string
  nome: string
  cor: string
  descricao: string
}

export default function MeusLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([])
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserAndLeads() {
      try {
        // Buscar dados do usuário logado
        const { data: session } = await authClient.getSession()
        if (session?.user?.id) {
          setCurrentUser(session.user)
          
          // Buscar dados do corretor
          const corretorResponse = await fetch(`/api/corretores/${session.user.id}`)
          if (corretorResponse.ok) {
            const corretorData = await corretorResponse.json()
            
            // Buscar leads do corretor usando o corretorId correto
            const leadsResponse = await fetch(`/api/leads/corretor/${corretorData.id}`)
            if (leadsResponse.ok) {
              const leadsData = await leadsResponse.json()
              setLeads(leadsData.leads || [])
            } else {
              toast.error('Erro ao carregar leads')
            }
          } else {
            toast.error('Erro ao carregar dados do corretor')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndLeads()
  }, [])

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch('/api/status')
        if (response.ok) {
          const data = await response.json()
          setStatusOptions(data.statusList || [])
        }
      } catch (error) {
        console.error('Erro ao carregar status:', error)
      }
    }

    loadStatus()
  }, [])

  const handleStatusChange = async (leadId: string, newStatusId: string) => {
    setIsUpdatingStatus(leadId)
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statusId: newStatusId }),
      })

      if (response.ok) {
        const updatedLead = await response.json()
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? updatedLead : lead
          )
        )
        toast.success('Status atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  // Função para formatar data
  const formatarData = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefone.includes(searchTerm)
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Meus Leads
          </h1>
          <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Gerencie todos os seus leads em um só lugar
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <Users className="h-5 w-5" />
            <span className="text-lg font-semibold">{leads.length} leads</span>
          </div>
        </div>

        {/* Busca */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Leads */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-gray-300">Carregando leads...</p>
            </div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-300">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Você ainda não possui leads cadastrados'
                }
              </p>
            </CardContent>
          </Card>
      ) : (
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Informações do Lead */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h3 className="text-lg font-semibold text-white">{lead.nome}</h3>
                      <div className="flex items-center gap-2">
                        <Select
                          value={lead.status?.id || ''}
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                          disabled={isUpdatingStatus === lead.id}
                        >
                          <SelectTrigger className="w-fit min-w-[140px] h-8">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: lead.status?.cor || '#3B82F6' }}
                              />
                              <SelectValue placeholder="Selecionar status">
                                {lead.status?.nome || 'Novo'}
                              </SelectValue>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: status.cor }}
                                  />
                                  <span>{status.nome}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isUpdatingStatus === lead.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="h-4 w-4" />
                          <span>{lead.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>{formatarData(lead.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Corretor: {lead.corretor.nome}
                      </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => window.open(`https://wa.me/${lead.telefone.replace(/\D/g, '')}`, '_blank')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
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
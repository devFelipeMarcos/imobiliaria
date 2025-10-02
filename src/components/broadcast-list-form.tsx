"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Upload, Download, Users, MessageSquare, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  nome: string
  telefone: string
}

interface WhatsAppInstance {
  id: string
  instanceName: string
  connected: boolean
}

interface BroadcastList {
  id: string
  nome: string
  mensagem: string
  contatos: Contact[]
  whatsappInstance?: WhatsAppInstance
}

interface BroadcastListFormProps {
  list?: BroadcastList | null
  onSave: () => void
  onCancel: () => void
}

export function BroadcastListForm({ list, onSave, onCancel }: BroadcastListFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    mensagem: ''
  })
  const [contatos, setContatos] = useState<Contact[]>([])
  const [newContact, setNewContact] = useState({ nome: '', telefone: '' })
  const [loading, setLoading] = useState(false)

  // Inicializar formulário
  useEffect(() => {
    if (list) {
      setFormData({
        nome: list.nome,
        mensagem: list.mensagem
      })
      setContatos(list.contatos)
    }
  }, [list])

  // Adicionar contato
  const handleAddContact = () => {
    if (!newContact.nome.trim() || !newContact.telefone.trim()) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    // Validar telefone (apenas números)
    const phoneRegex = /^[0-9]{10,15}$/
    const cleanPhone = newContact.telefone.replace(/\D/g, '')
    
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Telefone deve conter apenas números e ter entre 10 e 15 dígitos')
      return
    }

    // Verificar se o contato já existe
    const exists = contatos.some(contact => 
      contact.telefone.replace(/\D/g, '') === cleanPhone
    )

    if (exists) {
      toast.error('Este telefone já está na lista')
      return
    }

    setContatos([...contatos, { 
      nome: newContact.nome.trim(), 
      telefone: cleanPhone 
    }])
    setNewContact({ nome: '', telefone: '' })
    toast.success('Contato adicionado com sucesso')
  }

  // Remover contato
  const handleRemoveContact = (index: number) => {
    setContatos(contatos.filter((_, i) => i !== index))
    toast.success('Contato removido')
  }

  // Importar contatos via CSV
  const handleImportContacts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim())
        const importedContacts: Contact[] = []

        lines.forEach((line, index) => {
          if (index === 0) return // Skip header

          const [nome, telefone] = line.split(',').map(item => item.trim().replace(/"/g, ''))
          
          if (nome && telefone) {
            const cleanPhone = telefone.replace(/\D/g, '')
            if (cleanPhone.length >= 10) {
              importedContacts.push({ nome, telefone: cleanPhone })
            }
          }
        })

        if (importedContacts.length > 0) {
          // Filtrar contatos duplicados
          const uniqueContacts = importedContacts.filter(newContact => 
            !contatos.some(existingContact => 
              existingContact.telefone === newContact.telefone
            )
          )

          setContatos([...contatos, ...uniqueContacts])
          toast.success(`${uniqueContacts.length} contatos importados com sucesso`)
        } else {
          toast.error('Nenhum contato válido encontrado no arquivo')
        }
      } catch (error) {
        toast.error('Erro ao processar arquivo CSV')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  // Exportar contatos para CSV
  const handleExportContacts = () => {
    if (contatos.length === 0) {
      toast.error('Nenhum contato para exportar')
      return
    }

    const csvContent = [
      'Nome,Telefone',
      ...contatos.map(contact => `"${contact.nome}","${contact.telefone}"`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `contatos_${formData.nome || 'lista'}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Contatos exportados com sucesso')
  }

  // Salvar lista
  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome da lista é obrigatório')
      return
    }

    if (!formData.mensagem.trim()) {
      toast.error('Mensagem é obrigatória')
      return
    }

    if (contatos.length === 0) {
      toast.error('Adicione pelo menos um contato')
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        nome: formData.nome.trim(),
        mensagem: formData.mensagem.trim(),
        contatos
      }

      const url = list ? `/api/broadcast-lists/${list.id}` : '/api/broadcast-lists'
      const method = list ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar lista')
      }

      toast.success(list ? 'Lista atualizada com sucesso' : 'Lista criada com sucesso')
      onSave()
    } catch (error) {
      console.error('Erro ao salvar lista:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar lista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Informações básicas */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5" />
            Informações da Lista
          </CardTitle>
          <CardDescription className="text-blue-100">
            Configure o nome e a mensagem da sua lista de transmissão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-white">Nome da Lista *</Label>
            <Input
              id="nome"
              placeholder="Ex: Clientes VIP, Leads Quentes..."
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
            />
          </div>

          <div>
            <Label htmlFor="mensagem" className="text-white">Mensagem *</Label>
            <Textarea
              id="mensagem"
              placeholder="Digite sua mensagem aqui. Use {nome} para personalizar com o nome do contato."
              rows={4}
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
            />
            <p className="text-sm text-blue-200 mt-1">
              💡 Dica: Use {'{nome}'} na mensagem para personalizar com o nome de cada contato
            </p>
          </div>


        </CardContent>
      </Card>

      {/* Contatos */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Contatos ({contatos.length})
              </CardTitle>
              <CardDescription className="text-blue-100">
                Adicione os contatos que receberão a mensagem
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportContacts}
                disabled={contatos.length === 0}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportContacts}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adicionar novo contato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            <div>
              <Label htmlFor="newNome" className="text-white">Nome</Label>
              <Input
                id="newNome"
                placeholder="Nome do contato"
                value={newContact.nome}
                onChange={(e) => setNewContact({ ...newContact, nome: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
              />
            </div>
            <div>
              <Label htmlFor="newTelefone" className="text-white">Telefone</Label>
              <Input
                id="newTelefone"
                placeholder="5561999999999"
                value={newContact.telefone}
                onChange={(e) => setNewContact({ ...newContact, telefone: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddContact} className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de contatos */}
          {contatos.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {contatos.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{contact.nome}</p>
                    <p className="text-sm text-blue-200">{contact.telefone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveContact(index)}
                    className="text-red-400 hover:text-red-300 bg-white/10 border-white/20 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-200">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-300" />
              <p>Nenhum contato adicionado ainda</p>
              <p className="text-sm">Adicione contatos manualmente ou importe um arquivo CSV</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            list ? '✏️ Atualizar Lista' : '📢 Criar Lista'
          )}
        </Button>
      </div>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Phone, User, Building, CheckCircle } from 'lucide-react'
import { getCorretorInfo, createLeadForCorretor } from './actions'

const leadSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
})

type LeadFormData = z.infer<typeof leadSchema>

interface Corretor {
  id: string
  name: string
  email: string
  imobiliaria: {
    id: string
    nome: string
  } | null
}

export default function LeadCorretorPage() {
  const params = useParams()
  const corretorId = params.corretorId as string
  const [corretor, setCorretor] = useState<Corretor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: '',
      telefone: '',
    },
  })

  useEffect(() => {
    async function loadCorretor() {
      if (!corretorId) return

      try {
        const result = await getCorretorInfo(corretorId)
        if (result.success) {
          if (result.data) {
          setCorretor(result.data)
        }
        } else {
          toast.error(result.error || 'Erro ao carregar informações do corretor')
        }
      } catch (error) {
        console.error('Erro ao carregar corretor:', error)
        toast.error('Erro ao carregar informações do corretor')
      } finally {
        setIsLoading(false)
      }
    }

    loadCorretor()
  }, [corretorId])

  const onSubmit = async (data: LeadFormData) => {
    if (!corretor || !corretor.imobiliaria) {
      toast.error('Informações do corretor não disponíveis')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createLeadForCorretor({
        nome: data.nome,
        telefone: data.telefone,
        corretorId: corretor.id,
        imobiliariaId: corretor.imobiliaria.id,
      })

      if (result.success) {
        setIsSuccess(true)
        toast.success('Lead enviado com sucesso! O corretor entrará em contato em breve.')
        form.reset()
      } else {
        toast.error(result.error || 'Erro ao enviar lead')
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
      toast.error('Erro ao enviar lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando informações...</p>
        </div>
      </div>
    )
  }

  if (!corretor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Corretor não encontrado</h2>
            <p className="text-gray-600">O link que você acessou pode estar inválido ou expirado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Lead enviado com sucesso!</h2>
            <p className="text-gray-600 mb-4">
              Obrigado pelo seu interesse! {corretor.name} entrará em contato em breve.
            </p>
            <Button 
              onClick={() => {
                setIsSuccess(false)
                form.reset()
              }}
              className="w-full"
            >
              Enviar outro lead
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com informações do corretor */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-800">{corretor.name}</h1>
                <p className="text-gray-600">{corretor.email}</p>
              </div>
            </div>
            
            {corretor.imobiliaria && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {corretor.imobiliaria.nome}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de captura de lead */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-gray-800">
              Deixe seus dados para contato
            </CardTitle>
            <p className="text-center text-gray-600 text-sm">
              Preencha as informações abaixo e {corretor.name} entrará em contato com você
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite seu nome completo" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 99999-9999" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar dados'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Seus dados estão seguros e serão usados apenas para contato comercial.</p>
        </div>
      </div>
    </div>
  )
}
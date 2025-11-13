"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building, 
  Shield, 
  User, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Smartphone, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Play,
  Zap,
  Globe,
  Lock,
  HeadphonesIcon
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestão Completa de Leads",
      description: "Capture, organize e converta leads automaticamente com nossa plataforma inteligente."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Avançado",
      description: "Dashboards em tempo real com métricas que importam para seu negócio imobiliário."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Automação WhatsApp",
      description: "Integração nativa com WhatsApp Business para comunicação automatizada."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "App Mobile",
      description: "Acesse tudo pelo celular. Gerencie leads e vendas de qualquer lugar."
    }
  ];

  const benefits = [
    "Aumento de 300% na conversão de leads",
    "Redução de 80% no tempo de resposta",
    "Automação completa do funil de vendas",
    "Integração com principais portais imobiliários",
    "Relatórios detalhados em tempo real",
    "Suporte técnico especializado 24/7",
    "Interface intuitiva e fácil de usar",
    "Backup automático e segurança avançada",
    "Customização completa para sua marca"
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Diretor Comercial",
      company: "Imobiliária Premium",
      content: "Desde que implementamos o CRM, nossas vendas aumentaram 250%. A automação nos permitiu focar no que realmente importa: fechar negócios.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Corretora",
      company: "Costa Imóveis",
      content: "O sistema é incrível! Consigo gerenciar todos os meus leads pelo celular e nunca mais perdi uma oportunidade. Recomendo para todos os corretores.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CRM Imobiliário</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Funcionalidades</a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefícios</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Depoimentos</a>
              <Link href="/authentication">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Zap className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-blue-300 text-sm font-medium">Revolucione suas vendas</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                    CRM Imobiliário
                  </span>
                  <br />
                  <span className="text-white">do Futuro</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-lg">
                  Transforme leads em vendas com nossa plataforma inteligente. 
                  Automação completa, analytics avançado e integração WhatsApp.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg px-8 py-4">
                  <a href="https://wa.me/556192957810" target="_blank" rel="noopener noreferrer">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4">
                  <a href="/authentication">
                    <Play className="mr-2 h-5 w-5" />
                    Fazer login
                  </a>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Imobiliárias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50k+</div>
                  <div className="text-sm text-gray-400">Leads Processados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">300%</div>
                  <div className="text-sm text-gray-400">Aumento Vendas</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Dashboard Analytics</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                      <div className="text-blue-300 text-sm">Leads Hoje</div>
                      <div className="text-2xl font-bold text-white">127</div>
                      <div className="text-green-400 text-xs">+23%</div>
                    </div>
                    <div className="bg-teal-500/20 rounded-xl p-4 border border-teal-500/30">
                      <div className="text-teal-300 text-sm">Conversões</div>
                      <div className="text-2xl font-bold text-white">89%</div>
                      <div className="text-green-400 text-xs">+12%</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300 text-sm">Performance Mensal</span>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-60"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Funcionalidades <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Poderosas</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tudo que você precisa para transformar sua imobiliária em uma máquina de vendas
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-gradient-to-r from-blue-500/20 to-teal-500/20 border-blue-500/50' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        activeFeature === index 
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500' 
                          : 'bg-gray-700'
                      }`}>
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Sistema em Ação</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Online</span>
                    </div>
                  </div>
                  
                  {activeFeature === 0 && (
                    <div className="space-y-4">
                      <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-300 text-sm">Novos Leads</span>
                          <span className="text-green-400 text-xs">+15 hoje</span>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-white/10 rounded p-2 text-white text-sm">João Silva - Apartamento 2Q</div>
                          <div className="bg-white/10 rounded p-2 text-white text-sm">Maria Costa - Casa 3Q</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
                          <div className="text-purple-300 text-sm">Taxa Conversão</div>
                          <div className="text-2xl font-bold text-white">87%</div>
                        </div>
                        <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                          <div className="text-green-300 text-sm">ROI</div>
                          <div className="text-2xl font-bold text-white">340%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 2 && (
                    <div className="space-y-4">
                      <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-green-400" />
                          <span className="text-green-300 text-sm">WhatsApp Business</span>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-white/10 rounded p-2 text-white text-sm">Mensagem automática enviada</div>
                          <div className="bg-white/10 rounded p-2 text-white text-sm">Lead respondeu em 2min</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 3 && (
                    <div className="space-y-4">
                      <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Smartphone className="h-4 w-4 text-orange-400" />
                          <span className="text-orange-300 text-sm">Acesso Mobile</span>
                        </div>
                        <div className="text-white text-sm">Gerencie de qualquer lugar, a qualquer hora</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-gradient-to-r from-blue-900/50 to-teal-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Por que escolher nosso <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">CRM?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Resultados comprovados que transformam negócios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{benefit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="text-white font-medium">Uptime</div>
                <div className="text-gray-400 text-sm">Disponibilidade garantida</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-white font-medium">Suporte</div>
                <div className="text-gray-400 text-sm">Atendimento especializado</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  30 dias
                </div>
                <div className="text-white font-medium">Teste Grátis</div>
                <div className="text-gray-400 text-sm">Sem compromisso</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              O que nossos <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">clientes</span> dizem
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Histórias reais de sucesso com nosso CRM
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 text-lg italic">"{testimonial.content}"</p>
                    <div className="border-t border-white/10 pt-4">
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      <div className="text-blue-400 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Junte-se a mais de 500 imobiliárias que já transformaram seus resultados
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
              Começar Teste Gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              <HeadphonesIcon className="mr-2 h-5 w-5" />
              Falar com Especialista
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 pt-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span className="text-sm">Dados Seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">Acesso Global</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Sem Compromisso</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CRM Imobiliário</span>
              </div>
              <p className="text-gray-400">
                A plataforma mais completa para gestão imobiliária do mercado.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold">Produto</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">Funcionalidades</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Preços</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Integrações</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold">Suporte</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Central de Ajuda</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Documentação</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contato</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold">Acesso Rápido</h3>
              <div className="space-y-2">
                <Link href="/authentication" className="block text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/admmaster" className="block text-gray-400 hover:text-white transition-colors">
                  Painel Admin
                </Link>
                <Link href="/corretor" className="block text-gray-400 hover:text-white transition-colors">
                  Painel Corretor
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 CRM Imobiliário. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

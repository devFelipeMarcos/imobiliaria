# 🔐 Auth Starter - Next.js + better-auth + Prisma

Este projeto serve como guia base para desenvolvedores que desejam implementar autenticação com e-mail/senha e provedores OAuth no framework Next.js, usando **better-auth** e Prisma.

Foi criado para facilitar a criação de novos sistemas com autenticação pronta, integrada com banco de dados via Prisma e suporte a múltiplos provedores.

---

## 🚀 Tecnologias utilizadas

- Next.js 15
- better-auth (Auth.js)
- Prisma ORM
- PostgreSQL (ou SQLite/MySQL) para persistência
- Tailwind CSS
- React Hook Form & Zod
- Sonner (notificações)
- Providers de autenticação:
  - Google
  - (adicione outros conforme necessidade)

---

## 🧠 Objetivo

Este repositório funciona como um **template inicial reutilizável**, com configuração de autenticação completa, adaptável para sistemas que exigem login via redes sociais ou credenciais próprias.

---

## ✅ Funcionalidades

- 🔑 Login com e-mail e senha
- 🌐 Login com Google OAuth
- 🔄 Refresh de sessão automática
- 🔒 Proteção de rotas via middleware
- 🛠️ Gerenciamento de usuários via Prisma
- 📦 Deploy fácil em Vercel, Heroku, Render, etc.

---

## 📥 Como usar

1. **Clonar o repositório**

   ```bash
   git clone https://github.com/devFelipeMarcos/start
   cd start
   ```

2. **Instalar dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurar variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Preencha `.env` com:

   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   GOOGLE_CLIENT_ID=seu_google_client_id
   GOOGLE_CLIENT_SECRET=seu_google_client_secret
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

4. **Gerar cliente Prisma e migrar**

   ```bash
   npx prisma db push
   ```

5. **Rodar em desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

---

## 📦 Deploy

```bash
npm run build
npm start
```

---

## 🤝 Contribuição

Sinta-se livre para abrir issues e pull requests.  
Este template é mantido pela comunidade e atualizado continuamente.

---


# thconsultas

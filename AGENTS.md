# IEON — Sistema de Gestão Instituto Endurance On

Sistema web de gestão de doadores recorrentes.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Estilo | Tailwind CSS v4 |
| Backend | Next.js API Routes + Server Components |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (bucket: `documents`) |
| Hospedagem | Vercel |

---

## Credenciais

`.env.local` (nunca commitar):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Rotas

```
/                     → redirect para /login
/login                → autenticação
/(donor)/
  /dashboard          → status do mês, seleção de plano
  /historico          → lista de contribuições
  /transparencia      → documentos públicos (PDFs, fotos, vídeos)
/(admin)/
  /admin/dashboard    → KPIs financeiros do mês
  /admin/assinantes   → listagem de doadores
  /admin/pagamentos   → baixa manual, link WhatsApp cobrança
  /admin/documentos   → upload de prestação de contas
```

Admin identificado por `donors.is_admin = true`.

---

## Banco de dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `donors` | Doadores (espelho de `auth.users`) |
| `subscriptions` | Assinaturas (1 por doador, planos: 5/10/15/50/100) |
| `payments` | Lançamentos mensais (pending/paid) |
| `documents` | Documentos de prestação de contas |

### Regras de negócio
- Trigger `on_auth_user_created` cria linha em `donors` ao criar usuário auth
- Função `generate_monthly_payments()` gera lançamentos "pending" no dia 1 de cada mês
- Um doador tem no máximo uma assinatura (UNIQUE donor_id)
- `reference_month` formato: `YYYY-MM`

### Cron mensal
```sql
SELECT cron.schedule('generate-payments', '0 0 1 * *', 'SELECT generate_monthly_payments()');
```

---

## Design system

**Cores (Tailwind v4 via `@theme inline` em globals.css):**
- `text-orange` / `bg-orange` → `#FF8012` (CTAs principais)
- `text-blue` / `bg-blue` → `#38B6FF` (destaques secundários)
- `text-silver` / `bg-silver` → `#BFBFBF` (textos secundários)

**Estilo:** fundo preto (`#0a0a0a`), minimalista, premium.

**Semântica de cores:**
- Pendente → `text-orange`, `bg-orange/10`, `border-orange/20`
- Pago → `text-green-400`, `bg-green-500/10`
- Inativo → `text-zinc-400`, `bg-zinc-700`

---

## Convenções

- Server Components por padrão; `'use client'` apenas onde há interatividade
- Auth guard em cada layout: `supabase.auth.getUser()` + `redirect('/login')`
- Admin guard: checar `donors.is_admin = true`
- `~/lib/supabase/client.ts` para browser, `~/lib/supabase/server.ts` para server
- Tailwind v4: sem `tailwind.config.js` — cores customizadas via `@theme inline` no CSS

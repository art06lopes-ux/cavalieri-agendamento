# Cavalieri Agendamento — app público

App público de agendamento da **Cavalieri Barbearia**, em projeto e domínio próprios,
ligado ao **mesmo Supabase do sistema** (`confraria-da-barba`). Mesmos dados, sem duplicar nada.

## Subir

```bash
npm install
cp .env.example .env.local   # preencha com as MESMAS chaves do sistema
npm run dev
```

## Publicar (repo novo + Vercel)

```bash
git init
git add -A
git commit -m "feat: app publico de agendamento"
gh repo create <seu-usuario>/cavalieri-agendamento --public --source=. --push
```

Na Vercel: **Add New Project** → importe o repo → envs
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
(mesmos valores do sistema) → Deploy → conecte o domínio próprio.

## Pré-requisito no banco

A migration `0019_appointments.sql` (no repo do sistema) precisa estar aplicada
no Supabase — vale para os dois projetos.

## Testes

```bash
npm run typecheck
npm test
npm run build
```

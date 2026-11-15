# Privacidade e Segurança — Content Signal

## Princípios Fundamentais

1. **Dados locais apenas**: Todos os CSVs são lidos, processados e renderizados **exclusivamente no navegador do usuário**. Nenhum dado é enviado a servidores externos.

2. **Sem credenciais**: O projeto **não solicita, armazena ou transmite** tokens de acesso, senhas, cookies, chaves de API ou qualquer segredo.

3. **Sem rastreamento**: Não há analytics, telemetria, pixels, fingerprinting ou qualquer coleta de dados de uso.

4. **Código aberto**: Todo o código é visível e auditável no repositório GitHub.

---

## Fluxo de Dados

```
CSV local (seu computador)
    ↓ [File API - apenas leitura]
Navegador (memória JavaScript)
    ↓ [Processamento: parse, agregação, cálculos]
DOM (tabelas, gráficos, textos)
    ↓ [Renderização]
Sua tela
```

**Em nenhum momento** os dados saem deste fluxo.

---

## O que NÃO acontece

| Ação | Status |
|------|--------|
| Upload do CSV para servidor | ❌ Nunca |
| Envio de métricas para API externa | ❌ Nunca |
| Armazenamento em localStorage/IndexedDB | ❌ Não por padrão (apenas preferências de UI se implementado) |
| Conexão com Meta/Instagram/Google APIs | ❌ Não na v1 |
| Cookies de terceiros | ❌ Nenhum |
| Scripts de analytics (GA, Plausible, etc.) | ❌ Nenhum |
| Fonts/recursos externos não declarados | ❌ Apenas Google Fonts (IBM Plex Sans) declarada no HTML |

---

## Recursos Externos Declarados

| Recurso | Origem | Propósito |
|---------|--------|-----------|
| Nenhum | — | **Zero dependências externas** — fontes de sistema, Canvas vanilla |

Todas as fontes usam `font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (stack de fontes do sistema). Nenhum recurso é carregado de domínios terceiros.

---

## .gitignore — Proteção contra Commits Acidentais

O arquivo `.gitignore` bloqueia:

```
# Dados reais (exports de Insights, relatórios)
*.csv
*.xlsx
*.pdf

# Credenciais e segredos
.env
.env.*
credentials*
tokens*
secrets*
*.pem
*.key

# Dependências e build
node_modules/
dist/
build/
.cache/

# IDE/OS
.DS_Store
Thumbs.db
.vscode/
.idea/
```

**Permitidos explicitamente** (templates e dados sintéticos de demo):
- `data/sample-organic.csv`
- `data/sample-ads.csv`
- `templates/organic-template.csv`
- `templates/ads-template.csv`

---

## Checklist Antes de Commit/Push

- [ ] `git status` não mostra arquivos `.csv`, `.xlsx`, `.pdf` fora de `templates/` ou `data/sample-*`
- [ ] `git diff` não revela tokens, chaves, emails, senhas
- [ ] Nenhum arquivo em `data/` exceto os dois samples
- [ ] `npm install` / `pip install` não foi rodado (não há package.json / requirements.txt)
- [ ] Teste local: `open index.html` → importa CSV real → funciona → remove CSV → `git status` limpo

---

## Futura Integração com Meta Ads (se decidir automatizar)

Se no futuro quiser conectar diretamente à API do Meta (Instagram Graph API + Marketing API), **exija**:

1. **OAuth 2.0** com fluxo de autorização explícito (não token hardcoded)
2. **Escopos mínimos**:
   - Orgânico: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`
   - Anúncios: `ads_read`, `ads_management`, `business_management`
3. **Backend próprio** (Node.js, Python, Go, etc.) — **nunca** chame a API do frontend
4. **Armazenamento seguro** de tokens (vault, keychain, variáveis de ambiente criptografadas)
5. **Renovação automática** de tokens de longa duração (60 dias)
6. **Logs de auditoria** de quem acessou quais dados
7. **Revogação** simples (botão "Desconectar" que revoga token no Meta)

**Este repositório v1 NÃO implementa nada disso.** É intencionalmente apenas local + CSV.

---

## Relato de Vulnerabilidade

Se encontrar qualquer problema de segurança, abra uma *issue* privada ou envie email para o mantenedor. Não exponha dados reais em issues públicas.

---

## Licença

MIT — veja `LICENSE`. Código livre para uso, modificação e distribuição, incluindo comercial. Dados de demonstração são sintéticos e livres.
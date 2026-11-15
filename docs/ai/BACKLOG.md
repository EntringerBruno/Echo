# Backlog — Ambiente de Desenvolvimento com IA

## Legenda de Status
- **Pronto** — Pronto para execução, dependências resolvidas
- **Em andamento** — Sendo trabalhado atualmente
- **Pendente** — Aguarda dependência, decisão ou priorização
- **Bloqueado** — Impedido por fator externo
- **Concluído** — Entregue e verificado

---

## Preparação do Ambiente (ETAPA 1)

| ID | Tarefa | Prioridade | Dependências | Status | Critério de Aceite |
|----|--------|------------|--------------|--------|-------------------|
| ENV-01 | Descoberta do ambiente (workspace, stack, configs, Signal) | Alta | — | **Concluído** | STATUS.md reflete projeto, stack, Signal, skills, MCPs, hooks |
| ENV-02 | Matriz de capacidades (necessidades vs. existente) | Alta | ENV-01 | **Concluído** | CAPABILITIES.md classifica cada necessidade como coberta/parcial/ausente/não verificada |
| ENV-03 | Seleção e instalação mínima de Skills ausentes | Alta | ENV-02 | **Concluído** | Skills selecionadas instaladas com versão, reversibilidade registrada, sem sobrescrita indevida |
| ENV-04 | Validação de integridade e descoberta das Skills | Média | ENV-03 | **Concluído** | 77 skills verificadas; scroll-craft e Understand-Anything marcados como "carregamento não confirmado" |
| ENV-05 | Preparação do diagnóstico do Signal (rotas, estilos, ferramentas) | Alta | ENV-01 | **Concluído** | Localização, camada de estilos, componentes, tokens, ferramentas de inspeção registrados |
| ENV-06 | Criar estrutura docs/ai (STATUS, BACKLOG, CAPABILITIES, DECISIONS) | Alta | — | **Concluído** | 4 arquivos criados e populados |
| ENV-07 | Atualizar CLAUDE.md com orientação para consultar STATUS | Média | ENV-06 | **Concluído** | Linha adicionada ao CLAUDE.md raiz (Memória operacional do vault) |

---

## Diagnóstico e Melhoria do Signal (ETAPA 2–4)

| ID | Tarefa | Prioridade | Dependências | Status | Critério de Aceite |
|----|--------|------------|--------------|--------|-------------------|
| SIG-01 | Executar Signal localmente e capturar estado atual (screenshots, navegação) | Alta | ENV-05 | **Concluído** | 24 screenshots (4 viewports × 3 abas + 3 estados), capture-report.json, tokens, componentes, keyboard nav |
| SIG-02 | Priorizar problemas de UI com evidências (hierarquia, tipografia, espaçamento, contraste, interação) | Alta | SIG-01 | **Concluído** | DIAGNOSTICO.md com 18 problemas (P0:3, P1:6, P2:6, P3:3), matriz de cobertura por critério |
| SIG-03 | Definir direção visual para tela-piloto (aprovação do usuário) | Alta | SIG-02 | **Pendente** | Aguarda aprovação de direção visual (Part B); diagnóstico revisado em 0.3 com medições reais |
| SIG-03a | Revisão visual humana das capturas (hierarquia, composição, densidade, estética) | Alta | SIG-02 | **Pendente** | Revisor abre capturas e decide itens "requer olhar humano" no DIAGNOSTICO.md |
| SIG-04 | Implementar fatia pequena da tela-piloto (uma aba ou componente) | Alta | SIG-03 | **Pendente** | Código alterado, build passa, antes/depois capturado nos 4 viewports |
| SIG-05 | Validar tela-piloto (funcional + visual: teclado, responsividade, estados, contraste) | Alta | SIG-04 | **Pendente** | Checklist de qualidade UI passado, evidências registradas |
| SIG-06 | Consolidar processo de UI (tokens, componentes, critérios, procedimento de revisão) | Média | SIG-05 | **Pendente** | DESIGN.md ou equivalente criado, checklist reutilizável documentado |

---

## Automações (ETAPA 5)

| ID | Tarefa | Prioridade | Dependências | Status | Critério de Aceite |
|----|--------|------------|--------------|--------|-------------------|
| AUT-01 | Base de tarefas (task queue, persistência, agendamento) | Média | — | **Pendente** | Sistema funcional para criar, listar, executar, monitorar tarefas |
| AUT-02 | E-mail operacional (leitura, triagem, rascunho de resposta) | Média | — | **Pendente** | Integração Gmail funcional, triagem automática, rascunhos revisáveis |
| AUT-03 | Expandir automações conforme prioridade aprovada | Baixa | AUT-01, AUT-02 | **Pendente** | Novas automações adicionadas com critérios claros |

---

## Sistemas SNF8 (Backlog Futuro — Não Iniciar Agora)

| ID | Sistema | Prioridade | Observação |
|----|---------|------------|------------|
| SNF-01 | Captura por voz | Baixa | Requer PDF SNF8 para detalhamento |
| SNF-02 | Coordenação e encaminhamento de tarefas | Baixa | Base compartilhada necessária |
| SNF-03 | Triagem de e-mail e preparação de rascunhos | Baixa | Sobreposição com AUT-02 |
| SNF-04 | Reaproveitamento de conteúdo | Baixa | — |
| SNF-05 | Planejamento editorial e métricas por função | Baixa | — |
| SNF-06 | Pareceres de finanças, crescimento e operações | Baixa | — |
| SNF-07 | Extração e acompanhamento de compromissos de reuniões | Baixa | — |
| SNF-08 | Atualização de CRM baseada em evidências | Baixa | — |

**Base compartilhada SNF8:** Identificação persistente, origem, responsável, estado, validação, aprovação humana, prevenção de duplicatas, limite de tentativas, logs, resumo de exceções.

---

## Notas de Priorização
- **ETAPA 1** deve ser 100% concluída antes de avançar
- **Signal (ETAPA 2–4)** é o candidato prioritário para melhoria visual
- **Automações (ETAPA 5)** só após consolidação do processo de UI
- **SNF8** permanece no backlog até PDF disponível e prioridade aprovada
- Não instalar n8n, Make, banco, CRM, provedor de e-mail por suposição

---
*Atualizado: 2026-11-15*
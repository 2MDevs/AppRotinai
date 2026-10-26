# RotinAPP — Sua rotina, com mais leveza

O RotinAPP é um aplicativo progressivo (PWA) de organização pessoal e familiar que reúne gestão de hábitos positivos e negativos, rotinas diárias por horário, tarefas recorrentes com cálculo de cumprimento, calendário integrado, cuidados com medicamentos, perfis de dependentes e um assistente inteligente com voz e IA, unindo estética botânica serena a uma engenharia confiável e segura.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> As seguintes decisões orientam a implementação com base no retorno da Fase 1:

- **Confirmed Decision 1 (Persistência e Arquitetura)**: Backend full-stack integrado com Express (`server.ts`), banco relacional persistente com SQLite/Postgres-compatible schema, rotas REST autenticadas, controle de concorrência e exportação de dados, com suporte a sincronização offline via IndexedDB/Service Worker e integração configurável com Supabase.
- **Confirmed Decision 2 (Inicialização de Dados)**: O aplicativo inicia com banco limpo e conduz o usuário pelo fluxo acolhedor de Onboarding e cadastro de conta, disponibilizando na tela de Configurações um botão opcional de "Carregar demonstração guiada" com os dados ilustrados no painel visual (perfil de Brenda Silva, hábitos, crianças e medicamentos).
- **Confirmed Decision 3 (Voz e Notificações)**: Implementação de Web Push com Service Worker e central de notificações persistida no banco, somada ao ditado e leitura por voz utilizando a Web Speech API (`SpeechRecognition` e `SpeechSynthesis`) com feedback acolhedor em português do Brasil e fallback textual imediato.

---

### 1. Overview & Core Concept

- **O que faz**: Oferece uma plataforma unificada e humanizada para gerenciar o dia a dia sem sobrecarga cognitiva ou gamificação punitiva. Permite rastrear hábitos saudáveis e hábitos que se deseja evitar, agendar medicamentos de dependentes com confirmação de dose, manter tarefas recorrentes calculadas matematicamente e interagir com um assistente conversacional que executa ações reais no sistema.
- **Público-alvo**: Pessoas e famílias que buscam equilíbrio diário — especialmente mães, pais, cuidadores e profissionais que precisam de previsibilidade suave para cuidar de si e de quem amam.
- **Diferencial de Valor**: Tratamento ético de hábitos negativos (focado na prevenção consciente e sem julgamentos), registro de "Dia Fora da Rotina" para proteger os índices de sucesso em momentos atípicos (viagens, doenças) e gestão segura de saúde familiar sem diagnósticos automáticos.

---

### 2. User Experience & Visual Design

O design é rigorosamente fiel ao painel de 20 telas fornecido (`Painel_de_Interfaces_do_RotinAPP_33ecae85.png`) e às diretrizes de design mobile-first e acessibilidade WCAG AA:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MAPA DAS 20 TELAS NAVEGÁVEIS                    │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Splash & Onboarding         │ Apresentação visual e primeiros passos│
│ 2. Login & Cadastro            │ Autenticação segura, e-mail/senha     │
│ 3. Dashboard Hoje              │ Progresso do dia, anel 68%, atalhos   │
│ 4. Hábitos (Lista e Registro)  │ Hábitos positivos e negativos por aba │
│ 5. Registrar Hábito com Voz    │ Onda sonora interativa e transcrição  │
│ 6. Grupos de Hábitos           │ Casa, Eu, Maternidade, Trabalho, etc. │
│ 7. Gráficos de Hábitos         │ Taxa de sucesso, anel 78%, barras sem.│
│ 8. Rotinas Diárias             │ Timeline diária: manhã, trabalho, noite│
│ 9. Detalhe da Rotina           │ Sub-atividades com checklist e alarme │
│ 10. Agenda / Calendário        │ Calendário mensal com tarefas do dia  │
│ 11. Tarefas Recorrentes        │ Dias restantes, repetições trimestrais│
│ 12. Família & Medicamentos     │ Dependentes (Ana, Pedro, Lucas) e doses│
│ 13. Detalhe do Medicamento     │ Horários, dosagem, confirmação de dose│
│ 14. Central de Notificações    │ Histórico de lembretes e horários     │
│ 15. Assistente de IA           │ Chat e voz para criar e consultar dados│
│ 16. Configurações              │ Preferências, sincronização, privacidade│
│ 17. Perfil da Usuária          │ Brenda Silva, conquistas e objetivos  │
│ 18. Dashboard Familiar         │ 4 cartões com resumo de cuidados      │
│ 19. Relatórios Mensais         │ Comparativo mensal e taxa de prevenção│
│ 20. Dia Fora da Rotina         │ Pausa justificada (viagem/trabalho)   │
└────────────────────────────────┴───────────────────────────────────────┘
```

#### Identidade Visual & Tema
- **Paleta de Cores**:
  - *Fundo Neutro*: Branco puro `#FFFFFF` e cinza-névoa `#F8FAF9` para cartões.
  - *Verde Botânico Principal*: `#2D6A4F` (verde profundo acolhedor) com variantes `#40916C` e `#52B788`.
  - *Verde Suave (Positivos)*: Fundo `#E8F5E9`, texto `#1B5E20`, borda `#C8E6C9`.
  - *Vermelho Suave (Negativos)*: Fundo `#FFEBEE`, texto `#C62828`, borda `#FFCDD2`.
  - *Superfícies e Linhas*: Linhas ultrafinas em cinza suave `rgba(0, 0, 0, 0.06)`, cartões com cantos arredondados generosos (`rounded-2xl` e `rounded-3xl`), sem gradientes estridentes.
- **Tipografia**:
  - Títulos e Destaques: `Plus Jakarta Sans`, moderna, legível e acolhedora.
  - Corpo de Texto: `DM Sans`, excelente conforto de leitura em telas pequenas.
  - Numerais de Métricas: `tabular-nums` para alinhamento impecável de percentuais e contadores.
- **Navegação & Ergonomia**:
  - No celular: Barra inferior fixa com 5 destinos (Início, Hábitos, Rotinas, Família, Mais) dentro do limite de 15% da viewport, com área de toque de no mínimo 44×44px.
  - No desktop: Barra lateral recolhível preservando a mesma clareza e ritmo visual sem estreitar o conteúdo em faixas vazias.

---

### 3. Key Product Decisions & Trade-Offs

- **Tratamento de Hábitos Negativos**:
  - *Abordagem*: O sucesso em hábitos negativos é calculado quando o comportamento foi **evitado** (`evitado`). Se ocorreu (`ocorrido`), registra-se o fato com acolhimento. Dias marcados como "não se aplica" ou "não respondido" não são pontuados como falha nem prejudicam o denominador.
  - *Por quê*: Evita a espiral de culpa e desmotivação típica de rastreadores tradicionais.
- **Cálculo Matemático Transparente de Métricas**:
  - *Fórmula*:
    $$\text{Taxa de Sucesso} = \frac{\text{Positivos Concluídos} + \text{Negativos Evitados}}{\text{Total de Respostas Válidas Aplicáveis}} \times 100$$
  - Exclui dias marcados como "Dia Fora da Rotina" para as categorias selecionadas.
- **Segurança e Privacidade dos Medicamentos e Família (LGPD)**:
  - *Abordagem*: Registro estrito para apoio à organização familiar com disclaimer legal explícito ("O RotinAPP é uma ferramenta de organização diária e não substitui orientação médica ou prescrições"). Nenhuma recomendação farmacológica gerada por IA.
- **Assistente de IA com Ferramentas Confinadas (Backend Tool Calling)**:
  - *Abordagem*: O assistente utiliza a API Gemini no backend com schema de chamadas de funções validado. Apenas mutações autorizadas do usuário são permitidas; exclusões em lote exigem confirmação explícita do usuário. A chave de API nunca chega ao navegador.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARQUITETURA DO SISTEMA                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENTE PWA (React 19 + Vite + Tailwind CSS v4)                           │
│   ┌───────────────────────┬────────────────────────┬────────────────────┐   │
│   │ 20 Telas Funcionais   │ Web Speech & Push SW   │ IndexedDB Offline  │   │
│   └───────────┬───────────┴───────────┬────────────┴─────────┬──────────┘   │
│               │                       │                      │              │
│               ▼                       ▼                      ▼              │
│   API SERVER (Node.js Express + TSX)                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ /api/auth/*       -> JWT, Sessão e Perfil                       │       │
│   │ /api/habits/*     -> Grupos, Hábitos e Entradas Diárias         │       │
│   │ /api/routines/*   -> Rotinas, Sub-atividades e Checklist        │       │
│   │ /api/tasks/*      -> Recorrências matemáticas e Ocorrências     │       │
│   │ /api/family/*     -> Dependentes e Cuidadores                   │       │
│   │ /api/meds/*       -> Planos e Administração de Doses            │       │
│   │ /api/assistant/*  -> Gemini 3.8 Flash com Function Declarations │       │
│   │ /api/sync/*       -> Resolução de Conflitos e Exportação LGPD   │       │
│   └─────────────────────────────────┬───────────────────────────────┘       │
│                                     │                                       │
│                                     ▼                                       │
│   CAMADA DE PERSISTÊNCIA RELACIONAL (SQLite Persistente / Schema Supabase)  │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ users, habit_groups, habits, habit_entries, exceptional_days,   │       │
│   │ daily_routines, routine_items, recurring_tasks, task_records,   │       │
│   │ family_members, medications, med_doses, notifications, audit    │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Modelo de Dados das Entidades Principais
1. `users`: ID, nome, email, senha_hash, timezone, created_at.
2. `habit_groups`: ID, user_id, nome, icone, cor, ordem.
3. `habits`: ID, user_id, group_id, nome, tipo (`positivo` | `negativo`), frequencia, dias_semana, lembrete_hora, arquivado.
4. `habit_entries`: ID, habit_id, data (YYYY-MM-DD), status (`concluido` | `nao_concluido` | `evitado` | `ocorrido` | `nao_aplica` | `nao_respondido`), nota, timestamp.
5. `exceptional_days`: ID, user_id, data, motivo (`trabalho` | `viagem` | `compromisso` | `outro`), nota, escopo_exclusao.
6. `daily_routines`: ID, user_id, titulo, hora_inicio, hora_fim, dias_semana, cor, notificacao_ativa, antecedencia_minutos.
7. `routine_items`: ID, routine_id, titulo, concluido, ordem.
8. `recurring_tasks`: ID, user_id, titulo, frequencia (`diaria` | `semanal` | `mensal` | `trimestral` | `anual`), dia_regra, proxima_data.
9. `family_members`: ID, user_id, nome, idade_texto, relacao, avatar_url, notas.
10. `medications`: ID, user_id, member_id, nome, dosagem, horarios, instrucao, lembrete_ativo.
11. `medication_doses`: ID, medication_id, data, horario_previsto, status (`administrado` | `pendente` | `recusado` | `omitido`), registrado_por, horario_real.
12. `notifications`: ID, user_id, titulo, mensagem, horario, lida, tipo.

---

### Plano de Implementação em Etapas

1. **Etapa 1 — Configuração Base e Banco de Dados**:
   - Criação da estrutura de dados, migrações e repositório de persistência em `server.ts` e `/src/server/db.ts`.
   - Setup dos endpoints REST autenticados com hash de senhas e tokens JWT seguros.
2. **Etapa 2 — Componentes de Design System e Navegação**:
   - Definição das cores botânicas, tipografia e ícones.
   - Implementação da navegação responsiva (Tabs inferiores para mobile + Sidebar para desktop) cobrindo as 20 telas.
   - PWA Manifest, Service Worker para cache offline e hook `usePWAInstall`.
3. **Etapa 3 — Módulos Centrais (Hoje, Hábitos e Registro Diário)**:
   - Dashboard Hoje com cálculo real de porcentagem, cards positivos/negativos e próximos compromissos.
   - Gestão de Hábitos e Grupos com filtros dinâmicos.
   - Modal/tela de registro rápido e gravação por voz com visualizador de ondas.
4. **Etapa 4 — Rotinas, Tarefas Recorrentes e Calendário**:
   - Linha do tempo diária com sub-tarefas, status e lembretes.
   - Tarefas com periodicidade matemática (incluindo trimestral, dia 15, toda sexta).
   - Calendário mensal com navegação e visualização de compromissos por dia.
5. **Etapa 5 — Gestão Familiar, Medicamentos e Dia Fora da Rotina**:
   - Cadastro de dependentes, cartões de resumo e planos medicamentosos com controle de doses diárias.
   - Tela de "Dia Fora da Rotina" com seleção de motivo e recálculo transparente.
6. **Etapa 6 — Assistente de IA, Notificações, Voz e Testes**:
   - Assistente integrado ao Gemini com tools no backend para criação e consulta de hábitos e rotinas.
   - Web Speech API para leitura em voz alta e reconhecimento de fala em pt-BR.
   - Central de notificações com suporte a Web Push e testes automatizados de regras e cálculos.

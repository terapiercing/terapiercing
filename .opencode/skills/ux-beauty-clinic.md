# UX Design System — RBClinic (Estética Avançada)

## Contexto
App de gerenciamento de agenda para clínica de estética com público majoritariamente feminino. O design deve transmter **confiança, sofisticação e acolhimento** — sem cair no estereótipo "pink and shrink". A estética é premium-calm: respirada, generosa, moderna.

## Princípios de Design

### 1. Calm & Premium
- Menos é mais: espaço generoso,元气 minimal, sem ruído visual
- Cada tela deve respirar — margens de 24-32px entre seções
- Sombras suaves e sutis, nunca agressivas
- Bordas arredondadas entre 12px e 20px

### 2. Confiança Visual
- Hierarquia clara: o olho guia naturalmente pela tela
- Contraste acessível (WCAG AA mínimo): texto escuro (#3F3F46) sobre fundo claro
- Estados de hover/subtle feedback em cada interação
- Empty states amigáveis com linguagem acolhedora

### 3. Emocional Design
- Micro-interações que reforçam ações completadas
- Animações suaves (200-300ms ease-out), nunca bruscas
- Feedback visual imediato em botões (scale 0.98 no active)
- Linguagem positiva: "Tudo certo!", "Agendamento confirmado"

## Paleta de Cores

| Token | Cor | Uso |
|-------|-----|-----|
| `--color-primary` | `#C4917B` | Ações principais, CTAs, acentos |
| `--color-secondary` | `#D4AF37` | Logotipo, destaques premium, badges dourados |
| `--color-primary-light` | `#F5E6DF` | Fundos de cards, badges suaves |
| `--color-primary-dark` | `#A87060` | Hover states do primary |
| `--color-bg` | `#FDFAF8` | Fundo geral (warm off-white) |
| `--color-surface` | `#FFFFFF` | Cards, modais, formulários |
| `--color-text` | `#3F3F46` | Texto principal (zinc-800) |
| `--color-text-muted` | `#71717A` | Texto secundário (zinc-500) |
| `--color-text-subtle` | `#A1A1AA` | Texto terciário, placeholders (zinc-400) |
| `--color-border` | `#E4E4E7` | Bordas leves (zinc-200) |
| `--color-success` | `#22C55E` | Status: concluído, sucesso |
| `--color-warning` | `#F59E0B` | Status: pendente |
| `--color-error` | `#EF4444` | Erros, ações destrutivas |
| `--color-info` | `#6366F1` | Status: confirmado, info |

## Tipografia

### Fontes
- **Headlines (h1-h2):** Playfair Display (serif) — elegância editorial
- **Body/UI:** Inter (sans-serif) — legibilidade e modernidade
- **Labels e badges:** Inter 500/600, uppercase com letter-spacing 0.05em

### Escala
| Elemento | Tamanho | Peso | Fonte |
|----------|---------|------|-------|
| H1 | 36-48px | 700 | Playfair Display |
| H2 | 24-30px | 600 | Playfair Display |
| H3 | 18-20px | 600 | Inter |
| Body | 14-16px | 400 | Inter |
| Small/Caption | 12-13px | 400 | Inter |
| Button | 14px | 600 | Inter |
| Badge | 11-12px | 600 | Inter |

## Espaçamento & Layout

- **Max width containers:** 1152px (max-w-6xl)
- **Section gap:** 32px (space-y-8)
- **Card padding:** 24-32px (p-6 ou p-8)
- **Input padding:** 12px horizontal, 10px vertical (px-3 py-2.5)
- **Button padding:** 10-12px vertical, 20-24px horizontal
- **Grid gap:** 16-24px (gap-4 a gap-6)

## Componentes

### Botões Primários
```
rounded-xl px-6 py-2.5 text-sm font-semibold text-white
bg-[#C4917B] shadow-sm
hover:bg-[#A87060] transition-all duration-200
active:scale-[0.98]
```

### Botões Secundários
```
rounded-xl px-6 py-2.5 text-sm font-semibold
border border-[#E4E4E7] bg-white text-zinc-700
hover:bg-zinc-50 transition-all duration-200
active:scale-[0.98]
```

### Botões de Perigo
```
rounded-xl px-6 py-2.5 text-sm font-semibold
border border-red-200 bg-red-50 text-red-600
hover:bg-red-100 transition-all duration-200
```

### Cards
```
rounded-2xl border border-zinc-200 bg-white p-6
shadow-[0_1px_3px_rgba(0,0,0,0.04)]
hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300
```

### Inputs
```
w-full rounded-xl border border-zinc-200 bg-white
px-4 py-3 text-sm text-zinc-800
placeholder:text-zinc-400
focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none
transition-all duration-200
```

### Modais
```
fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4
inner: w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl
header: sticky top-0 z-10 border-b border-zinc-100 bg-white px-8 py-5 rounded-t-3xl
```

### Status Badges
```
Pendente:    bg-amber-50 text-amber-700 border border-amber-200
Confirmado:  bg-indigo-50 text-indigo-700 border border-indigo-200
Concluido:   bg-emerald-50 text-emerald-700 border border-emerald-200
Cancelado:   bg-red-50 text-red-600 border border-red-200
```
Todos com: `rounded-full px-3 py-1 text-xs font-medium`

### Cards de Estatísticas
```
rounded-2xl border border-zinc-200 bg-white p-6
com ícone sutil no canto superior direito
número grande em text-3xl font-bold text-[#C4917B]
label em text-xs font-medium text-zinc-500 uppercase tracking-wide
```

## Padrões de Tela

### Dashboard Admin
- Saudação personalizada centralizada
- Grid de stats (3 colunas desktop, 2 mobile) com cards minimalistas
- Grid de módulos (3 colunas desktop, 2 mobile) com hover suave
- Cada módulo: ícone, título, descrição curta, badge de admin quando aplicável

### Listas (Clientes, Agendamentos)
- Header com título + botão de ação principal à direita
- Barra de busca com ícone de lupa (placeholder descritivo)
- Cards com dados do item + ações (editar, excluir, histórico)
- Contador de resultados sutil acima da lista

### Formulários
- Labels acima dos campos, em text-sm font-medium text-zinc-700
- Campos obrigatórios com asterisco rose (#C4917B)
- Grid de 2 colunas em desktop para campos relacionados
- Botões de ação alinhados à direita, com "Cancelar" + "Salvar"
- Mensagens de erro inline, acima dos botões

### Modais
- Título claro no header
- Botão X de fechar no canto superior direito
- Conteúdo com scroll suave
- Botões de ação no footer, alinhados à direita

## Animações & Micro-interações

- **Page transitions:** fade-in sutil (opacity 0→1, 200ms)
- **Card hover:** shadow elevation + translateY(-1px), 200ms
- **Button active:** scale(0.98), 100ms
- **Modal open:** fade + scale de 0.95→1, 200ms ease-out
- **Status change:** color crossfade, 300ms
- **Loading states:** skeleton shimmer ou spinner minimalista

## Acessibilidade

- Contraste mínimo 4.5:1 para texto normal
- Touch targets mínimo 44x44px
- Focus ring visível: `focus:ring-2 focus:ring-[#C4917B]/30`
- Labels associados aos inputs via htmlFor/id
- States disabled com opacity-50 e cursor-not-allowed
- Mensagens de erro com role="alert"

## Regras de Implementação

1. **NUNCA** usar cores hardcoded diretamente — sempre via Tailwind classes do design system
2. **SEMPRE** usar rounded-xl para inputs/botões e rounded-2xl para cards
3. **SEMPRE** incluir transition-all duration-200 em elementos interativos
4. **SEMPRE** usar Playfair Display para títulos h1/h2 e Inter para body
5. **NUNCA** usar sombras grandes ou drop-shadows — apenas shadow-sm ou shadow-[0_1px_3px_rgba(0,0,0,0.04)]
6. **SEMPRE** manter padding mínimo de p-6 em cards e p-8 em modais
7. **SEMPRE** usar border-zinc-200 para bordas — nunca border-zinc-300 ou mais escuro
8. Empty states devem ter texto amigável + ícone + ação sugerida

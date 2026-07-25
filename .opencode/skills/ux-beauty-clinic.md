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
- **Card padding:** 16-24px mobile, 24-32px desktop (`p-4 sm:p-6` ou `p-5 sm:p-6`)
- **Modal padding:** 16px mobile, 24px desktop (`p-4 sm:p-6`)
- **Input padding:** 12px horizontal, 10px vertical (px-3 py-2.5)
- **Button padding:** 8-12px vertical, 16-24px horizontal (`px-4 py-2 sm:px-5 sm:py-2.5`)
- **Grid gap:** 16-24px (gap-4 a gap-6)
- **Container padding:** 16px mobile, 24px desktop (`px-4 sm:px-6`)

## Componentes

### Botões Primários
```
rounded-xl px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold text-white
bg-[#C4917B] shadow-sm
hover:bg-[#A87060] transition-all duration-200
active:scale-[0.98]
```

### Botões Secundários
```
rounded-xl px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold
border border-[#E4E4E7] bg-white text-zinc-700
hover:bg-zinc-50 transition-all duration-200
active:scale-[0.98]
```

### Botões de Perigo
```
rounded-xl px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold
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
fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4
inner: w-full max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl
header: sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-3xl
title: text-base sm:text-lg truncate
body: p-4 sm:p-6
footer buttons: px-4 py-2 sm:px-5 sm:py-2.5
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

## Responsividade Mobile

### Breakpoints
| Prefixo | Largura | Uso |
|---------|---------|-----|
| (nenhum) | < 640px | Mobile — padrão |
| `sm:` | ≥ 640px | Mobile grande / landscape |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Desktop |

### Regras Gerais de Responsividade

1. **Mobile-first:** Sempre escrever classes mobile primeiro, depois `sm:`, `md:`, `lg:` para escalar.
2. **Touch targets:** Botões e links clicáveis devem ter mínimo 44x44px (`min-h-[44px] min-w-[44px]`).
3. **Flex-wrap:** Qualquer `flex` com múltiplos botões/itens DEVE usar `flex-wrap` para evitar overflow em telas estreitas.
4. **Grid colapsável:** Usar `grid-cols-1 sm:grid-cols-2` ou `grid-cols-1 md:grid-cols-3` — nunca grid fixo sem breakpoint.
5. **Padding responsivo:** Containers mobile usam `px-4 py-6`, desktop `px-6 py-8`.
6. **Heading responsivo:** Títulos h1 grandes (`text-4xl sm:text-5xl lg:text-6xl`) para não estourar em mobile.

### Navegação Mobile

- **CRITICAL:** Nav horizontal com 3+ links DEVE ter menu hamburger em mobile.
- Implementar como componente client (`'use client'`) separado com `useState` para toggle.
- Desktop: `hidden md:flex` no nav horizontal.
- Mobile: Botão hamburger com SVG (menu/X toggle) + dropdown overlay com `fixed inset-0 z-50`.
- Dropdown: `w-72 max-w-[calc(100vw-2rem)]` com `rounded-2xl` e `shadow-xl`.
- Overlay de fundo: `bg-black/20 backdrop-blur-sm` com `onClick` para fechar.

### Modais Mobile

- **Max-width:** Sempre `max-w-full sm:max-w-lg` (nunca `max-w-lg` sem fallback mobile).
- **Padding outer:** `p-3 sm:p-4` no container flex.
- **Padding inner:** `p-4 sm:p-6` no conteúdo do modal.
- **Header:** `px-4 py-3 sm:px-6 sm:py-4`.
- **Título:** `text-base sm:text-lg` com `truncate` para nomes longos.
- **Botões footer:** Padding reduzido em mobile (`px-4 py-2 sm:px-5 sm:py-2.5`).

### Cards Mobile

- **Padding:** `p-4 sm:p-5` em vez de `p-5` fixo.
- **Action rows:** `flex flex-wrap justify-end gap-2` para botões de ação.
- **Text overflow:** Usar `truncate` ou `min-w-0` em contentores de texto ao lado de badges/botões.

### Tabs Mobile

- Tabs com texto longo devem ter `overflow-x-auto scrollbar-hide`.
- Container: `min-w-max` para forçar scroll horizontal.
- Labels: `whitespace-nowrap` para não quebrar linha.
- Adicionar utility class `scrollbar-hide` no globals.css.

### Botões de Ação Múltiplos

- Quando 3+ botões ficam lado a lado (Histórico, Editar, Excluir), usar `flex flex-wrap gap-2`.
- Em mobile, os botões devem empilhar ou quebrar linha naturalmente.
- Evitar `shrink-0` em botões que podem precisar de wrap.

### Formulários Mobile

- Grid `sm:grid-cols-2` já colapsa para 1 coluna automaticamente em mobile.
- Inputs devem ser `w-full` sempre.
- Botões de ação: `flex flex-col sm:flex-row gap-3` para empilhar em mobile.

### Headers de Seção Mobile

- Headers com título + botão: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`.
- Títulos grandes (`text-3xl`): usar `text-3xl sm:text-4xl` para não estourar.

### CSS Utility para Scroll

Adicionar no `globals.css`:
```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

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
- Navegação por teclado: todos os elementos interativos acessíveis via Tab

## Regras de Implementação

1. **NUNCA** usar cores hardcoded diretamente — sempre via Tailwind classes do design system
2. **SEMPRE** usar rounded-xl para inputs/botões e rounded-2xl para cards
3. **SEMPRE** incluir transition-all duration-200 em elementos interativos
4. **SEMPRE** usar Playfair Display para títulos h1/h2 e Inter para body
5. **NUNCA** usar sombras grandes ou drop-shadows — apenas shadow-sm ou shadow-[0_1px_3px_rgba(0,0,0,0.04)]
6. **SEMPRE** manter padding mínimo de p-4 sm:p-6 em cards e p-4 sm:p-6 em modais
7. **SEMPRE** usar border-zinc-200 para bordas — nunca border-zinc-300 ou mais escuro
8. Empty states devem ter texto amigável + ícone + ação sugerida
9. **SEMPRE** testar layouts em 320px, 375px e 768px antes de considerar responsivo
10. **SEMPRE** usar `max-w-full sm:max-w-[tamanho]` em modais — nunca `max-w-[tamanho]` sem fallback
11. **SEMPRE** usar `flex-wrap` quando há 3+ botões de ação em row
12. **SEMPRE** nav com 3+ links DEVE ter menu hamburger em mobile via componente client separado
13. **SEMPRE** headings h1 devem escalar de mobile para desktop com `text-[size] sm:text-[size+1] lg:text-[size+2]`
14. **NUNCA** usar `px-6 py-8` sem `sm:` breakpoint — mobile sempre com padding menor

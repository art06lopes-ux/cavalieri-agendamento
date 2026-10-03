# Verificação visual e de contraste — 2026-10-03

Registro do que foi verificado no branch `feat/visual-premium` (app público da Cavalieri).
Factual: só texto, sem anexos binários. As imagens não entram no repositório.

## O que foi verificado

### Layout por rota e largura (screenshot real)

4 rotas × 3 larguras de viewport (320, 390, 1440 px) como base da rodada, 14 imagens
capturadas no total.

| Rota | 320 | 390 | 1440 |
| --- | --- | --- | --- |
| `/` (home com hero da fachada) | sim | sim | sim |
| `/agendar` (wizard) | sim | sim | sim |
| `/produtos` (vitrine) | sim | sim | sim |
| `/fidelidade` (consulta do carnê) | sim | sim | sim |

Nenhuma quebra de layout, nenhum texto cortado, nenhum elemento estourando a viewport
nos três tamanhos.

### Contraste (critério WCAG AA para texto normal: 4.5:1)

Medido com o script de contraste da skill de design, sobre os valores reais dos tokens:

| Combinação | Razão | Critério 4.5:1 |
| --- | --- | --- |
| `#c0c5ce` (prata) sobre `#09090b` (preto) | 11.48:1 | PASS |
| `#000000` (preto) sobre `#c0c5ce` (prata) | 12.12:1 | PASS |
| `#a1a1aa` (zinc-400) sobre `#09090b` (preto) | 7.76:1 | PASS |

A prata é usada como cor de ação (botões primários) e o preto sobre ela é o texto do botão:
os dois sentidos passam com folga.

### Suíte automatizada

- `npm test` — 52/52 testes passando na altura da revisão (7 arquivos de teste; a rodada
  final adicionou `src/app/fidelidade/actions.test.ts`, com 6 casos, totalizando 58/58).
- `npm run typecheck` — sem erros.
- `npm run build` — build de produção com 8 rotas geradas.

## Bug encontrado na verificação

- **Erro 500 ao consultar um WhatsApp sem cadastro** (`/fidelidade`): a server action
  `saldoFidelidade` lançava `NAO_ENCONTRADO` como exceção, o que quebrava a chamada e
  devolvia 500 em vez de uma mensagem na tela. Corrigido: a action passou a devolver um
  resultado discriminado (`{ ok: false, erro: 'invalido' | 'nao_encontrado' }` ou
  `{ ok: true, nome, total, atual, faltam, gratuitos, completo }`) e a interface trata
  cada caso. Erro de infraestrutura na query continua lançando, para não virar
  "não encontrado" indevido.

## O que NÃO foi verificado

- **Leitor de tela**: nenhuma navegação real com NVDA/JAWS/VoiceOver. As regiões
  `aria-live` e os `aria-label` foram revisados no código, não testados com tecnologia
  assistiva.
- **Contraste do texto sobre a foto do hero**: a medição de contraste é sobre as cores
  sólidas dos tokens; o texto sobre a imagem da fachada depende da foto e do gradiente
  e não foi medido.
- **Desempenho**: sem medição de Core Web Vitals, Lighthouse ou tamanho de bundle.
- **Dispositivos reais**: nada foi testado em celular ou navegador físico de verdade —
  só em viewport emulado.
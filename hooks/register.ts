import type { Register, ThemeSetArgs, ThemeMessageRule } from 'claude-code'

import { makeColors } from './make-colors.js'

// Paleta clássica de 16 cores dos anos 90.
const TEAL = '#008080'
const FACE = '#c0c0c0'
const SHADOW = '#808080'
const LIGHT = '#dfdfdf'
const WHITE = '#ffffff'
const BLACK = '#000000'
const NAVY = '#000080'

const { theme, problems } = makeColors({
  label: 'Retro 95',
  only: 'light',
  roles: { accent: NAVY, danger: '#aa0000', success: '#008000', warning: '#808000', pro: '#800080' },
  light: {
    git: {
      added: '#005a00',
      removed: '#8b0000',
      modified: '#00005f',
      merged: '#5f005f',
      closed: '#8b0000',
      conflicting: '#5a3c00',
      draft: '#303030',
    },
    gray: {
      anchors: {
        'surface-0': '#bdbdbd',
        'surface-1': FACE,
        'surface-2': '#c8c8c8',
        'surface-3': '#c8c8c8',
        'text-primary': BLACK,
        'text-secondary': '#202020',
        'text-muted': '#3a3a3a',
      },
    },
  },
})

// Janela com bisel em relevo e barra de título azul-marinho (resposta do Claude).
const windowRule: ThemeMessageRule = {
  color: BLACK,
  backgroundColor: FACE,
  paddingTop: 30,
  paddingX: 14,
  paddingBottom: 12,
  shadow: { x: 2, y: 2, blur: 0, color: '#00000055' },
  fill: {
    vector: {
      viewBox: 96,
      slice: [26, 26, 6, 6],
      paths: [
        { d: 'M0 0H96V96H0Z', color: BLACK },
        { d: 'M0 0H95V95H0Z', color: LIGHT },
        { d: 'M1 1H95V95H1Z', color: SHADOW },
        { d: 'M1 1H94V94H1Z', color: WHITE },
        { d: 'M2 2H94V94H2Z', color: FACE },
        // barra de título
        { d: 'M4 4H92V22H4Z', color: NAVY },
        // ícone de janelinha no canto esquerdo da barra
        { d: 'M7 7H19V19H7Z', color: WHITE },
        { d: 'M7 7H19V10H7Z', color: '#1084d0' },
        // botão fechar no canto direito
        { d: 'M74 6H90V20H74Z', color: BLACK },
        { d: 'M74 6H89V19H74Z', color: WHITE },
        { d: 'M75 7H89V19H75Z', color: SHADOW },
        { d: 'M75 7H88V18H75Z', color: FACE },
        { d: 'M78 9.5L85 15.5M85 9.5L78 15.5', strokeWidth: 1.6, color: BLACK },
      ],
    },
  },
}

// Campo de texto branco "afundado" (mensagem da pessoa).
const fieldRule: ThemeMessageRule = {
  color: BLACK,
  backgroundColor: WHITE,
  padding: 12,
  fill: {
    vector: {
      viewBox: 32,
      slice: 4,
      paths: [
        { d: 'M0 0H32V32H0Z', color: WHITE },
        { d: 'M0 0H31V31H0Z', color: SHADOW },
        { d: 'M1 1H31V31H1Z', color: LIGHT },
        { d: 'M1 1H30V30H1Z', color: BLACK },
        { d: 'M2 2H30V30H2Z', color: WHITE },
      ],
    },
  },
}

const BASE: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'light',
  backdrop: { color: TEAL },
}

const LOOK: ThemeSetArgs = {
  ...BASE,
  style: {
    Text: { fontFamily: ['sans'], fontSize: 14, lineHeight: 20 },
    Heading: { fontFamily: ['sans'], fontWeight: 'bold', color: NAVY },
    UserMessage: fieldRule,
    AssistantMessage: windowRule,
    ToolUse: {
      color: BLACK,
      fontFamily: ['mono'],
      backgroundColor: FACE,
      borderColor: SHADOW,
      borderWidth: 1,
      radius: 0,
      paddingX: 8,
      paddingY: 2,
    },
  },
  // Bipes de 8 bits, curtos e baixos. Nenhum imita sons de sistema.
  sound: {
    cues: {
      send: { layers: [{ wave: 'square', notes: ['C5', 'G5'], step: 0.05, gain: 0.15, release: 0.08 }] },
      tool: { layers: [{ wave: 'square', notes: ['E6'], gain: 0.06, release: 0.03, filter: { type: 'lowpass', hz: 2500 } }] },
      done: { layers: [{ wave: 'triangle', notes: ['E5', 'G5', 'C6'], step: 0.07, gain: 0.25, release: 0.2 }] },
      ask: { layers: [{ wave: 'square', notes: ['A5', 'A5'], step: 0.12, gain: 0.12, release: 0.06 }] },
      error: { layers: [{ wave: 'square', notes: ['C3', 'G2'], step: 0.12, gain: 0.15, release: 0.15, filter: { type: 'lowpass', hz: 1200 } }] },
      compact: { layers: [{ wave: 'triangle', notes: ['C6', 'G5', 'E5', 'C5'], step: 0.05, gain: 0.15, release: 0.1 }] },
      click: { layers: [{ wave: 'square', notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'], gain: 0.1, release: 0.06, filter: { type: 'lowpass', hz: 3000 } }] },
    },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    let set
    try {
      set = await $.theme.set(LOOK)
    } catch (error) {
      // Versão do app sem suporte a style/sound: aplica só cores e fundo.
      $.ui.log(String(error))
      set = await $.theme.set(BASE)
    }

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })
}

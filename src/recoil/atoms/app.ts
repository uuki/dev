import type { AppProps } from '#/global'
import { atom } from 'recoil'

export const appState = atom<AppProps>({
  key: 'atom.app.state',
  default: {
    showModal: false,
  },
})

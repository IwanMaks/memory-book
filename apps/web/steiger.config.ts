import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // На старте почти каждый слайс используется в одном месте — это нормально,
      // фичи и виджеты начнут переиспользоваться по мере роста приложения.
      'fsd/insignificant-slice': 'off',
    },
  },
])

import { vi } from 'vitest'
import '@testing-library/jest-dom'
import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent, h } from 'vue'

// Configure Vue Test Utils
config.global.plugins = [createPinia()]
config.global.mocks = {
  // Add any global mocks here
}

const RouterView = defineComponent({
  name: 'RouterView',
  setup(props, { slots }) {
    return () => {
      const slot = slots.default?.({ Component: defineComponent({ template: '<div>Mock Component</div>' }) })
      return h('div', slot)
    }
  }
})

const RouterLink = defineComponent({
  name: 'RouterLink',
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
})

// Register global components
config.global.components = {
  RouterLink,
  RouterView,
  ToastContainer: {
    name: 'ToastContainer',
    template: '<div><slot /></div>',
  }
}

// Mock vue-router
vi.mock('vue-router', () => {
  return {
    createRouter: vi.fn(),
    createWebHistory: vi.fn(),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn()
    }),
    useRoute: () => ({
      path: '/',
      name: 'home',
      meta: {}
    }),
    RouterLink,
    RouterView: {
      name: 'RouterView',
      setup(props, { slots }) {
        return () => {
          const slot = slots.default?.({ Component: defineComponent({ template: '<div>Mock Component</div>' }) })
          return slot
        }
      }
    }
  }
})

// Mock vue-toastification
vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
  ToastContainer: {
    name: 'ToastContainer',
    template: '<div><slot /></div>',
  },
}))

// Mock canvas
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
})) 
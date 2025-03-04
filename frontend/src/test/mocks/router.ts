import { vi } from 'vitest'

export const mockRouter = {
  push: vi.fn(),
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
  beforeResolve: vi.fn(),
  afterResolve: vi.fn(),
  onError: vi.fn(),
  onReady: vi.fn(),
  isReady: vi.fn(),
  currentRoute: {
    value: {
      name: 'onboarding',
      path: '/onboarding',
      meta: { requiresAuth: true },
      fullPath: '/onboarding',
    },
  },
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  createRouter: () => mockRouter,
  createWebHistory: vi.fn(),
})) 
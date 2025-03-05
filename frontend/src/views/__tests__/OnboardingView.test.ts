import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import OnboardingView from '../OnboardingView.vue'
import { useUIStore } from '@/stores/ui'

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView
    },
    {
      path: '/market',
      name: 'market',
      component: { template: '<div>Market View</div>' }
    }
  ]
})

// Mock router.push
vi.spyOn(router, 'push')

describe('OnboardingView', () => {
  let wrapper: any
  let uiStore: any
  let mockSetHasCompletedOnboarding: any

  beforeEach(() => {
    // Create a mock for setHasCompletedOnboarding
    mockSetHasCompletedOnboarding = vi.fn()

    // Mount the component with the testing pinia
    wrapper = mount(OnboardingView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ui: {
                hasCompletedOnboarding: false,
                isAuthenticated: true
              }
            }
          }),
          router
        ]
      }
    })

    // Get the store instance
    uiStore = useUIStore()
    // Mock the setHasCompletedOnboarding method
    vi.spyOn(uiStore, 'setHasCompletedOnboarding').mockImplementation(mockSetHasCompletedOnboarding)
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-test="onboarding-step"]').exists()).toBe(true)
  })
}) 
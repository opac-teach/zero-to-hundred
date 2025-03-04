import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingView from '../OnboardingView.vue'
import { createTestingPinia } from '@pinia/testing'
import '@/test/mocks/router'

describe('OnboardingView', () => {
  it('renders properly', () => {
    const wrapper = mount(OnboardingView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ui: {
                hasCompletedOnboarding: false,
              },
              user: {
                isAuthenticated: true,
              },
            },
          }),
        ],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
}) 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingView from '../OnboardingView.vue'
import { createTestingPinia } from '@pinia/testing'
import '@/test/mocks/router'

describe('OnboardingView', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(OnboardingView, {
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
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('shows all onboarding steps', () => {
    const steps = wrapper.findAll('[data-test="onboarding-step"]')
    expect(steps).toHaveLength(4) // Welcome, Tutorial, Balance, Guide
  })

  it('navigates to next step when clicking next button', async () => {
    const nextButton = wrapper.find('[data-test="next-button"]')
    await nextButton.trigger('click')
    expect(wrapper.vm.currentStep).toBe(1)
  })

  it('navigates to previous step when clicking back button', async () => {
    // First go to step 2
    await wrapper.vm.nextStep()
    const backButton = wrapper.find('[data-test="back-button"]')
    await backButton.trigger('click')
    expect(wrapper.vm.currentStep).toBe(0)
  })

  it('completes onboarding when reaching the last step', async () => {
    const uiStore = wrapper.vm.uiStore
    // Go to last step
    wrapper.vm.currentStep = 3
    const completeButton = wrapper.find('[data-test="complete-button"]')
    await completeButton.trigger('click')
    expect(uiStore.completeOnboarding).toHaveBeenCalled()
  })

  it('shows correct content for each step', () => {
    const steps = [
      'Welcome to Zero to Hundred',
      'How Trading Works',
      'Your Initial Balance',
      'Get Started'
    ]

    steps.forEach((title, index) => {
      wrapper.vm.currentStep = index
      expect(wrapper.text()).toContain(title)
    })
  })

  it('disables next button on last step', async () => {
    wrapper.vm.currentStep = 3
    const nextButton = wrapper.find('[data-test="next-button"]')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })
}) 
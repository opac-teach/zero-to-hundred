import { describe, it, expect } from 'vitest'
import LoginView from '../LoginView.vue'
import { createTestWrapper } from '../../../test/helpers'

describe('LoginView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(LoginView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
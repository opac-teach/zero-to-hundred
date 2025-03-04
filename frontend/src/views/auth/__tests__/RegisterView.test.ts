import { describe, it, expect } from 'vitest'
import RegisterView from '../RegisterView.vue'
import { createTestWrapper } from '../../../test/helpers'

describe('RegisterView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(RegisterView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
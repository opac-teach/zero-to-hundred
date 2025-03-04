import { describe, it, expect } from 'vitest'
import CreateMemecoinView from '../CreateMemecoinView.vue'
import { createTestWrapper } from '../../test/helpers'

describe('CreateMemecoinView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(CreateMemecoinView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
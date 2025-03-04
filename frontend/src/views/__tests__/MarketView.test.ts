import { describe, it, expect } from 'vitest'
import MarketView from '../MarketView.vue'
import { createTestWrapper } from '../../test/helpers'

describe('MarketView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(MarketView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
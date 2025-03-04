import { describe, it, expect } from 'vitest'
import LeaderboardView from '../LeaderboardView.vue'
import { createTestWrapper } from '../../test/helpers'

describe('LeaderboardView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(LeaderboardView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
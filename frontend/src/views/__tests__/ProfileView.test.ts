import { describe, it, expect } from 'vitest'
import ProfileView from '../ProfileView.vue'
import { createTestWrapper } from '../../test/helpers'

describe('ProfileView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(ProfileView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
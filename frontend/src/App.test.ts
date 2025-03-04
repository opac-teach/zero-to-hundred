import { describe, it, expect } from 'vitest'
import App from './App.vue'
import { createTestWrapper } from './test/helpers'

describe('App', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(App)
    expect(wrapper.exists()).toBe(true)
  })
}) 
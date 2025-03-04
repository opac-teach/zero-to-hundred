import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotFoundView from '../NotFoundView.vue'

describe('NotFoundView', () => {
  it('renders properly', () => {
    const wrapper = mount(NotFoundView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
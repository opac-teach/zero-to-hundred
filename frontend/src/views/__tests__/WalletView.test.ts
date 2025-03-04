import { describe, it, expect } from 'vitest'
import WalletView from '../WalletView.vue'
import { createTestWrapper } from '../../test/helpers'

describe('WalletView', () => {
  it('renders properly', () => {
    const wrapper = createTestWrapper(WalletView)
    expect(wrapper.exists()).toBe(true)
  })
}) 
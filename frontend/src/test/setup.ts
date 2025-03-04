import { vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { beforeAll } from 'vitest'

// Mock Chart.js
vi.mock('chart.js/auto', () => ({
  default: {
    Chart: vi.fn(),
    registerables: [],
    register: vi.fn(),
  },
}))

// Mock chartjs-chart-financial
vi.mock('chartjs-chart-financial', () => ({
  default: {},
}))

// Mock canvas
const mockCanvas = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  })),
  toDataURL: vi.fn(),
  width: 100,
  height: 100,
}

// Mock HTMLCanvasElement
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function(contextId: string) {
  if (contextId === '2d') {
    return mockCanvas.getContext() as any
  }
  return originalGetContext.call(this, contextId)
}

beforeAll(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
}) 
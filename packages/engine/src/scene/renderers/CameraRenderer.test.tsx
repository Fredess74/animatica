import { describe, it, expect, vi, afterEach } from 'vitest'
import { CameraRenderer } from './CameraRenderer'
import { CameraActor } from '../../types'

const { useHelperMock } = vi.hoisted(() => {
  return { useHelperMock: vi.fn() }
})

// Mock react to simulate useRef
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: {} }),
  }
})

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: 'PerspectiveCamera',
  useHelper: useHelperMock
}))

// Mock three
vi.mock('three', () => ({
  CameraHelper: class MockCameraHelper {}
}))

describe('CameraRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    useHelperMock.mockClear()
  })

  it('renders a PerspectiveCamera with correct props', () => {
    const actor: CameraActor = {
      id: 'cam1',
      name: 'Test Camera',
      type: 'camera',
      visible: true,
      transform: {
        position: [10, 20, 30],
        rotation: [0, 1.5, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 75,
        near: 0.1,
        far: 1000
      }
    }

    const result = CameraRenderer({ actor, isActive: true }) as any

    expect(result.type).toBe('PerspectiveCamera')
    expect(result.props.makeDefault).toBe(true)
    expect(result.props.position).toEqual([10, 20, 30])
    expect(result.props.rotation).toEqual([0, 1.5, 0])
    expect(result.props.fov).toBe(75)
    expect(result.props.near).toBe(0.1)
    expect(result.props.far).toBe(1000)
  })

  it('calls useHelper with CameraHelper when visible', () => {
    const actor: CameraActor = {
      id: 'cam2',
      name: 'Visible Camera',
      type: 'camera',
      visible: true,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: { fov: 60, near: 0.1, far: 500 }
    }

    CameraRenderer({ actor })

    expect(useHelperMock).toHaveBeenCalled()
    const [refArg, helperArg] = useHelperMock.mock.calls[0]
    expect(refArg).toBeDefined()
    expect(helperArg).toBeDefined()
  })

  it('calls useHelper with undefined when invisible', () => {
    const actor: CameraActor = {
      id: 'cam3',
      name: 'Invisible Camera',
      type: 'camera',
      visible: false,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: { fov: 60, near: 0.1, far: 500 }
    }

    CameraRenderer({ actor })

    expect(useHelperMock).toHaveBeenCalled()
    const [refArg] = useHelperMock.mock.calls[0]
    expect(refArg).toBeUndefined()
  })
})

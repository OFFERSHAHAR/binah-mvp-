export { useParallax, usePointerParallax } from './useParallax'
export { useZoomTransition, useScrollReveal } from './useZoomTransition'
export {
  useMotionValueWithConstraints,
  useScrollMotion,
  useMousePosition,
  useInViewport,
} from './useMotionValue'
export { useAppData } from './useAppData'
export type {
  Course,
  Lesson,
  Assignment,
  Grade,
  Message,
  User,
} from './useAppData'
// Real-time hooks
export { useWebSocket } from './useWebSocket'
export { useRealtimeMessages } from './useRealtimeMessages'
export { useRealtimeGrades } from './useRealtimeGrades'
export { useRealtimeAssignments } from './useRealtimeAssignments'
export { useDashboardRefresh } from './useDashboardRefresh'

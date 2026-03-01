import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion'

interface SwipeStatementProps {
  statement: string
  onResponse: (score: number) => void
  questionIndex: number
  totalQuestions: number
}

function vibrate(ms: number) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // Unsupported on some devices/browsers.
  }
}

function scoreFromOffset(offsetX: number): number {
  if (offsetX > 150) return 100
  if (offsetX >= 75) return 75
  if (offsetX < -150) return 0
  if (offsetX <= -75) return 25
  return 50
}

function hapticDuration(score: number): number {
  if (score === 100 || score === 0) return 16
  if (score === 75 || score === 25) return 10
  return 6
}

export default function SwipeStatement({
  statement,
  onResponse,
  questionIndex,
  totalQuestions,
}: SwipeStatementProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 0, 220], [-9, 0, 9])
  const bgColor = useTransform(
    x,
    [-220, -75, 0, 75, 220],
    [
      'rgba(239, 68, 68, 0.20)',
      'rgba(239, 68, 68, 0.10)',
      'rgba(255, 255, 255, 1)',
      'rgba(76, 175, 80, 0.10)',
      'rgba(76, 175, 80, 0.20)',
    ],
  )
  const borderColor = useTransform(
    x,
    [-220, 0, 220],
    ['rgba(239,68,68,0.35)', 'rgba(0,0,0,0.06)', 'rgba(76,175,80,0.35)'],
  )

  const respondedRef = useRef(false)
  const [leaving, setLeaving] = useState(false)
  const [exitX, setExitX] = useState(0)
  const [exitY, setExitY] = useState(0)

  function commitResponse(score: number) {
    if (respondedRef.current) return
    respondedRef.current = true
    setLeaving(true)

    if (score > 50) {
      setExitX(window.innerWidth * 0.95)
      setExitY(-8)
    } else if (score < 50) {
      setExitX(-window.innerWidth * 0.95)
      setExitY(-8)
    } else {
      setExitX(0)
      setExitY(-22)
    }

    vibrate(hapticDuration(score))
    window.setTimeout(() => onResponse(score), 220)
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (leaving) return
    const score = scoreFromOffset(info.offset.x)
    commitResponse(score)
  }

  const progress = Math.min(
    100,
    Math.max(0, (questionIndex / Math.max(totalQuestions, 1)) * 100),
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-5 py-8 flex flex-col">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">
            {questionIndex}/{totalQuestions}
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#4CAF50]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Swipe card */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          drag={leaving ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={onDragEnd}
          onTap={() => !leaving && commitResponse(50)}
          style={{ x, rotate, backgroundColor: bgColor, borderColor }}
          initial={{ y: 16, opacity: 0 }}
          animate={
            leaving
              ? { x: exitX, y: exitY, opacity: 0, scale: 0.96 }
              : { x: 0, y: 0, opacity: 1, scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="w-full rounded-3xl border shadow-sm p-8 min-h-[340px] flex items-center justify-center"
        >
          <p className="text-center text-[22px] leading-tight font-bold text-[#1B5E20]">
            {statement}
          </p>
        </motion.div>
      </div>

      {/* Direction hints */}
      <div className="mt-8 flex items-center justify-between text-sm font-medium">
        <span className="text-red-400">Pas du tout</span>
        <span className="text-gray-500">Moyen</span>
        <span className="text-[#4CAF50]">Totalement</span>
      </div>
    </div>
  )
}

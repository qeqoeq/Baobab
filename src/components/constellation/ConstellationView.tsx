import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { calculatePositions } from '../../lib/constellation'
import type { ContactWithScore } from '../../hooks/useContacts'
import type { RelationshipType } from '../../types'

interface ConstellationViewProps {
  contacts: ContactWithScore[]
  avatarEmoji: string
}

interface ViewportSize {
  width: number
  height: number
}

const RELATIONSHIP_EMOJI: Record<RelationshipType, string> = {
  best_friend: '💎',
  close_friend: '🫶',
  friend: '👋',
  family: '🏠',
  partner: '❤️',
  colleague: '💼',
  acquaintance: '🤝',
}

function scoreStrokeWidth(score10: number): number {
  const clamped = Math.max(0, Math.min(10, score10))
  return 1 + (clamped / 10) * 3
}

function ConstellationView({ contacts, avatarEmoji }: ConstellationViewProps) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<ViewportSize>({ width: 360, height: 640 })

  useEffect(() => {
    const element = rootRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const centerX = size.width / 2
  const centerY = size.height / 2
  const radius = Math.max(80, Math.min(size.width, size.height) * 0.42)

  const nodes = useMemo(
    () => calculatePositions(contacts, centerX, centerY, radius),
    [contacts, centerX, centerY, radius],
  )

  const stars = useMemo(() => {
    const count = 80
    return Array.from({ length: count }, (_, i) => {
      const x = ((i * 97) % 1000) / 1000
      const y = ((i * 193 + 137) % 1000) / 1000
      const r = ((i * 17) % 10) / 10
      return {
        x: x * size.width,
        y: y * size.height,
        radius: 0.7 + r * 1.2,
        opacity: 0.15 + r * 0.5,
      }
    })
  }, [size.width, size.height])

  return (
    <div ref={rootRef} className="relative w-full h-full overflow-hidden rounded-3xl">
      {/* Background */}
      <svg
        width={size.width}
        height={size.height}
        className="absolute inset-0"
        aria-hidden
      >
        <defs>
          <radialGradient id="baobab-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="55%" stopColor="#0b0f14" />
            <stop offset="100%" stopColor="#050608" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={size.width} height={size.height} fill="url(#baobab-bg)" />

        {stars.map((s, i) => (
          <circle
            key={`star-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.radius}
            fill="#ffffff"
            opacity={s.opacity}
          />
        ))}

        {/* Concentric orbit guides */}
        {[0.25, 0.45, 0.65, 0.95].map((factor, i) => (
          <circle
            key={`orbit-${i}`}
            cx={centerX}
            cy={centerY}
            r={radius * factor}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="4 8"
            strokeWidth="1"
          />
        ))}

        {/* Connection lines for evaluated contacts only */}
        {nodes
          .filter((n) => n.contact.latest_evaluation)
          .map((n) => {
            const score10 = n.contact.latest_evaluation?.global_score ?? 0
            return (
              <line
                key={`line-${n.contact.id}`}
                x1={centerX}
                y1={centerY}
                x2={n.x}
                y2={n.y}
                stroke={n.color}
                strokeOpacity={0.3}
                strokeWidth={scoreStrokeWidth(score10)}
              />
            )
          })}
      </svg>

      {/* Center user node */}
      <motion.div
        className="absolute z-20 flex items-center justify-center rounded-full"
        style={{
          width: 64,
          height: 64,
          left: centerX - 32,
          top: centerY - 32,
          background: 'linear-gradient(145deg, #4CAF50, #1B5E20)',
          boxShadow: '0 0 0 8px rgba(76, 175, 80, 0.18), 0 0 36px rgba(76,175,80,0.40)',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-[30px] leading-none">{avatarEmoji}</span>
      </motion.div>

      {/* Contacts */}
      {nodes.map((node, index) => {
        const emoji = RELATIONSHIP_EMOJI[node.contact.relationship_type]
        const fallbackInitial = node.contact.contact_name.charAt(0).toUpperCase()
        const labelY = node.y + node.size / 2 + 14
        return (
          <div key={node.contact.id} className="absolute inset-0 pointer-events-none">
            <motion.button
              onClick={() => navigate(`/contact/${node.contact.id}`)}
              className="absolute z-10 flex items-center justify-center rounded-full pointer-events-auto"
              style={{
                width: node.size,
                height: node.size,
                left: node.x - node.size / 2,
                top: node.y - node.size / 2,
                backgroundColor: node.color,
                opacity: node.opacity,
                boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
              }}
              animate={{ scale: [1, 1.045, 1] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: (index % 6) * 0.18,
              }}
              aria-label={`Voir le profil de ${node.contact.contact_name}`}
            >
              <span className="text-sm leading-none select-none">
                {emoji || fallbackInitial}
              </span>
            </motion.button>

            <p
              className="absolute z-10 text-[12px] text-white/80 text-center truncate px-1"
              style={{
                width: 96,
                left: node.x - 48,
                top: labelY,
              }}
            >
              {node.contact.contact_name}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default memo(ConstellationView)

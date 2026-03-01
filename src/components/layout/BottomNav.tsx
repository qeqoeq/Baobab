import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AddContactSheet from '../ui/AddContactSheet'

type Tab = 'gps' | 'relations' | 'add' | 'profile'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAddOpen, setIsAddOpen] = useState(false)

  const activeTab: Tab | null = (() => {
    if (location.pathname === '/') return 'gps'
    if (location.pathname.startsWith('/relations')) return 'relations'
    if (location.pathname.startsWith('/profile')) return 'profile'
    return null
  })()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-gray-200 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-md h-full grid grid-cols-4">
          <TabButton
            icon="🌐"
            label="GPS"
            active={activeTab === 'gps'}
            onClick={() => navigate('/')}
          />
          <TabButton
            icon="👥"
            label="Relations"
            active={activeTab === 'relations'}
            onClick={() => navigate('/relations')}
          />
          <TabButton
            icon="➕"
            label="Ajouter"
            active={false}
            onClick={() => setIsAddOpen(true)}
          />
          <TabButton
            icon="👤"
            label="Profil"
            active={activeTab === 'profile'}
            onClick={() => navigate('/profile')}
          />
        </div>
      </nav>

      <AddContactSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => {
          setIsAddOpen(false)
        }}
      />
    </>
  )
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-0.5"
    >
      <span
        className="text-[18px]"
        style={{ color: active ? '#4CAF50' : '#9E9E9E' }}
      >
        {icon}
      </span>
      <span
        className="text-[11px] font-medium"
        style={{ color: active ? '#4CAF50' : '#9E9E9E' }}
      >
        {label}
      </span>
      {active && (
        <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />
      )}
    </button>
  )
}

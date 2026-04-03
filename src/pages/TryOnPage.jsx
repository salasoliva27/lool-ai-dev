import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TryOn from '../components/TryOn'
import CatalogBar from '../components/CatalogBar'
import { useCatalog } from '../hooks/useCatalog'

export default function TryOnPage() {
  const { allFrames } = useCatalog()
  const [searchParams] = useSearchParams()
  const initialFrameId = searchParams.get('frame')
  const initialFrame = allFrames.find((f) => f.id === initialFrameId) ?? allFrames[0]

  const [selectedFrame, setSelectedFrame] = useState(initialFrame)
  const [isTryOnActive, setIsTryOnActive] = useState(false)

  function handleCartClick(frame) {
    console.log('[lool-ai] cart_click', {
      frame_id: frame.id,
      frame_name: frame.name,
      brand: frame.brand,
      store_url: frame.store_url,
      ts: new Date().toISOString(),
    })
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-5 pointer-events-none">
        <span className="text-white font-bold text-xl tracking-tight">lool.ai</span>
        <Link
          to="/portal"
          className="pointer-events-auto text-white/40 text-xs hover:text-white/70 transition-colors bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full"
        >
          Portal óptica →
        </Link>
      </div>

      {/* Hero — shown before camera activates */}
      {!isTryOnActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 pb-40">
          <p className="text-white/30 text-xs uppercase tracking-widest">Prueba virtual</p>
          <h1 className="text-white text-3xl sm:text-4xl font-bold text-center leading-tight">
            Pruébate armazones<br />en tiempo real
          </h1>
          <p className="text-white/40 text-sm text-center max-w-xs">
            Activa la cámara y elige un estilo del catálogo. Cambia entre armazones mientras te ves en vivo.
          </p>
          <button
            onClick={() => setIsTryOnActive(true)}
            className="mt-2 bg-white text-black font-bold px-8 py-4 rounded-2xl text-sm hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          >
            Activar cámara
          </button>
        </div>
      )}

      <TryOn selectedFrame={selectedFrame} isActive={isTryOnActive} />
      <CatalogBar
        frames={allFrames}
        selectedId={selectedFrame?.id}
        onSelect={setSelectedFrame}
        onProbar={() => setIsTryOnActive(true)}
        isTryOnActive={isTryOnActive}
        onCartClick={handleCartClick}
      />
    </div>
  )
}

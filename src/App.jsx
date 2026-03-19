import { useState } from 'react'
import TryOn from './components/TryOn'
import CatalogBar from './components/CatalogBar'
import catalog from './data/catalog.json'

export default function App() {
  const [selectedFrame, setSelectedFrame] = useState(catalog[0])
  const [isTryOnActive, setIsTryOnActive] = useState(false)

  function handleCartClick(frame) {
    // Attribution log — swap this for your analytics (GA4, Mixpanel, etc.)
    console.log('[lool-ai] cart_click', {
      frame_id: frame.id,
      frame_name: frame.name,
      brand: frame.brand,
      store_url: frame.store_url,
      ts: new Date().toISOString(),
    })
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {!isTryOnActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/30 text-sm">Selecciona un armazón y presiona Probar</p>
        </div>
      )}
      <TryOn selectedFrame={selectedFrame} isActive={isTryOnActive} />
      <CatalogBar
        frames={catalog}
        selectedId={selectedFrame?.id}
        onSelect={setSelectedFrame}
        onProbar={() => setIsTryOnActive(true)}
        isTryOnActive={isTryOnActive}
        onCartClick={handleCartClick}
      />
    </div>
  )
}

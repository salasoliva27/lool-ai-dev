function buildCartUrl(frame) {
  if (!frame?.store_url || frame.store_url.includes('example.com')) return null
  try {
    const url = new URL(frame.store_url)
    url.searchParams.set('utm_source', 'lool-ai')
    url.searchParams.set('utm_medium', 'widget')
    url.searchParams.set('utm_campaign', 'tryon')
    url.searchParams.set('utm_content', frame.id)
    return url.toString()
  } catch {
    return frame.store_url
  }
}

export default function CatalogBar({ frames, selectedId, onSelect, onProbar, isTryOnActive, onCartClick }) {
  const selectedFrame = frames.find((f) => f.id === selectedId)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Gradient fade behind the bar */}
      <div className="h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      <div className="bg-black/70 backdrop-blur-sm px-4 pt-3 pb-4">
        {/* Frame thumbnails */}
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                selectedId === frame.id
                  ? 'bg-white/20 ring-2 ring-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {/* White background so product photos and SVGs both render cleanly */}
              <div className="w-16 h-10 bg-white rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src={frame.image_url}
                  alt={frame.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white text-xs font-medium truncate w-16 text-center">
                {frame.name}
              </span>
              <span className="text-white/50 text-xs truncate w-16 text-center">
                {frame.brand}
              </span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        {selectedFrame && (
          <div className="flex gap-3">
            <button
              onClick={onProbar}
              disabled={isTryOnActive}
              className={`flex-1 font-semibold py-3 rounded-xl text-sm transition-all ${
                isTryOnActive
                  ? 'bg-white/20 text-white/60 cursor-default'
                  : 'bg-white text-black hover:bg-white/90 active:scale-95'
              }`}
            >
              {isTryOnActive ? '✓ Probando' : 'Probar'}
            </button>

            {buildCartUrl(selectedFrame) ? (
              <a
                href={buildCartUrl(selectedFrame)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onCartClick?.(selectedFrame)}
                className="flex-1 border border-white/40 text-white font-semibold py-3 rounded-xl text-sm text-center hover:bg-white/10 active:scale-95 transition-all"
              >
                Agregar al carrito →
              </a>
            ) : (
              <div className="flex-1 border border-white/20 text-white/30 font-semibold py-3 rounded-xl text-sm text-center">
                Sin tienda online
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

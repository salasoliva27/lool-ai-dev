import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import defaultCatalog from '../data/catalog.json'

const DEFAULT_IDS = new Set(defaultCatalog.map((f) => f.id))

export default function PortalPage() {
  const { allFrames, addFrame, removeFrame } = useCatalog()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', imageData: '' })
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  function readFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData((d) => ({ ...d, imageData: e.target.result }))
      setShowForm(true)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    readFile(e.dataTransfer.files[0])
  }

  function handleSave() {
    if (!formData.name.trim() || !formData.imageData) return
    addFrame({
      id: `frame-custom-${Date.now()}`,
      name: formData.name.trim(),
      brand: 'Mi catálogo',
      price_mxn: formData.price ? Number(formData.price) : null,
      image_url: formData.imageData,
      store_url: '',
      measurements: {
        frame_width_mm: 130,
        svg_viewbox_width: 1200,
        svg_viewbox_height: 400,
        frame_x_fraction: 0.82,
        blend_mode: 'multiply',
        y_offset_ratio: 0.2,
      },
    })
    setFormData({ name: '', price: '', imageData: '' })
    setShowForm(false)
  }

  function closeForm() {
    setFormData({ name: '', price: '', imageData: '' })
    setShowForm(false)
  }

  return (
    <div
      className="min-h-screen bg-[#f9f6f2] text-[#1a1a1a]"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Header */}
      <header className="bg-white border-b border-[#e8e2da] px-6 py-4 flex items-center gap-3">
        <span className="font-bold text-lg tracking-tight">lool.ai</span>
        <span className="text-[#d0cbc4]">/</span>
        <span className="text-sm text-[#888]">Portal de catálogo</span>
        <Link
          to="/"
          className="ml-auto text-sm text-[#666] hover:text-[#333] border border-[#e8e2da] px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Ver prueba virtual
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Upload drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !showForm && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-10 ${
            dragOver
              ? 'border-[#1a1a1a] bg-white'
              : 'border-[#d5cfc8] hover:border-[#aaa] bg-white/50 hover:bg-white/80'
          }`}
        >
          <div className="text-4xl mb-3">🕶️</div>
          <p className="font-semibold text-[#333] mb-1">
            Arrastra una foto de armazón aquí
          </p>
          <p className="text-sm text-[#aaa]">o haz clic para seleccionar archivo · JPG, PNG, WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => readFile(e.target.files[0])}
          />
        </div>

        {/* Add frame form — modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-bold text-lg mb-4">Agregar armazón</h3>
              {formData.imageData && (
                <div className="bg-[#f5f1ec] rounded-xl p-5 flex items-center justify-center mb-4">
                  <img
                    src={formData.imageData}
                    alt="preview"
                    className="max-h-28 max-w-full object-contain"
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 mb-5">
                <input
                  placeholder="Nombre del armazón *"
                  value={formData.name}
                  onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                  className="border border-[#e0dbd5] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#999] transition-colors"
                />
                <input
                  placeholder="Precio MXN (opcional)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((d) => ({ ...d, price: e.target.value }))}
                  className="border border-[#e0dbd5] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#999] transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeForm}
                  className="flex-1 border border-[#e0dbd5] rounded-xl py-3 text-sm font-medium text-[#666] hover:bg-[#f5f5f5] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name.trim()}
                  className="flex-1 bg-[#1a1a1a] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Catalog grid */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Catálogo
            <span className="ml-2 text-sm font-normal text-[#aaa]">{allFrames.length} armazones</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allFrames.map((frame) => (
              <div
                key={frame.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#ede8e1]"
              >
                {/* Frame image */}
                <div className="bg-[#f5f1ec] px-6 py-6 flex items-center justify-center">
                  <img
                    src={frame.image_url}
                    alt={frame.name}
                    className="h-16 max-w-full object-contain"
                  />
                </div>

                {/* Card body */}
                <div className="p-4">
                  {!DEFAULT_IDS.has(frame.id) && (
                    <span className="inline-block text-xs font-bold uppercase tracking-wide bg-[#e8f4e8] text-[#2a7a2a] px-2 py-0.5 rounded-full mb-2">
                      Tu catálogo
                    </span>
                  )}
                  <p className="font-semibold text-sm leading-tight mb-0.5">{frame.name}</p>
                  <p className="text-xs text-[#aaa] mb-3">
                    {frame.price_mxn
                      ? `$${frame.price_mxn.toLocaleString('es-MX')} MXN`
                      : frame.brand}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/?frame=${frame.id}`}
                      className="flex-1 text-center text-xs font-semibold bg-[#1a1a1a] text-white py-2 rounded-lg hover:bg-[#333] transition-colors"
                    >
                      Probar
                    </Link>
                    {!DEFAULT_IDS.has(frame.id) && (
                      <button
                        onClick={() => removeFrame(frame.id)}
                        className="w-8 flex items-center justify-center text-[#ccc] hover:text-red-400 border border-[#e0dbd5] rounded-lg transition-colors text-base leading-none"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-10 text-xs text-[#ccc]">
        Portal de catálogo · lool.ai — la cámara corre en el navegador del cliente, no se guarda ninguna imagen.
      </footer>
    </div>
  )
}

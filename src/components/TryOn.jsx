import { useRef, useEffect, useCallback, useState } from 'react'
import { useFaceMesh } from '../hooks/useFaceMesh'
import { drawGlasses } from '../utils/glassesRenderer'

const IMG_CACHE = {}

function getOrLoadImage(frame) {
  if (!IMG_CACHE[frame.id]) {
    const img = new Image()
    // Do NOT set crossOrigin for external CDN images (Zenni, Clearly) — their CDNs don't
    // send CORS headers, so setting crossOrigin would block the load entirely.
    // drawImage() onto a canvas works fine without it; we don't need canvas readback (toDataURL).
    img.src = frame.image_url
    IMG_CACHE[frame.id] = img
  }
  return IMG_CACHE[frame.id]
}

/**
 * Computes the source crop rectangle needed to simulate object-fit: cover
 * when drawing a video frame onto a canvas of different aspect ratio.
 */
function computeCoverCrop(videoW, videoH, canvasW, canvasH) {
  const videoAspect = videoW / videoH
  const canvasAspect = canvasW / canvasH
  let srcX, srcY, srcW, srcH

  if (videoAspect > canvasAspect) {
    // Video wider → crop left/right, height fills
    srcH = videoH
    srcW = videoH * canvasAspect
    srcX = (videoW - srcW) / 2
    srcY = 0
  } else {
    // Video taller → crop top/bottom, width fills
    srcW = videoW
    srcH = videoW / canvasAspect
    srcX = 0
    srcY = (videoH - srcH) / 2
  }

  return { srcX, srcY, srcW, srcH }
}

/**
 * Maps a normalized MediaPipe landmark to canvas pixel coordinates,
 * accounting for the cover-crop and horizontal mirror (selfie orientation).
 */
function landmarkToCanvas(normX, normY, videoW, videoH, srcX, srcY, srcW, srcH, canvasW, canvasH) {
  // Flip X to match the mirrored video draw
  const mirroredX = 1 - normX
  const cx = ((mirroredX * videoW) - srcX) / srcW * canvasW
  const cy = ((normY * videoH) - srcY) / srcH * canvasH
  return { x: cx, y: cy }
}

export default function TryOn({ selectedFrame, isActive }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const landmarksRef = useRef(null)
  const selectedFrameRef = useRef(selectedFrame)
  const smoothedIrisLeftRef = useRef(null)
  const smoothedIrisRightRef = useRef(null)
  const smoothedNoseRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  // Keep frame ref current for use inside rAF loop
  useEffect(() => {
    selectedFrameRef.current = selectedFrame
    if (selectedFrame) getOrLoadImage(selectedFrame)
  }, [selectedFrame])

  const handleResults = useCallback((results) => {
    landmarksRef.current = results.multiFaceLandmarks?.[0] ?? null
  }, [])

  const { processFrame } = useFaceMesh(videoRef, handleResults)

  // Sync canvas intrinsic size to its CSS display size so drawing coordinates
  // match 1:1 with the displayed pixels — no stretching or object-fit ambiguity.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
        const dpr = window.devicePixelRatio || 1
        canvas.width = canvas.clientWidth * dpr
        canvas.height = canvas.clientHeight * dpr
      }
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // Start camera only when isActive becomes true
  useEffect(() => {
    if (!isActive) return

    let stream
    setError(null)

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((s) => {
        stream = s
        const video = videoRef.current
        video.srcObject = s
        video.onloadedmetadata = () => {
          video.play()
          setReady(true)
        }
      })
      .catch((err) => {
        setError('No se pudo acceder a la cámara. Permite el acceso e intenta de nuevo.')
        console.error(err)
      })

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
      setReady(false)
    }
  }, [isActive])

  // Render loop: draws the mirrored video frame + glasses overlay onto the canvas.
  // Using a single canvas (instead of video + canvas overlay) ensures both the
  // video image and the glasses share the same pixel coordinate system.
  useEffect(() => {
    if (!ready) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current
    let lastProcessTime = 0

    const loop = async (timestamp) => {
      if (timestamp - lastProcessTime > 33) {
        lastProcessTime = timestamp
        await processFrame()
      }

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (video.readyState >= 2 && video.videoWidth > 0) {
        const { srcX, srcY, srcW, srcH } = computeCoverCrop(
          video.videoWidth, video.videoHeight, w, h
        )

        // Draw mirrored video frame (selfie orientation)
        ctx.save()
        ctx.translate(w, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, w, h)
        ctx.restore()

        // Draw glasses overlay
        const frame = selectedFrameRef.current
        const landmarks = landmarksRef.current
        if (frame && landmarks) {
          const l = landmarks[468] // left iris
          const r = landmarks[473] // right iris
          const nose = landmarks[168] // nose bridge — where the glasses arc sits
          if (l && r && nose) {
            const pxA = landmarkToCanvas(
              l.x, l.y, video.videoWidth, video.videoHeight,
              srcX, srcY, srcW, srcH, w, h
            )
            const pxB = landmarkToCanvas(
              r.x, r.y, video.videoWidth, video.videoHeight,
              srcX, srcY, srcW, srcH, w, h
            )
            const nosePx = landmarkToCanvas(
              nose.x, nose.y, video.videoWidth, video.videoHeight,
              srcX, srcY, srcW, srcH, w, h
            )
            const [irisLeft, irisRight] = pxA.x < pxB.x ? [pxA, pxB] : [pxB, pxA]

            // EMA smoothing — prevents glasses from shrinking during blinks
            const ALPHA = 0.3
            const ema = (prev, next) => prev
              ? { x: ALPHA * next.x + (1 - ALPHA) * prev.x, y: ALPHA * next.y + (1 - ALPHA) * prev.y }
              : { x: next.x, y: next.y }
            smoothedIrisLeftRef.current = ema(smoothedIrisLeftRef.current, irisLeft)
            smoothedIrisRightRef.current = ema(smoothedIrisRightRef.current, irisRight)
            smoothedNoseRef.current = ema(smoothedNoseRef.current, nosePx)

            const img = getOrLoadImage(frame)
            drawGlasses(ctx, img, smoothedIrisLeftRef.current, smoothedIrisRightRef.current, smoothedNoseRef.current, frame.measurements)
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [ready, processFrame])

  if (!isActive) return null

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <p className="text-white text-center px-8 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Video is a hidden data source only — no longer rendered visually */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white text-sm">Iniciando cámara...</p>
        </div>
      )}
    </>
  )
}

import { useEffect, useRef, useCallback } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'

/**
 * Initializes MediaPipe FaceMesh and exposes a processFrame function.
 * WASM files are loaded from CDN to avoid bundler configuration overhead.
 *
 * @param {React.RefObject} videoRef - Ref to the video element
 * @param {Function} onResults - Called each frame with landmark data
 */
export function useFaceMesh(videoRef, onResults) {
  const faceMeshRef = useRef(null)
  const onResultsRef = useRef(onResults)

  // Keep callback ref current without re-initializing FaceMesh
  useEffect(() => {
    onResultsRef.current = onResults
  }, [onResults])

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // Required for iris landmarks 468 and 473
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults((results) => onResultsRef.current(results))
    faceMeshRef.current = faceMesh

    return () => {
      faceMesh.close()
    }
  }, [])

  const processFrame = useCallback(async () => {
    if (
      faceMeshRef.current &&
      videoRef.current &&
      videoRef.current.readyState >= 2
    ) {
      await faceMeshRef.current.send({ image: videoRef.current })
    }
  }, [videoRef])

  return { processFrame }
}

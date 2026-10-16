import { toIsbn13 } from '@memory-book/shared'
import { BarcodeDetector, setZXingModuleOverrides } from 'barcode-detector/ponyfill'
import { type RefObject, useEffect, useRef, useState } from 'react'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

// wasm отдаём со своего домена, а не с CDN по умолчанию
setZXingModuleOverrides({
  locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path),
})

const SCAN_INTERVAL_MS = 250

export type ScannerState = 'starting' | 'scanning' | 'denied' | 'unsupported'

/** Включает заднюю камеру в <video> и ищет EAN-13 штрихкод книги (ISBN 978/979). */
export function useBarcodeScanner(
  videoRef: RefObject<HTMLVideoElement | null>,
  onDetected: (isbn13: string) => void,
  enabled: boolean,
): ScannerState {
  const [state, setState] = useState<ScannerState>('starting')
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  useEffect(() => {
    if (!enabled) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      return
    }

    let stream: MediaStream | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    const detector = new BarcodeDetector({ formats: ['ean_13'] })

    const scan = async () => {
      const video = videoRef.current
      if (cancelled || !video) return
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        const codes = await detector.detect(video).catch(() => [])
        const isbn = codes
          .map((code) => code.rawValue)
          .filter((raw) => /^97[89]/.test(raw))
          .map(toIsbn13)
          .find((value) => value !== null)
        if (isbn && !cancelled) {
          onDetectedRef.current(isbn)
          return
        }
      }
      timer = setTimeout(scan, SCAN_INTERVAL_MS)
    }

    setState('starting')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(async (mediaStream) => {
        stream = mediaStream
        const video = videoRef.current
        if (cancelled || !video) return
        video.srcObject = mediaStream
        await video.play()
        setState('scanning')
        scan()
      })
      .catch(() => !cancelled && setState('denied'))

    return () => {
      cancelled = true
      clearTimeout(timer)
      for (const track of stream?.getTracks() ?? []) track.stop()
    }
  }, [enabled, videoRef])

  return state
}

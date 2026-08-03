'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

export default function SignaturePad({
  onSign,
  onClear,
  width = 350,
  height = 150,
}: {
  onSign: (dataUrl: string) => void
  onClear: () => void
  width?: number
  height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const hasInk = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [width, height])

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }, [getPos])

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    hasInk.current = true
  }, [isDrawing, getPos])

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const { data } = ctx.getImageData(0, 0, width, height)
    let ink = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) {
        ink++
        if (ink > 20) break
      }
    }
    if (!hasInk.current && ink <= 20) {
      onClear()
      return
    }
    hasInk.current = false
    setHasDrawn(true)
    onSign(canvas.toDataURL('image/png'))
  }, [isDrawing, onSign, onClear, width, height])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    hasInk.current = false
    setHasDrawn(false)
    onClear()
  }, [width, height, onClear])

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        onPointerCancel={stopDrawing}
        className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-white cursor-crosshair touch-none"
        style={{ aspectRatio: `${width}/${height}` }}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {hasDrawn ? 'Assinatura capturada' : 'Assine usando o mouse ou dedo na caixa acima'}
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
        >
          Limpar
        </button>
      </div>
    </div>
  )
}

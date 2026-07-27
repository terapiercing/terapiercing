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

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }, [getPos])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [isDrawing, getPos])

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    setHasDrawn(true)
    const canvas = canvasRef.current!
    onSign(canvas.toDataURL('image/png'))
  }, [isDrawing, onSign])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    setHasDrawn(false)
    onClear()
  }, [width, height, onClear])

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
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

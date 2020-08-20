import { useEffect, useRef } from 'react'
import { CanvasComponentProps } from './Canvas'

export const useCanvas = (props: CanvasComponentProps) => {
  const { draw, setup } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    let frameCount = 0
    let animationFrameId: number

    if (setup) setup(ctx)

    const render = () => {
      draw(ctx, frameCount++)
      animationFrameId = window.requestAnimationFrame(render)
    }

    render()

    const cleanup = () => {
      window.cancelAnimationFrame(animationFrameId)
    }

    return cleanup
  }, [draw, setup])

  return canvasRef
}

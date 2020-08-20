import React, { CanvasHTMLAttributes, DetailedHTMLProps } from 'react'
import { useCanvas } from './useCanvas'

export const Canvas = (props: CanvasProps) => {
  const { draw, setup, ...rest } = props
  const canvasRef = useCanvas({ draw, setup })

  return <canvas ref={canvasRef} {...rest} />
}

type CanvasNativeProps = DetailedHTMLProps<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
>

export interface CanvasComponentProps {
  draw: (context: CanvasRenderingContext2D, frameCount: number) => void
  setup?: (context: CanvasRenderingContext2D) => void
}

export interface CanvasProps extends CanvasNativeProps, CanvasComponentProps {}

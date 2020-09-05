import React, { DetailedHTMLProps, SVGAttributes } from 'react'
import { useSvg } from './useSvg'

export const Svg = (props: SvgProps) => {
  const {
    done = false,
    draw,
    setup,
    width = 100,
    height = 100,
    background,
    children,
    ...rest
  } = props
  const svgRef = useSvg({ draw, setup, done })
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      ref={svgRef}
      {...rest}
    >
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        style={{ fill: background }}
      />
      {children}
    </svg>
  )
}

type SvgNativeProps = DetailedHTMLProps<
  SVGAttributes<SVGSVGElement>,
  SVGSVGElement
>

export interface SvgComponentProps {
  done: boolean
  draw: (frameCount: number) => void
  setup?: () => void
}

export interface SvgProps extends SvgNativeProps, SvgComponentProps {
  background: string
}

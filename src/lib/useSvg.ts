import { useEffect, useRef, useState } from 'react'
import { SvgComponentProps } from './Svg'

export const useSvg = (props: SvgComponentProps) => {
  const { done, draw, setup } = props
  const svgRef = useRef<SVGSVGElement>(null)
  const [, setId] = useState(0)

  useEffect(() => {
    let frameCount = 0

    if (setup) setup()

    const render = () => {
      draw(frameCount++)
      setId(window.requestAnimationFrame(render))
    }

    render()
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  return svgRef
}

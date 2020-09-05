import { useEffect, useRef } from 'react'
import { SvgComponentProps } from './Svg'

export const useSvg = (props: SvgComponentProps) => {
  const { done, draw, setup } = props
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let frameCount = 0

    if (setup) setup()

    let id = 0
    const render = () => {
      if (!done) {
        draw(frameCount++)
        id = window.requestAnimationFrame(render)
      }
    }

    render()
    return () => {
      console.log('done')
      window.cancelAnimationFrame(id)
    }
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  return svgRef
}

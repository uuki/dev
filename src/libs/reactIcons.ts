import { IconType, GenIcon } from 'react-icons/lib'
import { createIconTreeFromSVG } from 'react-icons-converter'
// @ts-ignore
import { renderToStaticMarkup } from 'react-dom/server'

export const genIconFromSVG = (source: string) => {
  const iconTree = createIconTreeFromSVG(source, false)
  return {
    [iconTree.tag]: GenIcon(iconTree),
  }
}

export type GenInlineFromIconProps = {
  icon: IconType
  props?: any
}

export const genInlineFromIcon = ({ icon, props = {} }: GenInlineFromIconProps): string => {
  const svgString = renderToStaticMarkup(icon({}))
  return `data:image/svg+xml, ${svgString}`
}

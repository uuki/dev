import type { PostOrigin } from '#/post'
import Image from 'next/image'
import configOrigin from '@/config/origin.yml'
// import { genInlineFromIcon } from '@/libs/reactIcons'

export type OriginProps = PostOrigin & {
  name?: string
}

const BadgeOrigin = ({ name, logo, url }: PostOrigin) => {
  const data: OriginProps = configOrigin[name || 'uuki']

  return (
    <div className="flex items-center font-bold text-[12px]">
      {data.logo && <Image src={data.logo} width={16} height={16} alt={`${data.name} logo`} />}
      <span className="ml-[8px] first:ml-0 text-[0.85rem]">{data.name}</span>
    </div>
  )
}

export { BadgeOrigin }

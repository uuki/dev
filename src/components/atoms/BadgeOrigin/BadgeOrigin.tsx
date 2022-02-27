import Image from 'next/image'
import configOrigin from '@/config/origin.yml'
import { PostOrigin } from '@/types/Post'
// import { genInlineFromIcon } from '@/libs/reactIcons'
// import sourceIconHatena from '../../public/icons/hatena.svg'

export type OriginProps = PostOrigin & {
  name?: string
}

const BadgeOrigin = ({ name, logo, url }: PostOrigin) => {
  const data: OriginProps = configOrigin[name || 'uuki']

  return (
    <div className="flex items-center font-bold text-[12px]">
      {data.logo && <Image src={data.logo} width={12} height={12} alt={`${data.name} logo`} />}
      <span className="ml-[8px] first:ml-0 text-[0.75rem]">{data.name}</span>
    </div>
  )
}

export { BadgeOrigin }

import Image from 'next/image'
// import configManage from '@/config/manage'

export type MDXImageProps = {
  src?: string
  alt?: string
}

const MDXImage = ({ alt, src }: MDXImageProps) => {
  return (
    <span>
      <Image src={require(`@/data/images/${src}`)} alt={alt} />
    </span>
  )
}

export default MDXImage

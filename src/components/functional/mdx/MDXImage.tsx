import Image from 'next/image'
// import config from '@/config/manage'

export type MDXImageProps = {
  src?: string
  alt?: string
}

const MDXImage = ({ alt, src }: MDXImageProps) => {
  return (
    <span className="image-container shadow-media">
      <Image src={require(`/public/${src?.replace(/^\//, '')}`)} alt={alt} className="rounded-md" />
    </span>
  )
}

export default MDXImage

import Image from 'next/image'

const SiteLogo = () => {
  return (
    <a href="/" className="flex items-center link-opacity">
      <Image src="/images/logo.jpg" width={20} height={20} alt="avatar" className="rounded-full" />
      <span className="ml-[10px] font-bold text-md">uuki.dev</span>
    </a>
  )
}

export { SiteLogo }

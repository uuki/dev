import Image from 'next/image'

const Author = () => {
  return (
    <div className="flex items-center">
      <Image src="/images/logo.jpg" width={60} height={60} alt="avatar" className="rounded-full" />
      <div className="ml-[15px] tracking-[0.02em]">
        <p className="text-[1.75rem] font-[600] leading-[1]">uuki</p>
        <p className="text-[0.6875rem] font-bold mt-[3px]">Frontend developer</p>
      </div>
    </div>
  )
}

export { Author }

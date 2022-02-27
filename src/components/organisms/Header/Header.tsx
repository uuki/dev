import { memo } from 'react'
import { SiteLogo } from '@/components/atoms/SiteLogo'
import { Gnav } from '@/components/molecules/Gnav'

const Header = memo(() => {
  return (
    <header className="flex items-center justify-between min-h-[60px] text-white bg-navy-600 px-content">
      <SiteLogo />
      <Gnav />
    </header>
  )
})

export { Header }

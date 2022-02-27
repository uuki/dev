import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'

type ContainerLayoutProps = {
  children: React.ReactNode
}

const ContainerLayout = ({ children }: ContainerLayoutProps) => {
  return (
    <div className="flex-container bg-bg">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export { ContainerLayout }

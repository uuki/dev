import { InferGetStaticPropsType, GetStaticPropsContext } from 'next'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { PageHeader } from '@/components/atoms/PageHeader'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import { Link } from '@/components/atoms/Link'

export async function getStaticProps(context: GetStaticPropsContext) {
  return { props: { page: {} } }
}
type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function Custom404({ page }: Props) {
  return (
    <>
      <MetaBasic title="404 Not Found" />
      <div className="flex-container bg-bg">
        <Header />
        <main className="flex items-center justify-center">
          <div className="">
            <div className="px-content-narrow">
              <div className="mb-[23px]">
                <PageHeader>404 Not Found</PageHeader>

                <div className="mt-[40px] text-center">
                  <Link href="/" className="link-in-out">
                    トップへ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

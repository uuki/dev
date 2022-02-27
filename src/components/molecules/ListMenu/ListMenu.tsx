import { Link } from '@/components/atoms/Link'

const ListMenu = () => {
  const data = [
    {
      path: '/privacy',
      name: 'Privacy Policy',
    },
  ]

  return (
    <ul className="flex flex-wrap justify-center">
      {data.map((it) => (
        <li key={it.name} className="ml-[20px] first:ml-0">
          <Link href={it.path} className="link-in-out-white text-[0.875rem]">
            {it.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { ListMenu }

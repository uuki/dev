import { Link } from '@/components/atoms/Link'

const Gnav = () => {
  const data = [
    {
      path: '/blog',
      name: 'Blog',
    },
    {
      path: '/tags',
      name: 'Tags',
    },
    {
      path: '/about',
      name: 'About',
    },
  ]

  return (
    <nav>
      <ul className="flex items-center">
        {data.map((it) => (
          <li key={it.name} className="ml-[20px] first:ml-0">
            <Link href={it.path} className="font-bold md:text-md sm:text-[0.875rem] link-in-out-white">
              {it.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { Gnav }

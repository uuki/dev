import { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonNavProps = {
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const ButtonNav = ({ children, type = 'button', ...rest }: ButtonNavProps) => {
  return (
    <button
      type={type}
      {...rest}
      className={`min-w-[90px] h-[34px] px-[15px] rounded-[4px] text-[0.875rem] font-bold text-white bg-black-800${
        rest.className ? ` ${rest.className}` : ''
      }`}
    >
      {children}
    </button>
  )
}
export { ButtonNav }

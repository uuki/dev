import { InputHTMLAttributes } from 'react'

type InputTextProps = {} & InputHTMLAttributes<HTMLInputElement>

const InputText = ({ ...rest }: InputTextProps) => {
  return (
    <input
      type="text"
      {...rest}
      className={`h-[40px] px-[15px] text-[#9faab5] rounded-sm border border-transparent bg-[#e4eaed]${
        rest.className ? ` ${rest.className}` : ''
      }`}
    />
  )
}

export { InputText }

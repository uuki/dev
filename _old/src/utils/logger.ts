import { format } from 'date-fns'

type LogOptions = {
  tags?: string[]
  color?: 'green' | 'red' | 'yellow'
  bg?: 'bgGreen' | 'bgRed' | 'bgYellow'
}

/**
 * @doc https://developer.mozilla.org/ja/docs/Web/API/console
 */
class gracer {
  static style(strArr: string[], style: string[]) {
    return [`%c${strArr.join(' %c')}`, ...style]
  }
}

function output(label: string, msg: any, { tags = [], color = 'green' }: LogOptions) {
  const timestamp = format(new Date(), 'HH:mm:ss')
  const tagStyle = {
    green: ['font-weight: bold; color: green;', 'font-weight: bold;'],
    red: ['font-weight: bold; color: red;', 'font-weight: bold;'],
    yellow: ['font-weight: bold; color: yellow;', 'font-weight: bold;'],
  }[color]

  console.log(...gracer.style([`[${label}]`, `${timestamp} [${tags.join('] [')}]`], tagStyle), msg)
}

export class Logger {
  static log(msg: any, { tags = [] }: LogOptions) {
    output('LOG', msg, {
      tags,
      color: 'green',
      bg: 'bgGreen',
    })
  }

  static error(msg: any, { tags = [] }: LogOptions) {
    output('ERROR', msg, {
      tags,
      color: 'red',
      bg: 'bgRed',
    })
  }

  static warn(msg: any, { tags = [] }: LogOptions) {
    output('WARN', msg, {
      tags,
      color: 'yellow',
      bg: 'bgYellow',
    })
  }
}

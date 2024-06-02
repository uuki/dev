import fs from 'fs'
import path from 'path'
// import { type CanvasRenderingContext2D } from 'canvas';
// import { createCanvas, registerFont, loadImage } from 'canvas';
// import { fillTextWithTwemoji } from 'node-canvas-with-twemoji'
import { createCanvas, loadImage } from '@napi-rs/canvas';

const cwd = process.cwd()
const options = {
  canvasWidth: 600,
  canvasHeight: 315,
  font: {
    path: '/public/static/fonts/NotoSansJP-Bold.otf',
    family: 'NotoSansJP',
  },
  text: {
    fontSize: 32,
    lineHeight: 42,
    color: '#3a3d3d',
  },
  baseImagePath: '/public/static/images/og-image.png',
  textWrap: {
    width: 480,
    maxLine: 6,
  },
}

export const splitLines = (ctx: any, words: string[], maxWidth: number) => {
  const line: string[] = ['']
  for (const [i, word] of Object.entries(words)) {
    const current = line.length - 1
    const metrics = ctx.measureText(line[current] + word)
    if (metrics.width > maxWidth && Number(i) > 0) {
      line.push(word)
    } else {
      line[current] = line[current] + word
    }
  }
  return line
}

export const generateOgImage = async (title: string): Promise<Buffer> => {
  const { canvasWidth, canvasHeight, font, text, baseImagePath, textWrap } = options
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')
  const fontFamily = path.join(cwd, font.path)
  const imagePath = path.join(cwd, baseImagePath)
  const words = decodeURIComponent(title).split('')

  // const x = canvasWidth / 2
  // const y = canvasHeight / 2
  const x = (canvasWidth - textWrap.width) / 2
  const y = text.lineHeight * 2

  const image = await loadImage(fs.readFileSync(imagePath))

  // registerFont(fontFamily, { family: font.family })

  ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight)
  ctx.font = `${text.fontSize}px "${font.family}"`
  ctx.fillStyle = text.color
  // ctx.textAlign = 'center'
  // ctx.textBaseline = 'middle'

  const lines = splitLines(ctx, words, textWrap.width)

  // for await (const [i, sentence] of Object.entries(lines)) {
  //   if (Number(i) < textWrap.maxLine) {
  //     fillTextWithTwemoji(ctx, sentence, x, text.lineHeight * Number(i) + y)
  //   }
  // }

  return canvas.toBuffer('image/png')
}

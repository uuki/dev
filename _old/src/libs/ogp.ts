import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

const cwd = process.cwd()
const options = {
  canvasWidth: 600,
  canvasHeight: 315,
  font: {
    path: '/static/fonts/NotoSansJP-Bold.otf',
    family: 'NotoSansJP',
  },
  text: {
    fontSize: 32,
    lineHeight: 42,
    color: '#3a3d3d',
  },
  baseImagePath: '/static/images/og-image.png',
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

  // フォントファイルの読み込み
  const fontPath = path.join(cwd, 'public', font.path)
  if (fs.existsSync(fontPath)) {
    try {
      GlobalFonts.registerFromPath(fontPath, font.family)
    } catch (error) {
      console.warn('フォントの読み込みに失敗しました:', error)
    }
  }

  // 背景画像の読み込み
  const imagePath = path.join(cwd, 'public', baseImagePath)
  let image: any

  try {
    const imageBuffer = fs.readFileSync(imagePath)
    image = await loadImage(imageBuffer)
  } catch (error) {
    console.warn('背景画像の読み込みに失敗しました:', error)
    // 背景色でフォールバック
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  if (image) {
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight)
  }

  // テキストの設定
  ctx.font = `${text.fontSize}px "${font.family}", sans-serif`
  ctx.fillStyle = text.color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // タイトルテキストの描画
  if (title) {
    const decodedTitle = decodeURIComponent(title)
    const words = decodedTitle.split('')
    const lines = splitLines(ctx, words, textWrap.width)

    const x = (canvasWidth - textWrap.width) / 2
    const y = text.lineHeight * 2

    lines.forEach((line, i) => {
      if (i < textWrap.maxLine) {
        ctx.fillText(line, x, text.lineHeight * i + y)
      }
    })
  }

  return canvas.toBuffer('image/png')
}

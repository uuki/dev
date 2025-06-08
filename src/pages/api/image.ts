import fs from 'fs'
import { resolve } from 'path'
import { generateOgImage } from '@/libs/ogp'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=86400') // 24時間キャッシュ

  const title = (req.query?.title as string) || 'uuki.dev'

  try {
    try {
      const img = await generateOgImage(title)
      res.end(img)
      return
    } catch (advancedError) {
      return
    }
  } catch (err) {
    console.error(err)
    // 静的フォールバック画像を返す
    try {
      const fallbackPath = resolve(process.cwd(), 'public/static/images/site-image.png')
      if (fs.existsSync(fallbackPath)) {
        const siteImg = fs.readFileSync(fallbackPath)
        console.log('静的フォールバック画像使用:', fallbackPath)
        res.end(siteImg)
      } else {
        const { createCanvas } = await import('@napi-rs/canvas')
        const canvas = createCanvas(600, 315)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 600, 315)
        ctx.fillStyle = '#333333'
        ctx.font = '32px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(title || 'uuki.dev', 300, 157)

        res.end(canvas.toBuffer('image/png'))
      }
    } catch (fallbackErr) {
      console.error(fallbackErr)
      res.status(500).json({ error: 'Error generating image' })
    }
  }
}

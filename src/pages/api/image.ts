import fs from 'fs'
import { resolve } from 'path'
import { generateOgImage } from '@/libs/ogp'
const cwd = process.cwd()

export default async (req: any, res: any) => {
  res.setHeader('Content-Type', 'image/png')

  try {
    const img = await generateOgImage(req.query?.title || '')
    res.end(img)
  } catch (err) {
    const filePath = resolve(cwd, 'public/static/images/site-image.png')
    const siteImg = fs.readFileSync(filePath)
    res.end(siteImg)
  }
}

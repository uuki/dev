import fs from 'fs'
import path from 'path'
import { root } from '@/utils/files'
import configManage from '@/config/manage'
import { exec } from 'child_process'
import { promisify } from 'util'
import { PostRevision } from '@/types/Post'

type GetFileRevisionProps = {
  slug: string
  limit?: number
}

export const getFileRevision = async ({ slug, limit = 0 }: GetFileRevisionProps): Promise<PostRevision[]> => {
  const file = path.join(root, configManage.contents_path, slug)
  if (/\.DS_Store$/.test(file)) {
    return []
  }
  const filePath = fs.existsSync(`${file}.mdx`) ? `${file}.mdx` : `${file}.md`
  const childProcessExec = promisify(exec)

  /**
   * @doc https://git-scm.com/docs/pretty-formats#_pretty_formats
   */
  const { stdout, stderr } = await childProcessExec(
    `git log ${limit ? `-${limit}` : ''} --pretty=format:"[%h,%ad]" --no-merges ${filePath}`
    // `git log ${limit ? `-${limit}` : ''} --pretty=format:"[%h,%ad]" --no-merges package.json`
  )
  const parseRevs = JSON.parse(
    `[${stdout ? stdout.replace(/\[(.*)\,(.*)\]/g, '["$1", "$2"]').replace('\n', ',') : ''}]`
  ).filter(Boolean)
  const formatRevs = parseRevs.reduce((acc: PostRevision[], cur: string[]) => {
    acc.push({
      hash: cur[0],
      authorDate: cur[1],
    })
    return acc
  }, [])

  return formatRevs
}

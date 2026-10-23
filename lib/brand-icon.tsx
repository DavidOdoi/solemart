import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

/** Next.js prerenders correctly sized icons from the supplied shoe mark. */
export async function createBrandIcon(edge: number) {
  const mark = await readFile(join(process.cwd(), 'assets', 'solemart-mark.png'))
  return new ImageResponse(
    <div style={{ width: edge, height: edge, display: 'flex', backgroundColor: '#fff' }}>
      <img src={`data:image/png;base64,${mark.toString('base64')}`} width={edge} height={edge} alt="" />
    </div>,
    { width: edge, height: edge },
  )
}

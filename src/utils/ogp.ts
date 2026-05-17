import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { ReactNode } from 'react';

const WIDTH = 1200;
const HEIGHT = 630;

let _font: Buffer | undefined;
let _bgDataUrl: string | undefined;

const getFont = (): Buffer => {
  if (!_font) {
    _font = fs.readFileSync(path.resolve('./public/fonts/NotoSansJP-Bold.otf'));
  }
  return _font;
};

const getBgDataUrl = (): string => {
  if (!_bgDataUrl) {
    const buf = fs.readFileSync(path.resolve('./public/images/og-image.png'));
    _bgDataUrl = `data:image/png;base64,${buf.toString('base64')}`;
  }
  return _bgDataUrl;
};

export const generateOgImage = async (title: string): Promise<Uint8Array> => {
  const element = {
    type: 'div',
    key: null,
    props: {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url("${getBgDataUrl()}")`,
        backgroundSize: '100% 100%',
        padding: '80px 110px',
      },
      children: {
        type: 'div',
        key: null,
        props: {
          style: {
            maxWidth: '1080px',
            fontSize: 52,
            fontWeight: 700,
            color: '#f3f4f6',
            lineHeight: 64 / 52,
            letterSpacing: '0.03em',
            display: '-webkit-box',
            '-webkit-line-clamp': 3,
            '-webkit-box-orient': 'vertical',
            'word-break': 'break-word',
            overflow: 'hidden',
          },
          children: title,
        },
      },
    },
  } as unknown as ReactNode;

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'NotoSansJP',
        data: getFont(),
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  return resvg.render().asPng();
};

import sanitizeHTML from 'sanitize-html';
import { type Result, ok, err } from '../result';

// ---------------------------------------------------------------------------
// Common attributes applied to every allowed tag
// ---------------------------------------------------------------------------

const COMMON_ATTRS: string[] = ['class', 'id', 'lang', 'dir', 'style', 'aria-*', 'data-*'];

// ---------------------------------------------------------------------------
// Tag dictionary
// Keys → allowedTags, Values → tag-specific attrs merged with COMMON_ATTRS
// ---------------------------------------------------------------------------

const TAG_DICT: Record<string, string[]> = {
  // Headings
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],

  // Sectioning
  article:    [],
  aside:      [],
  footer:     [],
  header:     [],
  main:       [],
  nav:        [],
  search:     [],
  hgroup:     [],
  address:    [],

  // Block / flow
  p:          [],
  blockquote: [],
  pre:        [],
  hr:         [],
  div:        [],
  section:    [],
  figure:     [],
  figcaption: [],

  // Interactive
  details:    ['open'],
  summary:    [],

  // Lists
  ul: [],
  ol: ['type', 'start', 'reversed'],
  li: ['value'],
  dl: [], dt: [], dd: [],

  // Table
  table:    [],
  caption:  [],
  colgroup: ['span'],
  col:      ['span'],
  thead:    [],
  tbody:    [],
  tfoot:    [],
  tr:       [],
  th:       ['scope', 'colspan', 'rowspan', 'headers'],
  td:       ['colspan', 'rowspan', 'headers'],

  // Phrasing — inline semantic
  a:      ['href', 'name', 'target', 'rel'],
  abbr:   ['title'],
  b:      [],
  bdi:    [],
  bdo:    [],
  br:     [],
  cite:   [],
  code:   [],
  data:   ['value'],
  del:    ['cite', 'datetime'],
  dfn:    ['title'],
  em:     [],
  i:      [],
  ins:    ['cite', 'datetime'],
  kbd:    [],
  mark:   [],
  q:      ['cite'],
  rp:     [],
  rt:     [],
  ruby:   [],
  s:      [],
  samp:   [],
  small:  [],
  span:   [],
  strong: [],
  sub:    [],
  sup:    [],
  time:   ['datetime'],
  u:      [],
  var:    [],
  wbr:    [],

  // Embedded
  img:     ['src', 'alt', 'srcset', 'sizes', 'width', 'height', 'loading', 'decoding'],
  picture: [],
  source:  ['media', 'srcset', 'type', 'sizes', 'src'],
  iframe:  ['src', 'title', 'width', 'height', 'allowfullscreen', 'loading', 'referrerpolicy'],
  audio:   ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'crossorigin'],
  video:   ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'width', 'height', 'poster', 'playsinline', 'crossorigin'],
};

// ---------------------------------------------------------------------------
// Config — derived from TAG_DICT
// ---------------------------------------------------------------------------

const SANITIZE_OPTIONS: sanitizeHTML.IOptions = {
  allowedTags: Object.keys(TAG_DICT),
  allowedAttributes: {
    '*': ['data-astro-*'],
    ...Object.fromEntries(
      Object.entries(TAG_DICT).map(([tag, extra]) => [
        tag,
        [...COMMON_ATTRS, ...extra],
      ])
    ),
  },
  selfClosing: ['br', 'col', 'hr', 'img', 'source', 'wbr'],
  allowedIframeHostnames: ['www.youtube.com'],
  allowedSchemes: ['data', 'http', 'https'],
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export function sanitize(dirty: string): Result<string, string> {
  try {
    return ok(sanitizeHTML(dirty, SANITIZE_OPTIONS));
  } catch (e) {
    return err(e instanceof Error ? e.message : 'sanitize failed');
  }
}

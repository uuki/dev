// App.tsx
import { useState, useMemo, useCallback } from 'react';
import {
  generatePalette,
  mapTokens,
  checkAndAdjustContrast,
  type ScaleName,
  type ScaleInput,
  type PaletteScale,
  type ContrastResult,
  type TokenMap,
} from './palette';
import { generateCss } from './css';
import { hexToOklch } from './color';

// ── デフォルト入力色 ─────────────────────────────────────────────────────────
const DEFAULT_INPUTS: Record<ScaleName, ScaleInput> = {
  gray:   { hex: '#394554', chromaScale: 1.0 },
  blue:   { hex: '#394554', chromaScale: 1.0 },
  green:  { hex: '#6D7D5F', chromaScale: 1.0 },
  yellow: { hex: '#E1D9BC', chromaScale: 1.0 },
  red:    { hex: '#8B4A4A', chromaScale: 1.0 },
};

const SCALE_NAMES: ScaleName[] = ['gray', 'blue', 'green', 'yellow', 'red'];

const SCALE_LABELS: Record<ScaleName, string> = {
  gray:   'Gray',
  blue:   'Blue',
  green:  'Green',
  yellow: 'Yellow',
  red:    'Red',
};

// ── 型ガード ─────────────────────────────────────────────────────────────────
function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

// ── ScaleRow コンポーネント ──────────────────────────────────────────────────
interface ScaleRowProps {
  name: ScaleName;
  input: ScaleInput;
  scale: PaletteScale;
  onChange: (name: ScaleName, input: ScaleInput) => void;
}

function ScaleRow({ name, input, scale, onChange }: ScaleRowProps) {
  const [hexInput, setHexInput] = useState(input.hex);
  const oklch = hexToOklch(input.hex);

  const handleHexChange = useCallback((v: string) => {
    setHexInput(v);
    if (isValidHex(v)) onChange(name, { ...input, hex: v });
  }, [name, input, onChange]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ width: 52, fontSize: 11, color: '#6b7a8a', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {SCALE_LABELS[name]}
        </span>

        {/* Color picker */}
        <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: input.hex,
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
          }} />
          <input
            type="color"
            value={input.hex}
            onChange={e => handleHexChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </div>

        {/* HEX input */}
        <input
          type="text"
          value={hexInput}
          onChange={e => handleHexChange(e.target.value)}
          maxLength={7}
          style={{
            width: 80, padding: '4px 8px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${isValidHex(hexInput) ? 'rgba(255,255,255,0.12)' : '#9b3a3a'}`,
            borderRadius: 4, color: '#c8d0d9', fontSize: 12,
            fontFamily: 'monospace', outline: 'none',
          }}
        />

        {/* OKLCH 表示 */}
        <span style={{ fontSize: 10, color: '#4a5a6a', fontFamily: 'monospace', flexShrink: 0 }}>
          L{oklch.L.toFixed(2)} C{oklch.C.toFixed(3)} H{oklch.H.toFixed(0)}°
        </span>

        {/* Chroma scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, color: '#4a5a6a' }}>chroma</span>
          <input
            type="range" min={0.3} max={2.5} step={0.1}
            value={input.chromaScale}
            onChange={e => onChange(name, { ...input, chromaScale: Number(e.target.value) })}
            style={{ width: 72, accentColor: '#5a7a9a' }}
          />
          <span style={{ fontSize: 10, color: '#6b7a8a', width: 28, fontFamily: 'monospace' }}>
            {input.chromaScale.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Swatch strip */}
      <div style={{ display: 'flex', gap: 2, paddingLeft: 62 }}>
        {scale.map(step => (
          <div key={step.step} style={{ flex: 1, position: 'relative' }}>
            <div
              title={`${name}-${step.step}: ${step.hex} (L${step.oklch.L.toFixed(2)} C${step.oklch.C.toFixed(3)})`}
              style={{
                height: 32, borderRadius: 3,
                background: step.hex,
                outline: step.isGamutClipped ? '1.5px solid #e05050' : 'none',
                outlineOffset: -1,
              }}
            />
            <div style={{
              textAlign: 'center', fontSize: 8,
              color: 'rgba(255,255,255,0.25)', marginTop: 2,
              fontFamily: 'monospace',
            }}>
              {step.step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ContrastRow コンポーネント ────────────────────────────────────────────────
function ContrastRow({ result }: { result: ContrastResult }) {
  const badge = (label: string, ok: boolean, adjusted: boolean) => (
    <span style={{
      padding: '2px 7px', borderRadius: 3, fontSize: 10, fontWeight: 600,
      fontFamily: 'monospace',
      background: ok ? 'rgba(80,160,100,0.18)' : 'rgba(180,60,60,0.18)',
      color: ok ? '#5db87a' : '#c06060',
      border: `0.5px solid ${ok ? 'rgba(80,160,100,0.35)' : 'rgba(180,60,60,0.35)'}`,
    }}>
      {label}{adjusted ? ' ↺' : ''}
    </span>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 48px 48px 60px 56px 56px',
      gap: 8, alignItems: 'center',
      padding: '6px 10px',
      borderBottom: '0.5px solid rgba(255,255,255,0.05)',
      fontSize: 11,
    }}>
      <span style={{ color: '#7a8a9a', fontFamily: 'monospace', fontSize: 10 }}>
        {result.theme === 'dark' ? '🌙' : '☀️'} {result.label}
      </span>
      <div style={{ width: 20, height: 20, borderRadius: 3, background: result.fg, border: '0.5px solid rgba(255,255,255,0.1)' }} />
      <div style={{ width: 20, height: 20, borderRadius: 3, background: result.bg, border: '0.5px solid rgba(255,255,255,0.1)' }} />
      <span style={{ fontFamily: 'monospace', color: '#8a9aaa', fontSize: 10 }}>
        {result.ratio.toFixed(2)}:1
      </span>
      {badge('AA', result.passAA, result.adjusted)}
      {badge('AAA', result.ratio >= 7.0, false)}
    </div>
  );
}

// ── CSS Output コンポーネント ─────────────────────────────────────────────────
function CssOutput({ tokens }: { tokens: TokenMap }) {
  const [copied, setCopied] = useState(false);
  const css = useMemo(() => generateCss(tokens), [tokens]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [css]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute', top: 10, right: 10,
          padding: '4px 12px', borderRadius: 4, fontSize: 11,
          background: copied ? 'rgba(80,160,100,0.2)' : 'rgba(255,255,255,0.06)',
          border: '0.5px solid rgba(255,255,255,0.14)',
          color: copied ? '#5db87a' : '#8a9aaa',
          cursor: 'pointer', zIndex: 1,
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre style={{
        margin: 0, padding: '14px 16px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.07)',
        fontSize: 11, fontFamily: 'monospace',
        color: '#8ab0c8', overflowX: 'auto',
        maxHeight: 480, overflowY: 'auto',
        lineHeight: 1.7,
        whiteSpace: 'pre',
      }}>
        {css}
      </pre>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
type TabId = 'palette' | 'tokens' | 'contrast' | 'css';

export default function App() {
  const [inputs, setInputs] = useState<Record<ScaleName, ScaleInput>>(DEFAULT_INPUTS);
  const [activeTab, setActiveTab] = useState<TabId>('palette');

  const handleChange = useCallback((name: ScaleName, input: ScaleInput) => {
    setInputs(prev => ({ ...prev, [name]: input }));
  }, []);

  const palette = useMemo(() => generatePalette(inputs), [inputs]);
  const rawTokens = useMemo(() => mapTokens(palette), [palette]);
  const { tokens, results } = useMemo(
    () => checkAndAdjustContrast(rawTokens, palette),
    [rawTokens, palette],
  );

  const passCount  = results.filter(r => r.passAA).length;
  const totalCount = results.length;
  const adjCount   = results.filter(r => r.adjusted).length;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'palette',  label: 'Palette' },
    { id: 'tokens',   label: 'Tokens' },
    { id: 'contrast', label: `Contrast (${passCount}/${totalCount})` },
    { id: 'css',      label: 'CSS Output' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1318',
      color: '#c0cad4',
      fontFamily: '"DM Mono", "Fira Code", monospace',
      fontSize: 13,
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        padding: '14px 28px',
        display: 'flex', alignItems: 'baseline', gap: 16,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#a0b8cc', letterSpacing: '0.05em' }}>
          COLOR TOKEN
        </span>
        <span style={{ fontSize: 10, color: '#3a4a5a', letterSpacing: '0.1em' }}>
          OKLCH · WCAG 2.2
        </span>
      </div>

      <div style={{ padding: '20px 28px', maxWidth: 900 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 16px', borderRadius: 4, fontSize: 11,
                background: activeTab === tab.id
                  ? 'rgba(90,120,154,0.22)'
                  : 'transparent',
                border: activeTab === tab.id
                  ? '0.5px solid rgba(90,120,154,0.4)'
                  : '0.5px solid transparent',
                color: activeTab === tab.id ? '#a0c0d8' : '#4a5a6a',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              {tab.label}
            </button>
          ))}
          {adjCount > 0 && (
            <span style={{
              marginLeft: 'auto', fontSize: 10,
              color: '#8a7a4a', alignSelf: 'center',
              border: '0.5px solid rgba(140,120,60,0.3)',
              padding: '3px 8px', borderRadius: 3,
            }}>
              ↺ {adjCount} token{adjCount > 1 ? 's' : ''} auto-adjusted
            </span>
          )}
        </div>

        {/* ── Palette Tab ── */}
        {activeTab === 'palette' && (
          <div>
            <div style={{ marginBottom: 18, fontSize: 10, color: '#3a4a5a', letterSpacing: '0.06em' }}>
              BASE COLOR → OKLCH SCALE EXPANSION
            </div>

            {/* Step number header */}
            <div style={{ display: 'flex', gap: 2, paddingLeft: 62, marginBottom: 4 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: '#2a3a4a' }}>
                  {i * 10}
                </div>
              ))}
            </div>

            {SCALE_NAMES.map(name => (
              <ScaleRow
                key={name}
                name={name}
                input={inputs[name]}
                scale={palette[name]}
                onChange={handleChange}
              />
            ))}

            <div style={{ marginTop: 12, fontSize: 10, color: '#2a3a4a' }}>
              <span style={{ color: '#9b4a4a' }}>■</span> red outline = gamut clipped (OKLCH→sRGB変換で色相ズレあり)
            </div>
          </div>
        )}

        {/* ── Tokens Tab ── */}
        {activeTab === 'tokens' && (
          <div>
            <div style={{ marginBottom: 18, fontSize: 10, color: '#3a4a5a', letterSpacing: '0.06em' }}>
              SEMANTIC TOKEN MAP
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0 32px',
            }}>
              {(['dark', 'light'] as const).map(theme => (
                <div key={theme}>
                  <div style={{
                    fontSize: 10, color: '#4a5a6a', marginBottom: 10,
                    letterSpacing: '0.08em',
                    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
                    paddingBottom: 6,
                  }}>
                    {theme === 'dark' ? '🌙 DARK' : '☀️ LIGHT'}
                  </div>
                  {(Object.keys(tokens) as (keyof typeof tokens)[]).map(tokenName => {
                    const hex = tokens[tokenName][theme];
                    return (
                      <div key={tokenName} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '5px 0',
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 4,
                          background: hex,
                          border: '0.5px solid rgba(255,255,255,0.1)',
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: '#7a8a9a', fontFamily: 'monospace' }}>
                            --color-{tokenName}
                          </div>
                          <div style={{ fontSize: 9, color: '#3a4a5a', fontFamily: 'monospace' }}>
                            {hex}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contrast Tab ── */}
        {activeTab === 'contrast' && (
          <div>
            <div style={{ marginBottom: 18, fontSize: 10, color: '#3a4a5a', letterSpacing: '0.06em' }}>
              WCAG 2.2 CONTRAST CHECK
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 48px 48px 60px 56px 56px',
              gap: 8, padding: '5px 10px 8px',
              borderBottom: '0.5px solid rgba(255,255,255,0.1)',
              fontSize: 9, color: '#3a4a5a', letterSpacing: '0.06em',
            }}>
              <span>PAIR</span>
              <span>FG</span>
              <span>BG</span>
              <span>RATIO</span>
              <span>AA 4.5:1</span>
              <span>AAA 7:1</span>
            </div>
            {results.map((r, i) => <ContrastRow key={i} result={r} />)}
            <div style={{ marginTop: 14, fontSize: 10, color: '#4a5a6a' }}>
              ↺ = auto-adjusted (step shifted within scale to meet AA)
            </div>
          </div>
        )}

        {/* ── CSS Tab ── */}
        {activeTab === 'css' && (
          <div>
            <div style={{ marginBottom: 18, fontSize: 10, color: '#3a4a5a', letterSpacing: '0.06em' }}>
              CSS CUSTOM PROPERTIES
            </div>
            <CssOutput tokens={tokens} />
          </div>
        )}
      </div>
    </div>
  );
}

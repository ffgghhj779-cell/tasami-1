const TAJAWAL_CSS =
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap';

let fontCssText: string | null = null;

/** Fetch Tajawal @font-face rules for embedding in invoice snapshot. */
export async function getInvoiceFontCss(): Promise<string> {
  if (fontCssText) return fontCssText;

  const localFaces = `
@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/Amiri-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/Amiri-Regular.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/Amiri-Regular.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
  font-display: block;
}
`;

  try {
    const res = await fetch(TAJAWAL_CSS, { mode: 'cors' });
    if (res.ok) {
      const css = await res.text();
      fontCssText = `${localFaces}\n${css}`;
      return fontCssText;
    }
  } catch {
    /* offline — local Amiri only */
  }

  fontCssText = localFaces;
  return fontCssText;
}

export async function ensureInvoiceFontsReady(): Promise<void> {
  await getInvoiceFontCss();
  try {
    await document.fonts.load('400 16px Tajawal');
    await document.fonts.load('700 16px Tajawal');
    await document.fonts.load('800 28px Tajawal');
    await document.fonts.load('400 16px Amiri');
  } catch {
    /* best effort */
  }
  await document.fonts.ready;
}

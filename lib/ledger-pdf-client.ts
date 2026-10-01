/** Browser-only PDF text layer extract. Empty string means scan / image-only PDF. */
export async function extractPdfText(file: File, maxPages = 6): Promise<string> {
  const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pages = Math.min(pdf.numPages, maxPages);
  const chunks: string[] = [];

  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const rows = new Map<number, Array<{ x: number; str: string }>>();
    for (const item of content.items) {
      if (!item || typeof item !== 'object' || !('str' in item)) continue;
      const str = String((item as { str?: string }).str || '');
      if (!str.trim()) continue;
      const transform = (item as { transform?: number[] }).transform || [];
      const y = Math.round((transform[5] ?? 0) / 4) * 4;
      const x = transform[4] ?? 0;
      const row = rows.get(y) || [];
      row.push({ x, str });
      rows.set(y, row);
    }
    const lines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, cells]) =>
        cells
          .sort((a, b) => a.x - b.x)
          .map((cell) => cell.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter(Boolean);
    if (lines.length) chunks.push(`--- Page ${i} ---\n${lines.join('\n')}`);
  }

  return chunks.join('\n\n');
}

export function fileLooksLikePdf(file: File): boolean {
  return file.type === 'application/pdf';
}

/** Extension is only a hint; contradictory active MIME never reaches preview. */
export async function validateInvoiceFile(file: File): Promise<File> {
  if (file.size > 6 * 1024 * 1024) throw new Error('Invoice must be at most 6MB.');
  const pdfName = file.name.toLowerCase().endsWith('.pdf');
  if (file.type === 'application/pdf' || pdfName) {
    if (file.type && file.type !== 'application/pdf' && file.type !== 'application/octet-stream') throw new Error('PDF has an incompatible file type.');
    const prefix = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...prefix) !== '%PDF-') throw new Error('This file is not a valid PDF.');
    return new File([file], file.name, { type: 'application/pdf' });
  }
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use a PDF, JPEG, PNG, or WEBP invoice.');
  return file;
}

/** First page as JPEG when the PDF has no usable text layer (scans). */
export async function renderPdfPreviewImage(file: File): Promise<{ dataUrl: string; mimeType: string } | null> {
  try {
    const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(viewport.width, 1600);
    canvas.height = Math.min(viewport.height, 2200);
    const context = canvas.getContext('2d');
    if (!context) return null;
    await page.render({ canvasContext: context, viewport, canvas } as never).promise;
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.82), mimeType: 'image/jpeg' };
  } catch {
    return null;
  }
}

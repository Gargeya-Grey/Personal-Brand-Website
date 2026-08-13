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
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line) chunks.push(`--- Page ${i} ---\n${line}`);
  }

  return chunks.join('\n\n');
}

export function fileLooksLikePdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
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

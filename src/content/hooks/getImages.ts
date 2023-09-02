interface SrcSetImage {
  url: string;
  size: number;
}

function getLargestSrc(srcset: string): string {
  return srcset.split(',')
    .map(s => s.trim())
    .reduce((largest: SrcSetImage, img: string) => {
      const [url, size] = img.split(' ');
      const sizeValue = parseInt(size, 10);

      if (!largest.size || sizeValue > largest.size) {
        return { url, size: sizeValue };
      }
      return largest;
    }, { url: '', size: 0 }).url;
}

function extractImagesFromDocument(doc: Document, exceptSelector?: string): string[] {
  const imageElements = doc.querySelectorAll(
    `img${exceptSelector ? `:not(${exceptSelector} img)` : ''}, source${exceptSelector ? `:not(${exceptSelector} source)` : ''}`
  ) as NodeListOf<HTMLImageElement | HTMLSourceElement>;

  const imgSrcArray = Array.from(imageElements).map(el => {
    const srcset = el.getAttribute('srcset');
    const xlinkHref = el.getAttribute('xlink:href');

    if (xlinkHref) return xlinkHref;
    if (!srcset) return el.getAttribute('src') || '';

    return getLargestSrc(srcset);
  });

  const elements = doc.querySelectorAll(
    `*${exceptSelector ? `:not(${exceptSelector} *)` : ''}`
  );

  const bgImageArray = Array.from(elements).flatMap(el => {
    const styles = [window.getComputedStyle(el), window.getComputedStyle(el, '::before'), window.getComputedStyle(el, '::after')];

    return styles.map(style => {
      const backgroundImage = style.getPropertyValue('background-image') || style.getPropertyValue('background');

      const match = /url\("?(.+?)"?\)/.exec(backgroundImage);
      return match ? match[1] : null;
    });
  }).filter((url): url is string => url !== null && !url.startsWith('data:'));

  const dataUrlArray = Array.from(doc.querySelectorAll('img[src^="data:"]')).map(el => el.getAttribute('src') || '');

  return [...imgSrcArray, ...bgImageArray, ...dataUrlArray];
}

export function getAllImageUrls(exceptSelector?: string): string[] {
  let allImageUrls = extractImagesFromDocument(document, exceptSelector);

  const iframes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeImageUrls = extractImagesFromDocument(iframeDoc, exceptSelector);
        allImageUrls = [...allImageUrls, ...iframeImageUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allImageUrls;
}
function extractVideosFromDocument(doc: Document, exceptSelector?: string): string[] {
  // Video elements
  const videoElements = doc.querySelectorAll(
    `video${exceptSelector ? `:not(${exceptSelector} video)` : ''}`
  );

  const videoSrcArray = Array.from(videoElements).map(el => {
    const src = el.getAttribute('src');
    if (src) {
      return src;
    }

    const sourceElement = el.querySelector('source');
    return sourceElement ? sourceElement.getAttribute('src') : null;
  }).filter((src): src is string => src !== null && !src.startsWith('blob:'));

  // Iframe elements (e.g., YouTube, Vimeo)
  const iframeElements = doc.querySelectorAll(
    `iframe${exceptSelector ? `:not(${exceptSelector} iframe)` : ''}`
  );

  const iframeSrcArray = Array.from(iframeElements).map(el => {
    const src = el.getAttribute('src');
    return src && (src.includes('youtube.com') || src.includes('vimeo.com')) ? src : null;
  }).filter((src): src is string => src !== null);

  return [...videoSrcArray, ...iframeSrcArray];
}

export function getAllVideoUrls(exceptSelector?: string): string[] {
  let allVideoUrls = extractVideosFromDocument(document, exceptSelector);

  const iframes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeVideoUrls = extractVideosFromDocument(iframeDoc, exceptSelector);
        allVideoUrls = [...allVideoUrls, ...iframeVideoUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allVideoUrls;
}

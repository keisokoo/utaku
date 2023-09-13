import { LimitBySelectorType } from "../../atoms/settings";

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
export function getLimitBySelector(limitBySelectorList: LimitBySelectorType[]) {
  if (!limitBySelectorList) return;
  if (limitBySelectorList.length < 1) return;
  return limitBySelectorList.find((limitBySelector) => window.location.host.includes(limitBySelector.host));
}
function extractImagesFromDocument(doc: Document, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  let selectorQuery = '';
  let parentSelectorQuery = '';
  const exceptQuery = (val: string) => exceptSelector ? `:not(${exceptSelector} ${val})` : '';
  if (limitBySelector) {
    if (window.location.host.includes(limitBySelector.host)) {
      if (limitBySelector.selector.image) selectorQuery = limitBySelector.selector.image;
      if (limitBySelector.selector.parent) parentSelectorQuery = limitBySelector.selector.parent;
    }
  }
  const imageQuery = `${parentSelectorQuery} img${selectorQuery}${exceptQuery('img')}, ${parentSelectorQuery} source${selectorQuery}${exceptQuery('source')}`;
  const backgroundQuery = `${parentSelectorQuery}${selectorQuery}${exceptQuery('*')}`;

  const imageElements = doc.querySelectorAll(
    imageQuery
  ) as NodeListOf<HTMLImageElement | HTMLSourceElement>;

  const imgSrcArray = Array.from(imageElements).map(el => {
    const isSourceElement = el.tagName.toLowerCase() === 'source';
    const srcset = el.getAttribute('srcset');
    const xlinkHref = el.getAttribute('xlink:href');

    if (xlinkHref) return xlinkHref;
    if (isSourceElement) return srcset ? getLargestSrc(srcset) : '';
    if (!srcset) return el.getAttribute('src') || '';

    return getLargestSrc(srcset);
  });

  const elements = doc.querySelectorAll(
    backgroundQuery
  );

  const bgImageArray = Array.from(elements).flatMap(el => {
    const styles = [window.getComputedStyle(el), window.getComputedStyle(el, '::before'), window.getComputedStyle(el, '::after')];

    return styles.map(style => {
      const backgroundImage = style.getPropertyValue('background-image') || style.getPropertyValue('background');

      const match = /url\("?(.+?)"?\)/.exec(backgroundImage);
      return match ? match[1] : null;
    });
  }).filter((url): url is string => url !== null && !url.startsWith('data:'));

  return [...imgSrcArray, ...bgImageArray];
}


export function getAllImageUrls(exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  let allImageUrls = extractImagesFromDocument(document, exceptSelector, limitBySelector);

  const iframeNodes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframeNodes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeImageUrls = extractImagesFromDocument(iframeDoc, exceptSelector, limitBySelector);
        allImageUrls = [...allImageUrls, ...iframeImageUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allImageUrls;
}
function extractVideosFromDocument(doc: Document, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  let selectorQuery = '';
  let parentSelectorQuery = '';
  const exceptQuery = (val: string) => exceptSelector ? `:not(${exceptSelector} ${val})` : '';
  if (limitBySelector) {
    if (window.location.host.includes(limitBySelector.host)) {
      if (limitBySelector.selector.video) selectorQuery = limitBySelector.selector.video;
      if (limitBySelector.selector.parent) parentSelectorQuery = limitBySelector.selector.parent;
    }
  }
  const videoQuery = `${parentSelectorQuery} video${selectorQuery}${exceptQuery('video')}`;
  const videoElements = doc.querySelectorAll(
    videoQuery
  );
  const videoSrcArray = Array.from(videoElements).map(el => {
    const src = el.getAttribute('src');
    if (src) {
      return src;
    }
    const sourceElement = el.querySelector('source');
    return sourceElement ? sourceElement.getAttribute('src') : null;
  }).filter((src): src is string => src !== null && !src.startsWith('blob:'));
  return [...videoSrcArray];
}

export function getAllVideoUrls(exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  let allVideoUrls = extractVideosFromDocument(document, exceptSelector, limitBySelector);

  const iframeNodes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframeNodes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeVideoUrls = extractVideosFromDocument(iframeDoc, exceptSelector, limitBySelector);
        allVideoUrls = [...allVideoUrls, ...iframeVideoUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allVideoUrls;
}


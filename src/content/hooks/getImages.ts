import { isElement } from "lodash-es";
import { LimitBySelectorType } from "../../atoms/settings";
import { isValidUrl } from "../../utils";

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
export function getLimitBySelector(limitBySelectorList?: LimitBySelectorType[]) {
  if (!limitBySelectorList) return [];
  if (limitBySelectorList.length < 1) return [];
  return limitBySelectorList.filter((limitBySelector) => window.location.host.includes(limitBySelector.host) && !!limitBySelector.active);
}
function getUrlFromImageElement(el: HTMLImageElement | HTMLSourceElement): string {
  const isSourceElement = el.tagName.toLowerCase() === 'source';
  const srcset = el.getAttribute('srcset');
  const xlinkHref = el.getAttribute('xlink:href');

  if (xlinkHref) return xlinkHref;
  if (isSourceElement) return srcset ? getLargestSrc(srcset) : '';
  if (!srcset) return el.getAttribute('src') || '';

  return getLargestSrc(srcset);
}
function getComputedStyle(el: Element) {
  try {
    return [window.getComputedStyle(el), window.getComputedStyle(el, '::before'), window.getComputedStyle(el, '::after')];
  } catch (error) {
    return []
  }
}
function getBackgroundImageCode(style: CSSStyleDeclaration) {
  try {
    const backgroundImage = style.getPropertyValue('background-image') || style.getPropertyValue('background');
    const match = /url\("?(.+?)"?\)/.exec(backgroundImage);
    return match ? match[1] : null;
  } catch (error) {
    return null
  }
}
function extractImagesFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType, useSvgElement?: boolean, anchorCollect?: boolean): string[] {
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
  const backgroundQuery = `${parentSelectorQuery} *${selectorQuery}${exceptQuery('*')}`;
  const imageElements = doc.querySelectorAll(
    imageQuery
  ) as NodeListOf<HTMLImageElement | HTMLSourceElement>;

  const imgSrcArray = Array.from(imageElements).map(el => {
    return getUrlFromImageElement(el);
  });

  let bgElements = Array.from(doc.querySelectorAll(
    backgroundQuery
  ))
  if (isElement(doc)) {
    bgElements = [doc as Element, ...bgElements];
  }
  const bgImageArray = bgElements.flatMap(el => {
    const styles = getComputedStyle(el)
    return styles.map(style => {
      return getBackgroundImageCode(style)
    });
  }).filter((url): url is string => url !== null && !url.startsWith('data:') &&
    !url.endsWith('.woff') &&
    !url.endsWith('.woff2') && !url.endsWith('.ttf') && !url.endsWith('.eot') && !url.endsWith('.svg'));

  let svgArray: string[] = [];
  if (useSvgElement) {
    const svgQuery = `${parentSelectorQuery} svg${selectorQuery}${exceptQuery('svg')}`;
    const svgElements = doc.querySelectorAll(
      svgQuery
    ) as NodeListOf<SVGElement>
    svgArray = Array.from(svgElements).map((el) => {
      return svgElementToBase64(el)
    });
  }
  let anchorArray: string[] = [];
  if (anchorCollect) {
    const anchorQuery = `${parentSelectorQuery} a${selectorQuery}${exceptQuery('a')}`;

    const anchorElements = doc.querySelectorAll(
      anchorQuery
    ) as NodeListOf<HTMLAnchorElement>
    anchorArray = Array.from(anchorElements).map((el) => {
      return collectImagesFromAnchor(el)
    }).filter((ii) => ii !== null) as string[];
  }

  return [...imgSrcArray, ...bgImageArray, ...svgArray, ...anchorArray];
}
function base64EncodeUnicode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(Number('0x' + p1));
  }));
}
export function svgElementToBase64(el: SVGElement): string {
  const svg = el.outerHTML;
  const base64Svg = base64EncodeUnicode(svg);
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
  return dataUrl;
}

function collectImagesFromAnchor(el: HTMLAnchorElement): string | null {
  const href = el.getAttribute('href');
  if (!href) return null;
  if (!isValidUrl(href)) return null;
  return href
}

export function extractAHrefFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  let selectorQuery = '';
  let parentSelectorQuery = '';
  const exceptQuery = (val: string) => exceptSelector ? `:not(${exceptSelector} ${val})` : '';
  if (limitBySelector) {
    if (window.location.host.includes(limitBySelector.host)) {
      if (limitBySelector.selector.image) selectorQuery = limitBySelector.selector.image;
      if (limitBySelector.selector.parent) parentSelectorQuery = limitBySelector.selector.parent;
    }
  }
  const anchorQuery = `${parentSelectorQuery} a${selectorQuery}${exceptQuery('a')}`;

  const anchorElements = doc.querySelectorAll(
    anchorQuery
  ) as NodeListOf<HTMLAnchorElement>
  const anchorArray = Array.from(anchorElements).map((el) => {
    return collectImagesFromAnchor(el)
  });
  return anchorArray.filter((ii) => ii !== null) as string[];
}
export function extractSVGFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  let selectorQuery = '';
  let parentSelectorQuery = '';
  const exceptQuery = (val: string) => exceptSelector ? `:not(${exceptSelector} ${val})` : '';
  if (limitBySelector) {
    if (window.location.host.includes(limitBySelector.host)) {
      if (limitBySelector.selector.image) selectorQuery = limitBySelector.selector.image;
      if (limitBySelector.selector.parent) parentSelectorQuery = limitBySelector.selector.parent;
    }
  }
  const svgQuery = `${parentSelectorQuery} svg${selectorQuery}${exceptQuery('svg')}`;

  const svgElements = doc.querySelectorAll(
    svgQuery
  ) as NodeListOf<SVGElement>
  const svgArray = Array.from(svgElements).map((el) => {
    return svgElementToBase64(el)
  });
  return svgArray;
}

export function getItemsFromCurrentElementTarget(target: Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType[]) {
  if (target.tagName.toLowerCase() === 'a') return { image: [collectImagesFromAnchor(target as HTMLAnchorElement)].filter((ii) => ii !== null) as string[], media: [] }
  if (target.tagName.toLowerCase() === 'img') return { image: [getUrlFromImageElement(target as HTMLImageElement)].filter((ii) => ii !== null) as string[], media: [] }
  if (target.tagName.toLowerCase() === 'video') return { image: [], media: [getUrlFromVideoElement(target as HTMLVideoElement)].filter((ii) => ii !== null) as string[] }
  if (target.tagName.toLowerCase() === 'svg') return { image: [svgElementToBase64(target as SVGElement)].filter((ii) => ii !== null) as string[], media: [] }
  if (target.closest('svg')) return { image: [svgElementToBase64(target.closest('svg') as SVGElement)].filter((ii) => ii !== null) as string[], media: [] }

  const allImageUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractImagesFromDocument(target, exceptSelector, limit, true, true)
  ).flat() : extractImagesFromDocument(target, exceptSelector, undefined, true, true);
  const allVideoUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractVideosFromDocument(target, exceptSelector, limit)
  ).flat() : extractVideosFromDocument(target, exceptSelector);
  return { image: [...allImageUrls], media: allVideoUrls }
}

export function getAllImageUrls(exceptSelector?: string, limitBySelector?: LimitBySelectorType[], useSvgElement?: boolean, anchorCollect?: boolean): string[] {
  let allImageUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractImagesFromDocument(document, exceptSelector, limit, useSvgElement, anchorCollect)
  ).flat() : extractImagesFromDocument(document, exceptSelector, undefined, useSvgElement, anchorCollect);
  const iframeNodes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframeNodes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeImageUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
          extractImagesFromDocument(iframeDoc, exceptSelector, limit, useSvgElement, anchorCollect)
        ).flat() : extractImagesFromDocument(iframeDoc, exceptSelector, undefined, useSvgElement, anchorCollect);
        allImageUrls = [...allImageUrls, ...iframeImageUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allImageUrls;
}
function getUrlFromVideoElement(el: HTMLVideoElement) {
  let src = el.getAttribute('src');
  if (src && !src.startsWith('blob:')) src = null;
  const sourceElement = el.querySelector('source');
  const sourceSrc = sourceElement ? sourceElement.getAttribute('src') : null;
  const result = src ?? sourceSrc ?? null
  return result
}
function extractVideosFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
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
    return getUrlFromVideoElement(el as HTMLVideoElement)
  }).filter((src): src is string => src !== null && !src.startsWith('blob:'));
  return [...videoSrcArray];
}

export function getAllVideoUrls(exceptSelector?: string, limitBySelector?: LimitBySelectorType[]): string[] {
  let allVideoUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractVideosFromDocument(document, exceptSelector, limit)
  ).flat() : extractVideosFromDocument(document, exceptSelector);

  const iframeNodes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframeNodes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeVideoUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
          extractVideosFromDocument(iframeDoc, exceptSelector, limit)
        ).flat() : extractVideosFromDocument(iframeDoc, exceptSelector);
        allVideoUrls = [...allVideoUrls, ...iframeVideoUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allVideoUrls;
}


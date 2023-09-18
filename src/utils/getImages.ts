import { isElement } from "lodash-es";
import { isValidUrl } from ".";
import { LimitBySelectorType } from "../atoms/settings";
import { ItemType } from "../content/types";


function toAbsoluteURL(baseURL: string, collectedURL: string): string {
  try {
    if (!baseURL) return collectedURL
    if (collectedURL.startsWith('//')) {
      return new URL(baseURL).protocol + collectedURL
    }
    if (collectedURL.startsWith('/') || collectedURL.startsWith('.')) {
      return new URL(collectedURL, baseURL).toString()
    }
    return collectedURL
  } catch (error) {
    return collectedURL
  }
}

export const toItemType = (url: string, type: 'image' | 'media') => {
  if (window !== undefined) {
    url = toAbsoluteURL(window.location.href, url)
  }
  return {
    url: url,
    type: type,
    initiator: window.location.origin,
    imageInfo: {
      width: 0,
      height: 0,
      active: false,
    },
  } as ItemType
}

function getLargestSrc(srcset: string): string {
  return srcset.split(',')
    .map(s => s.trim())
    .reduce((largest: {
      url: string;
      size: number;
    }, img: string) => {
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
function parseToSelectorQuery(tagName: string, exceptSelector?: string, limitBySelector?: LimitBySelectorType) {
  let selectorQuery = '';
  let parentSelectorQuery = '';
  const exceptQuery = (val: string) => exceptSelector ? `:not(${exceptSelector} ${val})` : '';
  if (limitBySelector) {
    if (window.location.host.includes(limitBySelector.host)) {
      if (limitBySelector.selector.image) selectorQuery = limitBySelector.selector.image;
      if (limitBySelector.selector.parent) parentSelectorQuery = limitBySelector.selector.parent;
    }
  }
  return `${parentSelectorQuery} ${tagName}${selectorQuery}${exceptQuery(tagName)}`;
}
function base64EncodeUnicode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(Number('0x' + p1));
  }));
}
export function svgElementToBase64(el: SVGElement): string {
  if (!el.hasAttribute('xmlns')) el.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const svg = el.outerHTML;
  const base64Svg = base64EncodeUnicode(svg);
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
  return dataUrl;
}

const imageExtensions = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
  'webp', 'ico', 'apng', 'avif'
];

const imageExtensionPattern = new RegExp(`\\.(${imageExtensions.join('|')})$`, 'i');
function collectImagesFromAnchor(el: HTMLAnchorElement): string | null {
  const href = el.getAttribute('href');
  if (!href) return null;
  if (!isValidUrl(href)) return null;
  return imageExtensionPattern.test(href) ? href : null;
}

function extractAHrefFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  const anchorQuery = `${parseToSelectorQuery('a', exceptSelector, limitBySelector)}`;
  const anchorElements = doc.querySelectorAll(
    anchorQuery
  ) as NodeListOf<HTMLAnchorElement>
  const anchorArray = Array.from(anchorElements).map((el) => {
    return collectImagesFromAnchor(el)
  });
  return anchorArray.filter((ii) => ii !== null) as string[];
}
function extractSVGFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  const svgQuery = `${parseToSelectorQuery('svg', exceptSelector, limitBySelector)}`;
  const svgElements = doc.querySelectorAll(
    svgQuery
  ) as NodeListOf<SVGElement>
  const svgArray = Array.from(svgElements).map((el) => {
    return svgElementToBase64(el)
  });
  return svgArray;
}
function extractImgFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  const imageQuery = `${parseToSelectorQuery('img', exceptSelector, limitBySelector)}, ${parseToSelectorQuery('source', exceptSelector, limitBySelector)}`;
  const imageElements = doc.querySelectorAll(
    imageQuery
  ) as NodeListOf<HTMLImageElement | HTMLSourceElement>;
  return Array.from(imageElements).map(el => {
    return getUrlFromImageElement(el);
  });
}
function extractBackgroundImagesFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  const backgroundQuery = `${parseToSelectorQuery('*', exceptSelector, limitBySelector)}`;
  let bgElements = Array.from(doc.querySelectorAll(
    backgroundQuery
  ))
  if (isElement(doc)) {
    bgElements = [doc as Element, ...bgElements];
  }
  return bgElements.flatMap(el => {
    const styles = getComputedStyle(el)
    return styles.map(style => {
      return getBackgroundImageCode(style)
    });
  }).filter((url): url is string => url !== null && !url.startsWith('data:') &&
    !url.endsWith('.woff') &&
    !url.endsWith('.woff2') && !url.endsWith('.ttf') && !url.endsWith('.eot'));
}

function getUrlFromVideoElement(el: HTMLVideoElement) {
  let src = el.getAttribute('src');
  if (src && !src.startsWith('blob:')) src = null;
  const sourceElement = el.querySelector('source');
  const sourceSrc = sourceElement ? sourceElement.getAttribute('src') : null;
  const result = src ?? sourceSrc ?? null
  return result
}

function extractAllImages(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType, useSvgElement?: boolean, anchorCollect?: boolean): string[] {
  let svgArray: string[] = [];
  let anchorArray: string[] = [];
  const imgSrcArray = extractImgFromDocument(doc, exceptSelector, limitBySelector);
  const bgImageArray = extractBackgroundImagesFromDocument(doc, exceptSelector, limitBySelector);
  if (useSvgElement) {
    svgArray = extractSVGFromDocument(doc, exceptSelector, limitBySelector);
  }
  if (anchorCollect) {
    anchorArray = extractAHrefFromDocument(doc, exceptSelector, limitBySelector);
  }
  return [...imgSrcArray, ...bgImageArray, ...svgArray, ...anchorArray];
}
function extractVideosFromDocument(doc: Document | Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType): string[] {
  const videoQuery = `${parseToSelectorQuery('video', exceptSelector, limitBySelector)}`
  const videoElements = doc.querySelectorAll(
    videoQuery
  );
  const videoSrcArray = Array.from(videoElements).map(el => {
    return getUrlFromVideoElement(el as HTMLVideoElement)
  }).filter((src): src is string => src !== null && !src.startsWith('blob:'));
  return [...videoSrcArray];
}


export function getAllImageUrls(exceptSelector?: string, limitBySelector?: LimitBySelectorType[], useSvgElement?: boolean, anchorCollect?: boolean): string[] {
  let allImageUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractAllImages(document, exceptSelector, limit, useSvgElement, anchorCollect)
  ).flat() : extractAllImages(document, exceptSelector, undefined, useSvgElement, anchorCollect);
  const iframeNodes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];

  for (const iframe of iframeNodes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const iframeImageUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
          extractAllImages(iframeDoc, exceptSelector, limit, useSvgElement, anchorCollect)
        ).flat() : extractAllImages(iframeDoc, exceptSelector, undefined, useSvgElement, anchorCollect);
        allImageUrls = [...allImageUrls, ...iframeImageUrls];
      }
    } catch (e) {
      continue;
    }
  }

  return allImageUrls;
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


export function getItemsFromCurrentElementTarget(target: Element, exceptSelector?: string, limitBySelector?: LimitBySelectorType[]) {
  const allImageUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractAllImages(target, exceptSelector, limit, true, true)
  ).flat() : extractAllImages(target, exceptSelector, undefined, true, true);
  const allVideoUrls = limitBySelector && limitBySelector.length > 0 ? limitBySelector.map((limit) =>
    extractVideosFromDocument(target, exceptSelector, limit)
  ).flat() : extractVideosFromDocument(target, exceptSelector);
  let result = { image: [...allImageUrls], media: allVideoUrls }
  if ([...result.image, ...result.media].length === 0 && target.parentElement) {
    const nextResult = getItemsFromCurrentElementTarget(target.parentElement, exceptSelector, limitBySelector)
    result = { image: [...nextResult.image], media: [...nextResult.media] }
  }

  return result
}
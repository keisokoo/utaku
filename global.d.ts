
declare namespace chrome.webRequest {
  interface WebResponseHeadersDetails {
    documentId: string
  }
}
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
declare namespace JSX {
  interface IntrinsicElements {
    'utaku-div': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'utaku-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
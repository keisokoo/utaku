export const injectStyle = `@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
[utaku-highlight] {
  outline: 3px solid #27beff !important;
  box-shadow: inset 0px 0px 100vw 100vw rgba(194, 253, 255, 0.568627451);
  filter: sepia(1);
  transition: 0.3s ease-out;
  cursor: copy;
}

#utaku-iframe {
  position: fixed;
  z-index: 214748363;
  bottom: 0;
  left: 0;
  right: 0;
  top: initial;
  color: #000;
  text-align: left;
  margin: 0;
  padding: 0;
  width: 100%;
  height: auto;
  background: transparent;
  border-radius: initial;
  box-shadow: none;
}

html body .utaku-root {
  font-size: 14px;
  position: fixed;
  z-index: 214748363;
  bottom: 0;
  left: 0;
  right: 0;
  top: initial;
  color: #000;
  text-align: left;
  margin: 0;
  padding: 0;
  width: 100%;
  height: auto;
  background: transparent;
  border-radius: initial;
  box-shadow: none;
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard Variable", Pretendard, Roboto, "Noto Sans KR", "Segoe UI", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
}
html body .utaku-root * {
  box-sizing: border-box;
  min-width: auto;
}
html body .utaku-root .floating-button {
  position: absolute;
  height: auto;
  min-height: auto;
  width: auto;
  min-width: auto;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translate(-50%, -100%);
  border-radius: 8px 8px 0 0;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 6px 8px 3px;
  color: rgb(198, 198, 198);
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  z-index: 214748364;
  border: none;
  outline: none;
  cursor: pointer;
  opacity: 1;
}
html body .utaku-root .floating-button:hover {
  color: rgb(23, 255, 86);
}
html body .utaku-root .floating-button.hide {
  display: none !important;
  visibility: hidden !important;
}
html body .utaku-root .utaku-wrapper {
  width: 100%;
}`

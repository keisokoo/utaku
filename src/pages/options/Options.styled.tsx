import styled from '@emotion/styled'

export const OptionStyle = {
  Wrap: styled.div`
    margin: 0 auto;
    max-width: 1200px;
  `,
  Columns: styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
  `,
  Support: styled.div`
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 16px;
  `,
  Box: styled.div`
    padding: 16px;
    &[data-utaku-center] {
      text-align: center;
    }
  `,
  Links: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    a {
      text-decoration: underline !important;
    }
  `,
  VideoBox: styled.div`
    background-color: #494949;
    padding: 32px;
    margin: 32px auto;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    gap: 16px;
  `,
  VideoDescription: styled.div`
    font-size: 18px;
    font-weight: 400;
    color: #fff;
    white-space: pre-line;
    line-height: 2;
    width: 100%;
  `,
  VideoTitle: styled.div`
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  `,
  Title: styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    padding-top: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  Description: styled.div`
    font-size: 18px;
    font-weight: 400;
    color: #fff;
    white-space: pre-line;
    padding: 8px 0 32px;
    line-height: 2;
  `,
  Header: styled.div`
    background-color: #313131;
    position: sticky;
    top: -104px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    height: 170px;
    border-bottom: 2px solid #fff;
    padding-bottom: 16px;
  `,
  Body: styled.div`
    white-space: pre-line;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    line-height: 1.4;
  `,
  Nav: styled.div`
    position: sticky;
    top: 3px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;
    padding: 16px;
    font-size: 24px;
    font-weight: 700;
    & > div {
      cursor: pointer;
      user-select: none;
    }
  `,
  Guide: styled.div`
    font-size: 18px;
    font-weight: 400;
    white-space: pre-line;
    display: flex;
    flex-direction: column;
    gap: 8px;
    p {
      line-height: 1.8;
    }
  `,
  Introduction: styled.div`
    font-size: 18px;
    font-weight: 400;
    white-space: pre-line;
    display: flex;
    flex-direction: column;
    gap: 8px;
    p {
      line-height: 1.8;
    }
  `,
  CenterLogo: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 16px;
  `,
  Responsive: styled.div`
    padding-top: 56.25%;
    position: relative;
    width: 100%;
    z-index: 0;
  `,
  Iframe: styled.iframe`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  `,
  Q: styled.div`
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  `,
  A: styled.div`
    font-size: 16px;
    font-weight: 400;
    color: #dfdfdf;
    line-height: 1.4;
  `,
}

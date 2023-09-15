import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'

const pulse = keyframes`
  0% {
    transform: scale(0.95) rotate(360deg);
    box-shadow: 0 0 0 0 rgba(0, 238, 48, 0.804);
  }
  70% {
    transform: scale(1) rotate(0deg);
    box-shadow: 0 0 0 15px rgba(0, 174, 35, 0);
  }
`
const pulseCss = css`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ce2600;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  position: relative;
  &::after {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid transparent;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 0.3s;
  }
`
const Circle = styled.div`
  ${pulseCss}
`
const CircleActive = styled.div`
  ${pulseCss}
  animation: ${pulse} 3s infinite;
  background-color: rgb(30, 255, 0);
  &::after {
    border-color: rgb(255, 255, 255);
  }
  &::before {
    content: '';
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: #00e52b;
    position: absolute;
    top: 2px;
    left: 2px;
    transform: rotate(0deg);
  }
`
export const LiveStyles = {
  Wrap: styled.div`
    white-space: nowrap;
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0px;
    border-radius: 16px;
    border: 1px solid #ffffff7e;
    & > label {
      color: #fff;
      font-size: 14px;
      padding: 0 8px 0 12px;
    }
  `,
  Status: styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #333;
    border-radius: 16px;
    padding: 6px 12px;
    background-color: #ffebeb;
    user-select: none;
    &[data-active='true'] {
      background-color: #d8ffe5;
    }
  `,
  Circle,
  CircleActive,
}

import React, { useRef, RefObject, useEffect, useState } from "react";
import styled from "styled-components";
import { theme } from "src/Styles/theme";

const PalettePage: React.FC = () => {

  const canvasEl = useRef<HTMLCanvasElement>();
  const [ratio, setRatio] = useState<number>(1);
  console.log(ratio);
  const getPosition = (e: PointerEvent) => {
    console.log(e.clientX);
    console.log(e.clientY);

  }

  const zoomInOut = (e: any) => {
    console.log(e);
    setRatio(ratio => (ratio >= 0.2 ? ratio + 0.001 * e.deltaY : 0.2));
  }

  useEffect(() => {
    const { current } = canvasEl;
    if (current) {
      current.addEventListener("click", getPosition);
      return () => current.removeEventListener("click", getPosition);
    }
  }, []);

  return (
    <StyledView
      className="container"
      ratio={ratio}
      onResize={(e: any) => zoomInOut(e)}
    >
      <canvas
        ref={canvasEl as RefObject<HTMLCanvasElement>} />
    </StyledView>
  )
}

const StyledView = styled.div<{ ratio: number; }>`
  position: relative;
  top: 0;
  left: 0;
  width: ${props => 100 / props.ratio}%;
  height: ${props => 100 / props.ratio}%;
  transform: scale(${props => props.ratio});
  background-color : ${theme.mono6};
  & > canvas {
    width : 100%;
    height : 100%;
  }
`;


export { PalettePage } 
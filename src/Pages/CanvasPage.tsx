import React, { useRef, RefObject, useEffect, useState } from "react";
import styled from "styled-components";
import { useRecoilValue, useRecoilCallback } from "recoil";
import { gridPixelState } from "src/States/atom";
import { Grid } from "src/Components/index";
import { ipcOnResize } from "src/Interface/ipc";
import { theme } from "src/Styles/theme";

const initTwoDimensionalArr = (rows: number, cols: number) => {
  let arr: any[][] = [];
  for (let i = 0; i < rows; i++) {
    arr[i] = [];
    for (let j = 0; j < cols; j++) {
      arr[i][j] = "";
    }
  }
  return arr;
}

const CanvasPage: React.FC = () => {

  const divEl = useRef<HTMLDivElement>();
  const canvasEl = useRef<HTMLCanvasElement>();
  const [isShowGrid, setIsShowGrid] = useState<boolean>(false);
  const [twoDimensionArr, setTwoDimensionArr] = useState<string[][]>(initTwoDimensionalArr(8, 8));
  const [ratio, setRatio] = useState<number>(1);
  const [coord, setCoord] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  });

  console.log(twoDimensionArr)
  // const { x, y } = useRecoilValue(gridPixelState);

  const startToDrag = (e: PointerEvent) => {
    const { current } = divEl;
    const elemRect = current.getBoundingClientRect();
    const coordX = e.clientX - elemRect.left;
    const coordY = e.clientY - elemRect.top;
    setCoord({
      x: coordX,
      y: coordY,
    })
  }

  const endToDrag = (e: PointerEvent) => {
    const { current } = divEl;
    const elemRect = current.getBoundingClientRect();
    const coordX = e.clientX - elemRect.left;
    const coordY = e.clientY - elemRect.top;
    console.log("end", coordX, coordY)
    setCoord({
      x: coordX,
      y: coordY,
    })
  }

  const zoomInOut = (e: any) => {
    // setRatio(ratio => (ratio >= 0.2 ? ratio + 0.01 * e.deltaY : 0.2));
    // ipcOnResize("zoomin");

  }

  const getCoordinate = useRecoilCallback(({ snapshot }) => async (e: MouseEvent) => {
    try {
      const { x, y } = await snapshot.getPromise(gridPixelState);
      const idxX = Math.floor(e.clientX / x);
      const idxY = Math.floor(e.clientY / y);
      let temp = twoDimensionArr;
      temp[idxX][idxY] = "T";
      const updated = temp;
      console.log(updated);
      setTwoDimensionArr(twoDimensionArr);
    } catch (e) {
      throw e;
    }
  }, [twoDimensionArr]);

  useEffect(() => {
    const { current } = canvasEl;
    if (current) {
      current.addEventListener("click", getCoordinate);
      return () => current.removeEventListener("click", getCoordinate);
    }

  }, []);

  useEffect(() => {
    const { current } = divEl;
    if (current) {
      current.addEventListener("mousedown", startToDrag);
      current.addEventListener("mouseup", endToDrag)
      return () => {
        current.removeEventListener("mousedown", startToDrag);
        current.addEventListener("mouseup", endToDrag)
      }
    }
  }, []);


  const _ratio = Math.floor(ratio * 100) / 100;
  return (
    <StyledView
      className="container"
      ref={divEl as RefObject<HTMLDivElement>}
      onWheel={(e) => zoomInOut(e)}
    >
      <StyledScaleIndicator ratio={_ratio} />
      <StyledCanvasWrapper
        className="wrapper draggable"
        ratio={1}
      >
        <StyledCanvas ref={canvasEl as RefObject<HTMLCanvasElement>} />
        {isShowGrid && (
          <Grid />
        )}
      </StyledCanvasWrapper>
      <StyledPalette>
        <div className="palette">
          <div onClick={() => {
            setIsShowGrid(!isShowGrid);
          }}>
            Show Grid
          </div>
        </div>
      </StyledPalette>
    </StyledView>
  )
}

const StyledPalette = styled.div`
  position : fixed;
  bottom : 20px;
  & > div.palette {
    border : 1px solid ${theme.mono6};
    width : 600px;
    height : 40px;
    background-color: ${theme.mono1};
  }
`;

const StyledScaleIndicator = styled.div.attrs(({ ratio }: any) => ({
  ratio,
}))`
  position : absolute;
  width : 20px;
  height : 200px;
  right : 10px;
  top : 20px;
  z-index: 100;
  border-radius: 4px;
  box-shadow : 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
  background-color : ${theme.mono1};
  &:before {
    content : '${props => `${props.ratio}`}';
    position: absolute;
    bottom : 0px;
    width : 20px;
    height :${props => props.ratio * 100}px ;
    background-color : blue;
    border-radius: 4px;
    
  }
  &:after {
  }
`;

const StyledView = styled.div.attrs(({ ratio }: any) => ({
  ratio,
}))`
  position: relative;
  top: 0;
  left: 0;
  width : 100vw;
  height : 100vh;
  
`;

const StyledCanvasWrapper = styled.div.attrs(({ ratio }: any) => ({
  ratio,
}))`
  width : 100%;
  height : 100%;
  transform-origin: 50% 50%;
  transform: scale(${props => props.ratio});
`;

const StyledCanvas = styled.canvas`
  position : absolute;
  width: 800px;
  height: 800px;
  background-color : ${theme.mono6};
`;

const StyledGrid = styled.div`
  width : 100%;
  height : 100%;
`;


export { CanvasPage } 
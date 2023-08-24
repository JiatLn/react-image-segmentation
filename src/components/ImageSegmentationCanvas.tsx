import { getScaledSize } from '@/lib/getScaledSize'
import { ImageSegment, clamp, getOutput } from '@/lib/imageSegmentation'
import { ImageSegmentation } from '@/types'
import { MouseEvent, useRef, useEffect, useState } from 'react'

type ImageSegmentationCanvasProps = {
  imgSrc: string
  imgSegmentation: ImageSegmentation[]
  label: string
  setLabel: (label: string) => void
}

const ImageSegmentationCanvas = ({ imgSrc, imgSegmentation, label, setLabel }: ImageSegmentationCanvasProps) => {

  const containerEl = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [output, setOutput] = useState<ImageSegment[]>([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [startTs, setStartTs] = useState<DOMHighResTimeStamp>(performance.now())
  const animDuration = 200;


  useEffect(() => {
    draw()
  }, [imgSrc, highlightIndex, output, label])

  useEffect(() => {
    async function run() {
      const output = await getOutput(imgSegmentation, width, height);
      setOutput(output)
    }
    if (!!imgSegmentation.length && width && height) {
      run()
    }
  }, [imgSegmentation, width, height])

  async function draw() {
    if (!canvas.current) return

    const img = new Image()
    img.src = imgSrc
    await new Promise((resolve) => {
      img.onload = () => {
        resolve(true)
      }
    })

    const [width, height] = getScaledSize(img.width, img.height)
    setWidth(width)
    setHeight(height)

    setStartTs(performance.now())
    drawHelper(img)
  }

  function drawHelper(img: HTMLImageElement) {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return

    const maskToDraw = output.reduce((arr, o, i) => {
      const mask = o?.bitmap;
      if (mask && (i === highlightIndex || label === o.label)) {
        arr.push(mask);
      }
      return arr;
    }, [] as ImageBitmap[]);


    const duration = performance.now() - startTs;
    ctx.globalAlpha = Math.min(duration, animDuration) / animDuration;
    ctx.drawImage(img, 0, 0, width, height);
    for (const mask of maskToDraw) {
      ctx.drawImage(mask, 0, 0, width, height);
    }
    if (duration < animDuration) {
      // when using canvas, prefer to use requestAnimationFrame over setTimeout & setInterval
      // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
      window.requestAnimationFrame(() => drawHelper(img));
    }
  }

  function mouseout() {
    setHighlightIndex(-1);
  }

  function getIndexOfMouse(event: MouseEvent<HTMLCanvasElement>) {
    const canvasW = canvas.current?.offsetWidth || 0;
    const canvasH = canvas.current?.offsetHeight || 0;
    const imgW = canvas.current?.width || 0;
    const imgH = canvas.current?.height || 0;
    let layerX = event.nativeEvent.offsetX;
    let layerY = event.nativeEvent.offsetY;
    layerX = clamp(layerX, 0, canvasW);
    layerY = clamp(layerY, 0, canvasH);
    const row = Math.floor((layerX / canvasH) * imgH);
    const col = Math.floor((layerY / canvasW) * imgW);
    const index = (imgW * col + row) * 4;
    return index;
  }

  function onClick(event: MouseEvent<HTMLCanvasElement>) {
    const index = getIndexOfMouse(event);
    for (const [, o] of output.entries()) {
      const pixel = o.imgData?.data[index];
      if (pixel && pixel > 0) {
        setLabel(o.label)
        // if (pickedArea.includes(i)) {
        //   setPickedArea((prev) => prev.filter((p) => p !== i));
        // } else {
        //   setPickedArea((prev) => [...prev, i]);
        // }
      }
    }
  }

  function mousemove(event: MouseEvent<HTMLCanvasElement>) {
    const index = getIndexOfMouse(event);
    setHighlightIndex(-1);
    for (const [i, o] of output.entries()) {
      const pixel = o.imgData?.data[index];
      if (pixel && pixel > 0) {
        setHighlightIndex(i);
      }
    }
  }

  return (
    <div ref={containerEl} className='w-full h-full flex items-center justify-center'>
      {
        !output.length && (
          <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
            <div className='text-2xl font-bold text-primary-gray'>Loading...</div>
          </div>
        )
      }
      <canvas
        ref={canvas} width={width} height={height}
        onClick={onClick}
        onMouseMove={mousemove}
        onMouseOut={mouseout}
        className='cursor-pointer transition-all' />
    </div>
  )
}

export default ImageSegmentationCanvas

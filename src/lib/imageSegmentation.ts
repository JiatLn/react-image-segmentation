import { COLORS } from "@/data/colors";

function getImageData(maskImg: CanvasImageSource, imgW: number, imgH: number): ImageData {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = imgW;
  tmpCanvas.height = imgH;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.drawImage(maskImg, 0, 0, imgW, imgH);
  const segmentData = tmpCtx.getImageData(0, 0, imgW, imgH);
  return segmentData;
}

function hexToRgb(hex: string): number[] {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
    , (_, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    ?.map(x => parseInt(x, 16)) || [0, 0, 0];
}

const colorToRgb = COLORS.reduce((acc, clr) => {
  const [r, g, b]: number[] = hexToRgb(clr.hex);
  const clrWithRgb = { ...clr, r, g, b };
  return { ...acc, [clr.color]: clrWithRgb };
}, {}) as Record<string, { r: number, g: number, b: number }>;


export interface ImageSegment {
  label: string;
  score: number;
  mask: string;
  color?: string;
  imgData?: ImageData;
  bitmap?: ImageBitmap;
}

async function addOutputCanvasData(
  imgSegment: ImageSegment, width: number, height: number
): Promise<ImageSegment> {
  const { mask, color } = imgSegment;

  const maskImg = new Image();
  maskImg.src = `data:image/png;base64, ${mask}`;
  // await image.onload
  await new Promise((resolve) => {
    maskImg.onload = () => resolve(maskImg);
  });
  const imgData = getImageData(maskImg, width, height);
  const { r, g, b } = colorToRgb[color!]
  const maskOpacity = Math.floor(255 * 0.6);
  const maskColored = [r, g, b, maskOpacity];
  const background = Array(4).fill(0);

  for (let i = 0; i < imgData.data.length; i += 4) {
    const [r, g, b, a] = imgData.data[i] === 255 ? maskColored : background;
    imgData.data[i] = r;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = b;
    imgData.data[i + 3] = a;
  }

  const bitmap = await createImageBitmap(imgData);
  return { ...imgSegment, imgData, bitmap };
}

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

function addOutputColor(imgSegment: ImageSegment, idx: number) {
  const hash = mod(idx, COLORS.length);
  const { color } = COLORS[hash];
  return { ...imgSegment, color };
}


export async function getOutput(imageSegmentation: ImageSegment[], width: number, height: number) {

  const output = await Promise.all(
    imageSegmentation
      .map((o, idx) => addOutputColor(o, idx))
      .map((o) => addOutputCanvasData(o, width, height))
  );

  return output;
}

/**
 *  Returns a function that clamps input value to range [min <= x <= max].
 */
export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(x, max));
}

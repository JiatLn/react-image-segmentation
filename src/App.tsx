import ImageSegmentationCanvas from "@/components/ImageSegmentationCanvas"
import { imageSegmentations } from "@/data/image-segmentation"
import { ImageSegmentation } from "@/types"
import { useEffect, useState } from "react"

function App() {

  const [imgSeg, setImgSeg] = useState<ImageSegmentation[]>([])
  const [image, setImage] = useState('')
  const [label, setLabel] = useState('')

  useEffect(() => {
    setImgSeg(imageSegmentations)
    setImage('/img/demo.jfif')
  }, [])

  return (
    <div className='grid place-items-center w-full min-h-[100vh]'>
      <div className='rounded-md relative w-[512px] h-[512px]'>
        <ImageSegmentationCanvas label={label} setLabel={setLabel} imgSrc={image} imgSegmentation={imgSeg} />
      </div>
    </div>
  )
}

export default App

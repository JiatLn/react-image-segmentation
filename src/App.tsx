import { formatLabel } from "@/utils"
import { ChangeEvent, useState } from "react"

interface Pred {
  name: string,
  prob: number
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [preds, setPreds] = useState<Pred[]>([])
  const [loading, setLoading] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setImage(URL.createObjectURL(e.target.files[0]))
    }
  }


  async function postImage() {
    try {
      if (!file) {
        alert('Please upload a image!')
        return
      }
      setLoading(true)
      const formData = new FormData()
      formData.append('image', file!)
      const response = await fetch("/api/classify_image", {
        method: 'POST',
        body: formData
      })
      const { preds } = await response.json()
      setPreds(preds)
    } catch (error) {
      console.log('error', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center w-full min-h-[100vh] overflow-auto'>
      <div className="flex max-sm:flex-col items-center justify-center gap-4 container overflow-auto">
        <div className="flex-1 w-min max-w-[500px] flex items-center justify-center relative h-[400px] overflow-hidden rounded-lg max-sm:w-5/6 border-2 border-[#844fff] border-dashed p-4 group">
          {image && <img className="h-full w-full max-w-[400px] object-cover object-center" src={image} alt="" />}
          <input type='file' accept='image/*' className='absolute top-0 left-0 right-0 bottom-0 w-full h-full z-2 opacity-0 cursor-pointer' onChange={handleChange} />
          {
            !image &&
            <>
              <div className='absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-[#003eff12] z-1 hidden group-hover:flex' />
              <input type='file' accept='image/*' className='absolute top-0 left-0 right-0 bottom-0 w-full h-full z-2 opacity-0 cursor-pointer' onChange={handleChange} />
              <div className='flex flex-col items-center justify-center'>
                <div className='text-[#844fff] mt-1'>
                  Click to upload
                </div>
                <p className='text-[gray] text-center font-medium w-[296px] mt-2'>
                  Or drag and drop image files directly into this area
                </p>
                <p className='text-[#878A92] text-center text-xs w-[302px] mt-9'>
                  Size not more than 10MB, aspect ratio less than 2, format does not support gif format
                </p>
              </div>
            </>
          }
        </div>
        <div className="flex-1 max-w-[360px] flex flex-col items-center gap-4 my-4">
          <h2 className="text-center text-lg font-bold">
            Top 3 Predictions
          </h2>
          <button onClick={postImage}
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            {loading ? 'Loading...' : 'Predict'}
          </button>
          <div className="flex justify-center min-h-[280px] items-center">
            {
              loading
                ?
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#844fff]' />
                  <p className="text-center text-[#844fff]">Loading...</p>
                </div>
                :
                <div className="flex gap-6 flex-col">
                  {preds.length === 0 && <p>No predictions result</p>}
                  {preds.map((pred, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <span className="font-mono">{formatLabel(pred.name)}</span>
                      <div className="flex items-center gap-2 justify-between">
                        <progress color="red" value={pred.prob} max={1} />
                        <span className="font-mono">{(pred.prob * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    </div >
  )
}

export default App

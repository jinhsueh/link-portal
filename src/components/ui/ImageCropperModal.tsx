'use client'

import { useCallback, useEffect, useState } from 'react'
import CropperRaw, { Area } from 'react-easy-crop'
import { X, Check, RotateCw } from 'lucide-react'

// react-easy-crop's class-component types don't match React 19's stricter JSX
// signature, so cast to a permissive component type. The runtime is fine — only
// the .d.ts shape is off.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cropper = CropperRaw as unknown as React.ComponentType<any>

/**
 * ImageCropperModal — reusable crop UI for any uploaded image.
 *
 * Usage pattern:
 *   const [pendingFile, setPendingFile] = useState<File | null>(null)
 *
 *   // In your <input type=file onChange>: setPendingFile(file) (don't upload yet)
 *
 *   {pendingFile && (
 *     <ImageCropperModal file={pendingFile} aspect={1}
 *       onComplete={async (cropped) => {
 *         setPendingFile(null)
 *         await upload(cropped)
 *       }}
 *       onCancel={() => setPendingFile(null)} />
 *   )}
 *
 * The cropped result is returned as a File (PNG, same name, lossless), ready
 * to be POSTed to /api/upload like the original.
 */

interface Props {
  file: File
  /** Aspect ratio width/height. 1 = square, 3 = 3:1 banner, etc. */
  aspect: number
  /** Whether the crop window is shown as a circle (purely visual hint). */
  cropShape?: 'rect' | 'round'
  /** Optional title shown in the modal header. */
  title?: string
  /**
   * 'banner' — show desktop + mobile viewport mock-ups under the cropper
   * so the user can verify the crop reads well at both sizes. Customer
   * feedback was that they couldn't tell what would be visible on each
   * device until after publishing.
   */
  viewportPreview?: 'banner'
  onComplete: (cropped: File) => void
  onCancel: () => void
}

export function ImageCropperModal({
  file,
  aspect,
  cropShape = 'rect',
  title = '裁切圖片',
  viewportPreview,
  onComplete,
  onCancel,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pixelArea, setPixelArea] = useState<Area | null>(null)
  const [working, setWorking] = useState(false)
  // Live thumbnail of the crop region for the viewport preview. Recomputed
  // (debounced via the area callback) whenever the user pans/zooms.
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)

  // Read the file into a data URL once on mount.
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [file])

  const handleCropComplete = useCallback(async (_area: Area, areaPixels: Area) => {
    setPixelArea(areaPixels)
    // Update the viewport preview thumbnail. Skip when not in viewport mode
    // to avoid the canvas render cost on every pan/zoom.
    if (viewportPreview && imageSrc) {
      try {
        const dataUrl = await cropToDataUrl(imageSrc, areaPixels, rotation)
        setPreviewDataUrl(dataUrl)
      } catch { /* preview is best-effort */ }
    }
  }, [imageSrc, rotation, viewportPreview])

  const handleConfirm = async () => {
    if (!imageSrc || !pixelArea) return
    setWorking(true)
    try {
      const cropped = await cropToFile(imageSrc, pixelArea, rotation, file.name)
      onComplete(cropped)
    } finally {
      setWorking(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,17,23,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <button onClick={onCancel}
            className="p-1.5 rounded-lg"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Crop canvas */}
        <div className="relative bg-black" style={{ width: '100%', height: 360 }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              objectFit="contain"
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              縮放
            </label>
            <input type="range" min={1} max={4} step={0.01} value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full" style={{ accentColor: 'var(--color-primary)' }} />
          </div>
          <button onClick={() => setRotation(r => (r + 90) % 360)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <RotateCw size={12} /> 旋轉 90°
          </button>

          {/* Viewport preview — banner mode shows side-by-side desktop +
              mobile mock-ups so the creator can see the crop in context.
              Helps with the "桌面跟手機顯示不一樣" complaint by making both
              renderings visible BEFORE upload. */}
          {viewportPreview === 'banner' && previewDataUrl && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                預覽:在公開頁的呈現(同一張圖,只是顯示尺寸不同)
              </p>
              <div className="flex items-start gap-3">
                {/* Desktop mock — wider window, 3:1 aspect */}
                <div className="flex-1">
                  <div style={{
                    width: '100%', aspectRatio: '3 / 1',
                    overflow: 'hidden', borderRadius: 6,
                    border: '1px solid var(--color-border)',
                  }}>
                    <img src={previewDataUrl} alt="桌面版預覽"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                  </div>
                  <p className="text-[10px] mt-1 text-center" style={{ color: 'var(--color-text-muted)' }}>💻 桌面版</p>
                </div>
                {/* Mobile mock — phone bezel, narrower aspect kept identical (3:1)
                    so the crop is the same on both — only render size differs. */}
                <div style={{ width: 90 }}>
                  <div style={{
                    width: '100%', aspectRatio: '3 / 1',
                    overflow: 'hidden', borderRadius: 4,
                    border: '1px solid var(--color-border)',
                  }}>
                    <img src={previewDataUrl} alt="手機版預覽"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                  </div>
                  <p className="text-[10px] mt-1 text-center" style={{ color: 'var(--color-text-muted)' }}>📱 手機版</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onCancel}
            className="text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            取消
          </button>
          <button onClick={handleConfirm} disabled={!pixelArea || working}
            className="btn-primary"
            style={{ fontSize: 13, padding: '8px 16px', opacity: pixelArea && !working ? 1 : 0.5 }}>
            <Check size={14} />
            {working ? '處理中…' : '套用裁切'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Apply the crop area + rotation against the source data URL, return a JPEG File.
 *
 * Output is **capped at 1600px on the longest side** and encoded as JPEG
 * (quality 0.9) so a typical icon upload is well under 1MB. This prevents the
 * 4 MB upload-size 400 we were hitting when the user picked a 4000×4000 source
 * and the cropped PNG ballooned to 8-10 MB.
 *
 * For SVG-style flat logos PNG would be lossless-better, but the upload limit
 * trumps that — we'd rather succeed with 95% quality than fail with 100%.
 */
const MAX_OUTPUT_PX = 1600
const JPEG_QUALITY = 0.9

async function cropToFile(
  imageSrc: string,
  pixelArea: Area,
  rotationDeg: number,
  origName: string,
): Promise<File> {
  const image = await loadImage(imageSrc)
  const rad = (rotationDeg * Math.PI) / 180

  // Pre-rotation: draw the rotated image onto an offscreen canvas big enough
  // to hold the rotated bounding box, then crop from that.
  const safeArea = Math.max(image.width, image.height) * 2
  const stage = document.createElement('canvas')
  stage.width = safeArea
  stage.height = safeArea
  const sctx = stage.getContext('2d')!
  sctx.translate(safeArea / 2, safeArea / 2)
  sctx.rotate(rad)
  sctx.translate(-image.width / 2, -image.height / 2)
  sctx.drawImage(image, 0, 0)

  // Compute output size — scale down if either dimension exceeds the cap.
  const longest = Math.max(pixelArea.width, pixelArea.height)
  const scale = longest > MAX_OUTPUT_PX ? MAX_OUTPUT_PX / longest : 1
  const outW = Math.round(pixelArea.width * scale)
  const outH = Math.round(pixelArea.height * scale)

  // Two-canvas pipeline: first extract crop at native resolution, then scale
  // into the output canvas. Avoids putImageData scaling artefacts.
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = pixelArea.width
  cropCanvas.height = pixelArea.height
  const cctx = cropCanvas.getContext('2d')!
  const data = sctx.getImageData(0, 0, safeArea, safeArea)
  cctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelArea.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelArea.y),
  )

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH
  const octx = out.getContext('2d')!
  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = 'high'
  // Fill white so JPEG transparent backgrounds become white instead of black.
  octx.fillStyle = '#FFFFFF'
  octx.fillRect(0, 0, outW, outH)
  octx.drawImage(cropCanvas, 0, 0, outW, outH)

  const blob = await new Promise<Blob | null>(resolve =>
    out.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  )
  if (!blob) throw new Error('Failed to crop image')

  const stem = origName.replace(/\.[^.]+$/, '')
  return new File([blob], `${stem}-cropped.jpg`, { type: 'image/jpeg' })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Lightweight version of cropToFile that returns a data URL — used for the
 * live viewport preview thumbnail. Caps preview at 480px wide so the canvas
 * pipeline doesn't bog down on large source images during pan/zoom.
 */
async function cropToDataUrl(
  imageSrc: string,
  pixelArea: Area,
  rotationDeg: number,
): Promise<string> {
  const image = await loadImage(imageSrc)
  const rad = (rotationDeg * Math.PI) / 180
  const safeArea = Math.max(image.width, image.height) * 2
  const stage = document.createElement('canvas')
  stage.width = safeArea
  stage.height = safeArea
  const sctx = stage.getContext('2d')!
  sctx.translate(safeArea / 2, safeArea / 2)
  sctx.rotate(rad)
  sctx.translate(-image.width / 2, -image.height / 2)
  sctx.drawImage(image, 0, 0)

  const PREVIEW_MAX = 480
  const longest = Math.max(pixelArea.width, pixelArea.height)
  const scale = longest > PREVIEW_MAX ? PREVIEW_MAX / longest : 1
  const outW = Math.round(pixelArea.width * scale)
  const outH = Math.round(pixelArea.height * scale)

  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = pixelArea.width
  cropCanvas.height = pixelArea.height
  const cctx = cropCanvas.getContext('2d')!
  const data = sctx.getImageData(0, 0, safeArea, safeArea)
  cctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelArea.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelArea.y),
  )

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH
  const octx = out.getContext('2d')!
  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = 'medium'
  octx.fillStyle = '#FFFFFF'
  octx.fillRect(0, 0, outW, outH)
  octx.drawImage(cropCanvas, 0, 0, outW, outH)

  return out.toDataURL('image/jpeg', 0.7)
}

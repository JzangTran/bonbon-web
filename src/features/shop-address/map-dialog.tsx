import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CrosshairIcon, MapPinIcon, MinusIcon, PlusIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { firstPlace, placeOf, reverseGeocode, useSuggestions, type Place } from '@/entities/geo'
import { problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'

export type PickedPoint = { lat: number; lng: number; place: Place | null }

/** Where the map opens when nothing else is known: the centre of Hà Nội. */
const FALLBACK = { lat: 21.0285, lng: 105.8542 }
const TILES = import.meta.env.VITE_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const round = (n: number) => Math.round(n * 1e6) / 1e6

/**
 * "Chọn địa điểm": a map with a pin fixed at its centre. Drag or zoom the map (or type an address) and the pin shows where
 * the shop is; when the map stops, the address under the pin fills the search box. "Xác nhận" hands the point back.
 */
export function MapDialog({
  open,
  onOpenChange,
  initial,
  startQuery,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The point already chosen, when there is one. */
  initial?: { lat: number; lng: number }
  /** What to look for to centre the map when no point is chosen yet (the ward and province selected). */
  startQuery?: string
  onConfirm: (point: PickedPoint) => void
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const programmatic = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [text, setText] = useState('')
  const [debounced, setDebounced] = useState('')
  const [place, setPlace] = useState<Place | null>(null)
  const [centre, setCentre] = useState<{ lat: number; lng: number }>(initial ?? FALLBACK)
  const [resolving, setResolving] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [focusSearch, setFocusSearch] = useState(false)

  const suggestions = useSuggestions(debounced)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 300)
    return () => clearTimeout(t)
  }, [text])

  /** The address under a point; a failure only means there is no address to show, the point itself is still usable. */
  const resolve = useCallback((lat: number, lng: number) => {
    setResolving(true)
    setNote(null)
    reverseGeocode(lat, lng)
      .then((p) => {
        setPlace(p)
        setText(p.formattedAddress ?? '')
        setDebounced('')
      })
      .catch((e) => {
        setPlace(null)
        setNote(problemMessage(e))
      })
      .finally(() => setResolving(false))
  }, [])

  const moveTo = useCallback((lat: number, lng: number, zoom: number) => {
    const map = mapRef.current
    if (!map) return
    programmatic.current = true
    map.setView([lat, lng], zoom, { animate: false })
    setCentre({ lat, lng })
  }, [])

  // Build the map when the dialog's body exists; tear it down when the dialog closes.
  useEffect(() => {
    if (!open || !container) return
    const start = initial ?? FALLBACK
    const map = L.map(container, { zoomControl: false, center: [start.lat, start.lng], zoom: initial ? 17 : 14, attributionControl: true })
    L.tileLayer(TILES, { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map)
    map.attributionControl.setPrefix(false)
    mapRef.current = map
    map.on('moveend', () => {
      const c = map.getCenter()
      setCentre({ lat: round(c.lat), lng: round(c.lng) })
      if (programmatic.current) {
        programmatic.current = false
        return
      }
      clearTimeout(timer.current)
      timer.current = setTimeout(() => resolve(c.lat, c.lng), 400)
    })
    // Dialog animations change the size after mount; let the map measure itself again.
    const settle = setTimeout(() => map.invalidateSize(), 200)
    // The address of the point already chosen (a timeout, so no state is set while the effect runs).
    const first = initial ? setTimeout(() => resolve(initial.lat, initial.lng), 0) : undefined
    return () => {
      clearTimeout(settle)
      clearTimeout(first)
      clearTimeout(timer.current)
      map.remove()
      mapRef.current = null
    }
    // The map is built once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, container])

  // With no point chosen yet, look for the ward the person selected and centre the map there.
  useEffect(() => {
    if (!open || initial || !startQuery || !container) return
    let cancelled = false
    ;(async () => {
      try {
        const p = await firstPlace(startQuery)
        if (p && !cancelled) {
          moveTo(p.lat, p.lng, 16)
          resolve(p.lat, p.lng)
        }
      } catch {
        // The map simply stays where it opened.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, initial, startQuery, container, moveTo, resolve])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt này không cho định vị.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        moveTo(round(pos.coords.latitude), round(pos.coords.longitude), 18)
        resolve(pos.coords.latitude, pos.coords.longitude)
      },
      () => toast.error('Không lấy được vị trí của bạn. Hãy cho phép định vị trong trình duyệt, hoặc kéo bản đồ.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const pickSuggestion = async (placeId: string) => {
    setDebounced('')
    setFocusSearch(false)
    setResolving(true)
    try {
      const p = await placeOf(placeId)
      moveTo(p.lat, p.lng, 18)
      setPlace(p)
      setText(p.formattedAddress ?? '')
      setNote(null)
    } catch (e) {
      setNote(problemMessage(e))
    } finally {
      setResolving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100svh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">Chọn địa điểm</DialogTitle>
          <DialogDescription className="sr-only">Kéo bản đồ để đưa ghim tới đúng vị trí cửa hàng.</DialogDescription>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
              <CrosshairIcon /> Định vị địa điểm của tôi
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Đóng">
                <XIcon />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="relative h-[min(60svh,28rem)] bg-image-slot">
          <div ref={setContainer} className="absolute inset-0" role="application" aria-label="Bản đồ chọn vị trí cửa hàng" />

          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center" aria-hidden="true">
            <MapPinIcon className="size-10 -translate-y-5 fill-primary text-white drop-shadow-md" strokeWidth={1.5} />
          </div>

          <div className="absolute top-3 left-3 z-[600] w-[min(22rem,calc(100%-5rem))]">
            <Input
              role="combobox"
              aria-expanded={focusSearch && debounced.length >= 3}
              aria-label="Nhập vị trí"
              placeholder="Nhập vị trí"
              autoComplete="off"
              maxLength={200}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocusSearch(true)}
              onBlur={() => setTimeout(() => setFocusSearch(false), 150)}
              className="shadow-float"
            />
            {focusSearch && debounced.length >= 3 ? (
              <ul role="listbox" aria-label="Gợi ý địa chỉ" className="mt-1 max-h-60 overflow-y-auto rounded-sm border bg-popover shadow-float">
                {suggestions.isPending ? <li className="px-3 py-2 text-sm text-muted-foreground">Đang tìm…</li> : null}
                {suggestions.isError ? <li className="px-3 py-2 text-sm text-destructive">{problemMessage(suggestions.error)}</li> : null}
                {suggestions.data?.length === 0 ? <li className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy địa chỉ phù hợp.</li> : null}
                {suggestions.data?.map((s) => (
                  <li key={s.placeId} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-ws-fill"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => void pickSuggestion(s.placeId!)}
                    >
                      <span className="font-medium">{s.mainText}</span>
                      <span className="text-xs text-muted-foreground">{s.secondaryText}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="absolute right-3 bottom-8 z-[600] flex flex-col overflow-hidden rounded-sm border bg-card shadow-float">
            <button type="button" aria-label="Phóng to" onClick={() => mapRef.current?.zoomIn()} className="flex size-9 items-center justify-center border-b hover:bg-ws-fill">
              <PlusIcon className="size-4" />
            </button>
            <button type="button" aria-label="Thu nhỏ" onClick={() => mapRef.current?.zoomOut()} className="flex size-9 items-center justify-center hover:bg-ws-fill">
              <MinusIcon className="size-4" />
            </button>
          </div>
        </div>

        <DialogFooter className="m-0 flex-col items-stretch gap-2 rounded-none sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="min-h-5 text-xs text-muted-foreground">
            {resolving ? 'Đang xác định địa chỉ…' : note ?? (place?.formattedAddress ? place.formattedAddress : `Vị trí: ${centre.lat.toFixed(5)}, ${centre.lng.toFixed(5)}`)}
          </p>
          <Button type="button" disabled={resolving} onClick={() => onConfirm({ lat: centre.lat, lng: centre.lng, place })}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

# bonbon mascot pictures

Every picture of the bonbon polar bear lives here as `<name>.webp` (transparent background). The pages use a picture as soon as its
file is here; until then they keep the old line illustration.

## Already in use

| File | Where |
|---|---|
| `serve.webp` | Home page, the big picture under the headline |
| `phone.webp`, `cook.webp`, `deliver.webp`, `eat.webp` | Home page, the four steps of an order |
| `wave.webp` | Home page, the seller band (two bears behind the counter) |
| `not-found.webp` | 404 page |
| `empty-orders.webp` | Empty order lists (seller web + app, customer app) |
| `all-clear.webp` | Empty complaints, support tickets, contact requests (seller + admin; app complaints) |
| `empty-chat.webp` | Empty chat list (seller web, app conversations) |
| `empty-notifications.webp` | App: no notifications |
| `check-email.webp` | Seller sign-up, last step |
| `verified.webp` | Email verified |
| `payment-done.webp` | Back from MoMo |
| `maintenance.webp` | Maintenance screen (web + app) |
| `error.webp` | A page crashed |
| `search.webp` | App: page not found |
| `update.webp` | App: update required |
| `seller-desk.webp` | Seller sign-in and sign-up, right half (landscape, has a background) |

The app keeps 600 px copies of the ones it uses in `mobile/assets/mascot/`. The PNG originals stay out of git.

## Adding a picture


### Rules for every picture

- **The same bear as `serve.webp`**: give that picture to the image tool as the reference, every time. Same fur, same orange apron
  with the white bonbon bear on the chest, same soft studio light from the top left.
- **Transparent background**, the whole bear in frame, a little space around it; a faint contact shadow under the feet is fine.
- **No words or numbers in the picture**: the site is in Vietnamese and English, and the text sits next to the picture. Use shapes
  and icons instead of signs with writing.
- **Readable small**: most of these are shown 140–200 px wide. One clear action, one or two big props, no busy scene.
- **Square, 1024 × 1024** unless the brief says otherwise. WebP or PNG; I convert to WebP.
- **Mood**: friendly and calm. Errors are a little embarrassed, never scary; empty lists are patient, never sad.

### Shared prompt

> Photorealistic 3D render of the same adult polar bear mascot as in the reference image: true-to-life anatomy, thick cream-white
> fur with fine strand detail, wearing the same bright orange (#FE551B) apron with the white bonbon bear logo on the chest. Soft
> studio light from the top left, faint contact shadow, transparent background, full body, centred, square 1024 × 1024, no text,
> no numbers, no other characters. Simple, readable at a small size.

Add the pose line of each picture below.

### Shared prompt


> Photorealistic 3D render of the same adult polar bear mascot as in the reference image: true-to-life anatomy, thick cream-white
> fur with fine strand detail, wearing the same bright orange (#FE551B) apron with the white bonbon bear logo on the chest. Soft
> studio light from the top left, faint contact shadow, transparent background, full body, centred, square 1024 × 1024, no text,
> no numbers, no other characters. Simple, readable at a small size.

Then one line for the pose. When the picture has a white background, cut it out (flood fill from the edges, so the white fur is
kept) before saving the WebP, so it also sits on dark surfaces.

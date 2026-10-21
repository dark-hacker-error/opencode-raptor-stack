# Geolocation & Metadata

## Media metadata

```bash
exiftool -gps:all -a -u -b photo.jpg
exiftool -a -u -G1 photo.jpg | head -40
```

Pull: GPS latitude/longitude, altitude, timestamp with timezone, camera/phone make and model, lens,
software, and any edited comment or serial number.

**Camera serial number** is a strong identity anchor — it links photos to one device, and a serial
number often appears in marketplace listings, repair records and support tickets.

## Document forensics

```bash
exiftool -a -u -G1 doc.pdf
pdfinfo doc.pdf; pdftotext doc.pdf -
unzip -p report.docx docProps/core.xml    # true author + revision history
```

Office documents carry the **real author**, the last-modified-by, the company template, and the
editing timeline — often more useful than the visible content.

## Timezone inference

| Source | Signal |
|---|---|
| EXIF timestamp + offset | device timezone at capture |
| Email/chat timestamps | sender timezone (but often the mail server's) |
| Commit timestamps | author timezone |
| Social post times | usually UTC-normalised |
| Payment/billing addresses | country |
| Phone country code | region |

A subject whose stated timezone differs from their activity timezone is a location signal worth
recording — state the rule you used.

## Image and video geolocation

- Reverse-image search on distinctive images (selfie backgrounds, signage, reflections).
- Sun/shadow position in a photo → approximate latitude and time of day.
- Shadow length + object size → rough dimensions of the location.
- Window/reflected signage in vehicle glass.
- EXIF present on some platforms and stripped on others — the presence/absence pattern itself is a
  device/OS clue.

## Address and property data

- Public property and land records: ownership, address, tenure, parcel size.
- Business registrations: registered address, directors.
- Reverse geocode a coordinate to the street and the neighbourhood.

## Cross-source triangulation

Combine signals and score them:

| Evidence | Confidence |
|---|---|
| GPS EXIF coordinates | verified (location at capture time) |
| Distinctive photo matched to a published location | verified |
| Property record for a named address | verified (ownership) |
| Self-declared city in a bio | inferred (self-reported) |
| Timezone from activity | inferred |
| Broad city from a carrier/IP lookup | candidate |

**Location of a photo is not location of a person.** Always label the distinction: `photo location`,
`declared location`, `inferred region`.

## Output

| Field | Content |
|---|---|
| Coordinates | lat/lon, source, timestamp |
| Derived address | street/city/country and how it was derived |
| Timezone | offset and how it was inferred |
| Anchors | camera serial, EXIF device, document author, printer |
| Confidence | per line |
| Note | whether the location is where the subject was, or where a device was |

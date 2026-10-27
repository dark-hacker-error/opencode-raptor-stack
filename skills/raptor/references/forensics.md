# Forensics — disk, memory, stego, metadata

Targets: a disk image, a memory dump, an image file, a document, an incident timeline.

## Golden rules (the whole discipline)

1. **Work on a copy.** Never the original. `sha256sum` the image and write the hash into the report.
2. **Hash everything produced.** A carved file without a hash is not evidence.
3. **Timeline first or last, never never.** It anchors every claim in the report.
4. **Output drives the next command.** `mmls` chooses `fls`; `fls` output chooses `icat` targets.

## 1. Disk image triage

```bash
sha256sum {img} > {out}/hash.txt                      # done FIRST, every time
mmls {img} > {out}/mmls.txt                           # partition map
fls -r -p -o {offset} {img} > {out}/fls.txt           # full recursive file listing
icat {img} -o {offset} {inode} > {out}/recovered.bin  # recover a specific inode
tsk_recover -e {img} {out}/carved/                    # bulk carve unallocated (deleted) files
photorec /d {out}/carve /rec {img}                    # raw carving without fs
scalpel -c /etc/scalpel/scalpel.conf -o {out}/scalpel {img}
bulk_extractor -o {out}/bulk {img}                    # emails, urls, exif, network strings
```

Deleted-but-present files are the highest-value find. `ils -e` lists
unallocated inodes; `icat` recovers.

## 2. Memory forensics (Volatility 2 and 3)

```bash
# v3 (python module paths)
python3 -m volatility3.cli -f {dump} windows.pslist > {out}/pslist3.txt
python3 -m volatility3.cli -f {dump} windows.malfind > {out}/malfind.txt
python3 -m volatility3.cli -f {dump} windows.netscan > {out}/netscan.txt
# v2 (snake_case plugins)
volatility -f {dump} imageinfo
volatility -f {dump} pslist
volatility -f {dump} malfind
```

Hollowed process = code in memory that is not in any file — **malfind is the first check**, strings usually miss it.
`netscan` gives the C2 list for the config-extraction step.

## 3. Steganography

```bash
steghide info {file}                                  # does it carry an embed?
steghide extract -sf {file} -p '<password>' -xf {out}/extracted.bin
outguess -r {file} {out}/extracted.bin
zsteg {file}                                          # LSB/structural on PNG/BMP
binwalk -e -C {out}/binwalk {file}                    # embedded payloads
exiftool -a -u -G1 {file} > {out}/exif.txt            # metadata strings
python3 ~/.raptor/tools/local/cipher_identify.py --data "@{out}/extracted.bin" --json
```

Password order: empty → `password` → `admin` → `123456` → `cyberchef` → `ctf` → the flag format's name.
A steghide "hit" is only real when the extracted bytes decode to something — always decode before
writing the finding.

For visual confirmation without a GUI, compute the LSB noise per color
plane and attach the ratios; noisy plane 0 means hidden plane.

## 4. Documents / metadata / timeline

```bash
exiftool -a -u -G1 {file} > {out}/meta.txt            # full metadata
exiftool -gps:all -a -u -b {file} > {out}/gps.txt     # GPS coordinates if any
python3 -c 'import zipfile,sys; print(zipfile.ZipFile(sys.argv[1]).read("docProps/core.xml").decode())' {docx_path}
fls -m {mount} -r {img} > {out}/mactime.csv            # body file
mactime -b {out}/mactime.csv > {out}/timeline.txt      # readable timeline
```

docx/xlsx/pptx are zip containers: `docProps/core.xml` shows **author**, `docProps/app.xml` shows
**editing application and duration**.

## 5. Registry / other artifacts (Windows images)

```bash
reglookup {img} /Windows/System32/config/SYSTEM > {out}/sys_reg.txt
hivexregedit --export {img} > {out}/regdump.txt
```

## 6. Evidence discipline specific to forensics

- the **image hash** inside the report header — chain-of-custody starts there
- every carved file → directory + hash + the command that carved it
- every timeline entry → backed by an inode/BFTS row you actually read
- **call out what is NOT present** (e.g., "no malfind hits, no netscan artifacts") — absence of an artifact is a finding, not a silence

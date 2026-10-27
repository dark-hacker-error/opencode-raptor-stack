# Crypto, hashes, classic ciphers, CTF arms

Targets: a password hash, a blob of base64/hex, a substitution cipher, an RSA public key, a CTF flag.

## Identification FIRST — wrong mode is wasted hours

Never crack before identifying.

```bash
python3 ~/.raptor/tools/local/hash_identify.py --data '<hash>' --json
# then cross-check with hashid / hashcat example hashes if both disagree
```

Hashcat modes you will reach for most:
`0` md5 · `100` sha1 · `1400` sha256 · `1700` sha512 · `3200` bcrypt · `1800` sha512-crypt
`500` md5-crypt/descrypt · `1000` NTLM · `400` phass/wordpress · `16500` JWT (secret only) · `22000` WPA-PBKDF2.

## 1. Cracking

```bash
# wordlist + rules
hashcat -a 0 -m {mode} {out}/hash.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule
john --format={format} --wordlist=/usr/share/wordlists/rockyou.txt {out}/hash.txt
# mask attack for a known shape
hashcat -a 3 -m 0 '{hash}' '?u?l?l?l?l?d?d?s' --increment
```

**A crack is a proof when you name the plaintext.** "Found a match" without it is a candidate only.
15 minutes with no crack is a result: report "hash does not expose a weak password, attack limits:
wordlist + best64 mask". Never burn the GPU further past that line without a new hypothesis.

## 2. Classic ciphers — identify, decode, verify

```bash
python3 ~/.raptor/tools/local/cipher_identify.py --data '<blob>' --json   # structure first
python3 ~/.raptor/tools/local/freq_analysis.py --text '<ciphertext>' --json # IoC + shift + subst key
python3 ~/.raptor/tools/local/cyberchef_ops.py --op base64-decode --data '<blob>'
python3 ~/.raptor/tools/local/cyberchef_ops.py --op rot13 --data '<blob>'
python3 ~/.raptor/tools/local/cyberchef_ops.py --op to-b85 / from-b85 / to-base32 / from-base32
python3 ~/.raptor/tools/local/cyberchef_ops.py --op xor --key '<key>' --data '<blob>'
```

Decision path:

1. printable after one decode hop? → done, the payload is the answer
2. IoC > 0.055 and english-like? → mono substitution → freq_analysis gives the proposed key → verify by decoding and looking for the flag format / common words
3. IoC in 0.042–0.055? → polyalphabetic → Vigenère / knife-chasing key → use the local `--op rotN` loop over key lengths
4. everything unprintable → XOR with common keys (`' '`, empty key, `0x42...`) then re-run identify
5. nothing → the cipher is not classic. look for a key in the challenge file paths

**Remember from any CTF**, the smallest hint is usually a file **name** ("secret_base64.png")
— metadata before brute force.

## 3. RSA — only prove, never guess

```bash
python3 ~/.raptor/tools/local/rsa_tool.py --n <N> --e <e> --c <c> --json
python3 ~/.raptor/tools/local/factor_db.py --n <N> --deadline 8      # trial/fermat/pollard-brent/p-1
python3 ~/.raptor/tools/local/rsa_tool.py --key public.pem           # parse PEM without external libs
python3 ~/.raptor/tools/local/rsa_tool.py --n <N1> --with-n <N2> ...  # shared-prime hunt (gcd)
openssl rsa -in private.pem -text -noout
```

Attack order by cheapest-first:

| weakness | test |
|---|---|
| tiny factor | trial division (factor_db does it) |
| close primes | fermat factorization |
| shared prime | gcd(N1,N2) |
| e=3, no padding | cube-root over the integers |
| small modulus (≤64 bits) | pollard-brent within the tool's deadline |
| p-1 smooth | pollard-p-1 |
| e small, d recoverable | Wiener (not implemented — cite it and move on) |

"Not factored in the deadline" is a result, write it as one — no "likely vulnerable" claims without math.
When the factor lands, **decrypt the ciphertext and show the plaintext** — that is the proof.

## 4. The honesty rule in crypto

- identify → crack/decode → **verify plaintext** → record the reproduction → report
- a decode that produced printable bytes that mean nothing is a **candidate**, not a finding
- factorization, shared-prime and small-e recoveries are honest math — show the numbers

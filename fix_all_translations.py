import os

path = os.path.join(r"C:\Projeler\Github\New Project NASA\frontend\src\app", "page.tsx")

with open(path, 'rb') as f:
    raw = f.read()

# Check encoding
print(f"File size: {len(raw)} bytes")
print(f"First bytes: {raw[:3]}")

# Check if BOM
if raw[:3] == b'\xef\xbb\xbf':
    print("UTF-8 BOM detected")
    content = raw[3:].decode('utf-8')
else:
    content = raw.decode('utf-8')

# Count occurrences
checks = [
    "CMAPSS Altyap",
    "Sequential Keras",
    "Custom Network",
    "Bozulma, anl",
    "simulasyon sayesinde",
]

for c in checks:
    count = content.count(c)
    print(f"  '{c}': found {count} times")

# Do the replacements
pairs = [
    # Landing page h3 titles - replace inner text only
    ('>CMAPSS Altyapısı</h3>', '>{t.landingCmapssTitle}</h3>'),
    ('>Sequential Keras</h3>', '>{t.landingKerasTitle}</h3>'),
    ('>Custom Network</h3>', '>{t.landingCustomTitle}</h3>'),
    # Landing page p descriptions
    (">Model, NASA'nın gerçeğe eşdeğer FD001 veritabanı ile eğitilmiş olup, 100 farklı motorun milyarlarca sensör satırını belleğinde tutar.</p>", ">{t.landingCmapssDesc}</p>"),
    (">Bozulma, anlık değil biriken bir süreçtir. Sistem tek bir saniyeye değil, motorun geriye dönük son 50 uçuş profilini inceleyerek hata tespiti yapar.</p>", ">{t.landingKerasDesc}</p>"),
    (">Canlı simulasyon sayesinde, dünyanın başka bir yerinden modelini hiç görmediğimiz bir jet motorunu ağa bağlayıp RUL ölçümü alabilirsiniz.</p>", ">{t.landingCustomDesc}</p>"),
    # Docs tab hardcoded label  
    ("> Bilişim Raporu Ve Altyapı", "> {t.docsLabel}"),
]

new_content = content
for old, new in pairs:
    if old in new_content:
        new_content = new_content.replace(old, new)
        print(f"REPLACED: {old[:40]}...")
    else:
        print(f"NOT FOUND: {old[:40]}...")

# Write back
if raw[:3] == b'\xef\xbb\xbf':
    with open(path, 'wb') as f:
        f.write(b'\xef\xbb\xbf' + new_content.encode('utf-8'))
else:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("\nDone!")

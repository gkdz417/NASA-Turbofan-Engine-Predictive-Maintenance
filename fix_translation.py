import os

path = r"C:\Projeler\Github\New Project NASA\frontend\src\app\page.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded TR strings with t objects
replacements = {
    "CMAPSS Altyapısı": "{t.landingCmapssTitle}",
    "Model, NASA'nın gerçeğe eşdeğer FD001 veritabanı ile eğitilmiş olup, 100 farklı motorun milyarlarca sensör satırını belleğinde tutar.": "{t.landingCmapssDesc}",
    "Sequential Keras": "{t.landingKerasTitle}",
    "Bozulma, anlık değil biriken bir süreçtir. Sistem tek bir saniyeye değil, motorun geriye dönük son 50 uçuş profilini inceleyerek hata tespiti yapar.": "{t.landingKerasDesc}",
    "Custom Network": "{t.landingCustomTitle}",
    "Canlı simulasyon sayesinde, dünyanın başka bir yerinden modelini hiç görmediğimiz bir jet motorunu ağa bağlayıp RUL ölçümü alabilirsiniz.": "{t.landingCustomDesc}"
}

new_content = content
for k, v in replacements.items():
    new_content = new_content.replace(k, v)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Translation fixed.")

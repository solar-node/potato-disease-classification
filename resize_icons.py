from PIL import Image
import os

source_image = "/Users/adityasingh/Desktop/Gemini_Generated_Image_y49whky49whky49w.png"
img = Image.open(source_image).convert("RGBA")

# Mobile App Android Icons
# mdpi: 48x48
# hdpi: 72x72
# xhdpi: 96x96
# xxhdpi: 144x144
# xxxhdpi: 192x192

mipmap_sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192
}

base_android_path = "mobile-app/android/app/src/main/res/mipmap-{}/ic_launcher.png"
base_android_round_path = "mobile-app/android/app/src/main/res/mipmap-{}/ic_launcher_round.png"

for dpi, size in mipmap_sizes.items():
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(base_android_path.format(dpi))
    resized.save(base_android_round_path.format(dpi))
    print(f"Saved {dpi} icons")

# Frontend Web Icons
frontend_public = "frontend/public"
favicon_size = 64
logo192_size = 192
logo512_size = 512

img.resize((favicon_size, favicon_size), Image.Resampling.LANCZOS).save(os.path.join(frontend_public, "favicon.ico"), format="ICO")
img.resize((logo192_size, logo192_size), Image.Resampling.LANCZOS).save(os.path.join(frontend_public, "logo192.png"))
img.resize((logo512_size, logo512_size), Image.Resampling.LANCZOS).save(os.path.join(frontend_public, "logo512.png"))

print("Saved frontend icons")

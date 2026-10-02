# Bugdrop Art Toy - Stable Generation Prompt Guide

**Goal:** Generate 7 remaining 3D vinyl art toy figures ("Bugs") that PERFECTLY match the aesthetic, proportions, lighting, and materials of the first 5 already generated.

## CRITICAL: Image-to-Image / ControlNet (Highly Recommended)
If your model supports image-to-image or ControlNet (Depth/Canny), you MUST use one of the existing Bug images (e.g., `bug_hacker.jpg` or `bug_aviator.jpg`) as the base structure. 
- **Denoising strength:** ~0.45 - 0.55 (enough to change clothes, but low enough to keep the exact silhouette and pedestal).
- **ControlNet:** Use a Depth map of the base image to lock the character's round head, small body, antennas, and circular concrete base in place.

---

## The Master Prompt
Use this exact base prompt, only swapping out the `[CLOTHING AND ACCESSORIES]` section for each specific character.

**Positive Prompt:**
> A high quality 3D render of a collectible vinyl art toy figure. A modern minimalist chibi cute monster blob. 
> EXACT FEATURES: Big perfectly round head, small chubby body, simple black dot eyes, no mouth, two black segmented bug antennas on top of the head. 
> MATERIALS: The character's skin is a matte beige clay finish, premium handcrafted designer toy look without gloss.
> CHARACTER DESIGN: The character is wearing [CLOTHING AND ACCESSORIES]. 
> SETTING: The figure is standing perfectly centered on a small, thin, round concrete pedestal. 
> ENVIRONMENT: Placed on an off-white neutral studio background with soft realistic photographic studio lighting, soft ambient occlusion, and a subtle floor shadow. 
> STYLE: Hyper-detailed, 8k resolution, clean minimalist aesthetic, PopMart style, Kaws style designer toy, octane render, unreal engine 5.

**Negative Prompt:**
> Mouth, nose, facial expressions, realistic human features, glossy skin, shiny skin, messy background, dramatic dark lighting, neon lights, floating, multiple characters, text, watermark, deformed, ugly, bad anatomy, out of frame.

---

## Character Variations (To insert in `[CLOTHING AND ACCESSORIES]`)

**1. Bug Chef**
> "a traditional white double-breasted chef's jacket, a tall white chef toque hat, and holding a giant shiny metal meat cleaver"

**2. Bug Detective**
> "a long dark high-tech cyber-detective coat, a glowing futuristic holographic monocle over one eye, and holding a glowing glass data tablet"

**3. Bug Scientist**
> "a white laboratory coat, large clear safety goggles pushed up onto its forehead, and holding a glowing green bubbling chemistry flask"

**4. Bug Cowboy**
> "a weathered brown leather wide-brimmed cowboy hat, a western style woven poncho, and silver spurs on its feet"

**5. Bug Samurai**
> "traditional black lacquered ronin armor, a partial lower-face mempo mask, and holding a glowing unsheathed katana sword"

**6. Bug Wizard**
> "a long dark blue starry wizard robe, a giant pointed wizard hat, and holding a twisted wooden staff with a glowing magical crystal at the top"

**7. Bug ??? (Mystery Secret Drop)**
> "absolutely no clothing. Instead of the beige clay material, the entire body and antennas are made of a hyper-reflective iridescent holographic rainbow chrome material, reflecting light like an oil slick or a black pearl. Hypnotic and luxurious."

---

## Consistency Checklist for the Human Operator
Before accepting a generated image, verify:
1. **Skin Tone:** Is the face/skin matte beige clay? (Except for the Mystery Bug).
2. **Face:** Are there exactly two black dot eyes? Is there NO mouth?
3. **Antennas:** Are there two black segmented antennas on the head?
4. **Base:** Is the character standing on the small round concrete puck?
5. **Lighting:** Is the background off-white/light grey with soft studio shadows? (No dark or moody backgrounds).

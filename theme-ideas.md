# 3D World — Theme Directions

The premise you already have: a poker table at the center, four "stations" around it (about, projects, experience, contact). What you're sensing — that it looks "amateur" — isn't really a graphics problem. It's a **commitment problem**. Stylized indie games beat AAA fidelity all the time because every pixel agrees with every other pixel. Right now your world is *almost* casino, *almost* notebook, *almost* gallery — and "almost" reads as cheap. Pick one and go all the way.

Below: 8 directions, each with the games to study, the rules, and how the four stations bend into them. At the bottom: my pick.

---

## 1. Theatrical noir — Kentucky Route Zero

**Look at:** Kentucky Route Zero, Inside, Lake Mungo

**The rule:** the world is a stage. Black void everywhere; only what's lit exists. Every station is a single dramatic spotlight on one object, surrounded by darkness. Camera moves like a play — long, deliberate, sometimes unmotivated. Subtitles appear at the bottom in a fixed frame.

**How it lands:**
- The poker table is already lit by a pendant. Lean in: the table is the only thing visible at first; stations literally fade up out of the dark when the camera moves to them
- Hard, single-source lighting per station. No fill. Long shadows
- A typed monologue appears as you approach each station, like a one-act play. ("HE PLAYED HIS HAND. THE DEALER NEVER LOOKED UP.")
- Color: 95% black. One warm light per scene. One accent that only blooms during interaction

**What this hides:** model fidelity (you can't see what's not lit). Texture detail (covered by darkness). Geometry crimes (silhouettes only).

**What this leans into:** atmosphere, copywriting, mood. Plays directly to your strength as a writer.

---

## 2. Diorama-on-a-shelf — Hitman GO

**Look at:** Hitman GO, Lara Croft GO, Tracks, Pikuniku, Mini Motorways

**The rule:** the world is a tabletop scene. Tilt-shift focus blur on the edges so it reads as a scale-model. Camera is far away, isometric, and rotates around the diorama. Lighting is soft, room-lit, like a study lamp on a model train layout.

**How it lands:**
- Pull the camera way out. Don't sit at the table — fly above the table. The whole portfolio is a 1:30 scale model
- Each station becomes a tiny diorama on its own little plinth around the central poker table. Library, gym, recording booth, mailroom — all fitting on a desk
- Tilt-shift effect (sharp center, blurred outer ring) does most of the visual work for free
- Wood grain on the surface beneath everything sells the toy scale

**What this hides:** simple geometry — toys are *supposed* to look low-poly. People will say "wow, look how detailed this is" instead of "those edges are soft."

**What this leans into:** miniature charm. Reads as carefully built rather than cheaply built.

---

## 3. Painted card — Hades / Disco Elysium

**Look at:** Hades, Disco Elysium, Bastion, Pyre, Don't Starve

**The rule:** treat 3D as a painted illustration. Thick black outlines on every object (rim shader). Texture details done with painterly brushstrokes — no clean PBR. Fog/grain/grit overlay across the whole scene. The world looks hand-painted by an actual person.

**How it lands:**
- Add a `Sobel` outline shader (cheap to ship, ~50 lines of GLSL)
- All textures get a paper-grain overlay
- Color story: warm dirty browns, ink black, single saturated accent (gold, blood-red)
- Each station has a "card" feel — like a Hades boon or a Disco Elysium thought cabinet

**What this hides:** low-poly geometry — it just becomes the brushstroke. Texture seams disappear under brushwork. Consistency between objects becomes paint, not models.

**What this leans into:** craft. Makes the whole site feel hand-made, even if technically it's just a shader.

---

## 4. Dollhouse pastel — Wes Anderson

**Look at:** Wes Anderson films (frame-by-frame), Untitled Goose Game's UI, Tunic

**The rule:** symmetry is law. Every camera angle is centered, frontal, or 45° clean. Pastel palette, slightly chalky. Mid-century display serifs everywhere. Numbered chapters. Title cards between every transition.

**How it lands:**
- Cabinet of Curiosities feel — the poker table is the "Receiving Room" of a strange building, and you walk through doors to get to other rooms (each station is a room)
- Title cards: "CHAPTER ONE: THE PLAYER'S RECORDS" appears in serifed yellow before About loads
- Pastel palette: dusty rose, mustard, sage, butter yellow, chalk white
- Every camera move is a clean push or a clean lateral pan — no free-cam

**What this hides:** simplicity. Wes Anderson's worlds are visually simple — they're carried by composition.

**What this leans into:** typography. You're already a careful writer. Title cards do half the work of the world.

---

## 5. PS1 / N64 — intentional retro

**Look at:** Lunacid, Crow Country, Signalis, Bloodborne PSX demake, Paratopic

**The rule:** lean into the limitations. Vertex wobble (real PS1 effect — vertices snap to integer positions causing jitter). Texture warping. 256-color palettes. Crunchy 240p resolution. Tank controls if you want to go all the way.

**How it lands:**
- The whole site renders to a 480×320 framebuffer then upscales. Looks INTENTIONALLY pixely
- Models stay low-poly because that's the period. Texture seams *should* be visible
- Soundtrack: MIDI / FM synth
- Casino theme works perfectly — Vegas in 1998

**What this hides:** literally everything. The "amateur" look becomes a deliberate aesthetic.

**What this leans into:** nostalgia. Younger viewers find it cool, older viewers find it familiar. Costs almost nothing to ship.

**Risk:** can read as a gimmick if not committed. You'd need to lean ALL the way — sound, fonts, UI, everything PS1.

---

## 6. Outer Wilds — tiny solar system

**Look at:** Outer Wilds, Astroneer, Two Point Hospital

**The rule:** every station is a planet. They're tiny. You don't walk between them — you fly. The whole world fits on a kitchen table.

**How it lands:**
- Poker table = the home base / sun
- Each station = a tiny planet floating in space around it
- About planet has a journal sticking out of it. Projects planet has a slot machine. Etc.
- Click a planet → camera flies to it, lands on the surface
- Skybox: deep navy with stars, soft glows around each planet

**What this hides:** the fact that each station is small. They're *supposed* to be — they're planets you orbit
.

**What this leans into:** delight. Nobody ever stops smiling at tiny floating planets.

---

## 7. Library / occult study — Layers of Fear, Control

**Look at:** Layers of Fear, Control, Rusty Lake series, The Lighthouse film

**The rule:** the world is one impossible building. Long hallways. Doors that lead to wrong rooms. Each station is a different room of the same building, but they connect impossibly. Brutalist or Victorian. Fog. Single window of light.

**How it lands:**
- The poker table is in a smoking parlor. Walk through a door → you're in a library (about). Walk through another → a boxing gym (experience). Etc.
- Architecture is the star. Geometry is mostly walls and doors, which are easy
- Lighting: one shaft of light per room, dust motes
- Type: Garamond, IM Fell, something old

**What this hides:** simple shapes. Walls and doors don't need to be detailed
.

**What this leans into:** mystery. The poker table starts feeling like a thing in a building, not a thing in space.

---

## 8. Casino Royale — go ALL the way on what's already there

**Look at:** Casino Royale (2006), Ocean's 11, Lucky Number Slevin, Cowboy Bebop

**The rule:** you're already on this path — commit. Late-night high-stakes private room. Black tie, single overhead pendant, velvet, polished mahogany, brass. Cigarette smoke. The dealer (you) is the unseen figure across the table. No casino floor — this is the back room with the *real* money.

**How it lands:**
- Visual rules: 95% near-black + 4% mahogany/burgundy + 1% pure gold. NO pink, NO neon
- Smoke particles drifting through the spotlight. Free atmosphere
- Each station is a piece of furniture in this same room — no portals to other places. Slot machine in the corner. Whiteboard becomes a chalkboard on the wall. Boxing gloves on a coat rack. Journal on a side table
- Camera moves like a film — slow dollies, hard cuts to close-ups, never free-cam
- Soundtrack: Bossa nova / late-night jazz quartet
- Type: Limelight (already picked) for headers; an old slab serif for body

**What this hides:** lack of a "world." You don't need a world — you have ONE ROOM, deeply rendered.

**What this leans into:** what you already have. Smallest amount of new art needed. The poker table's already the centerpiece.

---

## My pick

**#8 (Casino Royale, fully committed) layered with #1 (theatrical lighting).**

Reasons:
1. You're not starting from zero — the poker table already exists as the spine. The other directions need you to scrap and rebuild
2. The Casino Royale aesthetic is *defined* by darkness + a single warm spotlight. That's free graphics — you literally render less
3. The four stations don't need to be "rooms" anymore. They're props on the same table, in the same room. Smaller scope, tighter execution
4. Limelight on a velvet-lined crown is exactly that direction. You're already 80% there — you just have to delete the parts that aren't this (pink glow, neon strips, magenta carpet)

**Concrete rules if you commit:**
- Palette: `#000` black, `#1a0a08` mahogany, `#0c0c0c` velvet, `#e6c279` aged gold, `#c11022` deep crimson (used once, sparingly). Nothing else.
- Lighting: one warm tungsten pendant per object. Pure black void in between. No fill light, no ambient blue
- Type: Limelight for headers. Caslon, Garamond, or IM Fell English for body. JetBrains Mono only for system/UI text
- Camera: dolly-only. No orbit. Cuts between fixed positions (chair POV, dealer POV, station close-ups)
- Sound: a low jazz loop, glass clink, paper shuffle, chip click. No pop music

**What to delete first to get there:** the magenta neon side strips (already done), the pink crown glow (already done), the carpet color (already done), the rotating animal models in the home page nav, the bg-effects aurora blobs, the rainbow accent colors on each project. Pick *one* gold, kill the others.

If #8 doesn't move you: my second pick is **#2 (diorama)**, because it's the only other direction that doesn't require you to throw away the poker table.

---

## Quick way to test before committing

Before you do major work, try this 30-min experiment: take ONE screenshot of the seated table view. Open it in Photoshop / Affinity. Color-grade it down to true Casino Royale palette (literally desaturate everything except gold). If that mockup looks 5x better than the live site, you have your answer.

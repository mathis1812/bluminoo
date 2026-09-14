import "server-only";

/**
 * Prompts complets des gabarits « Worlds » (Minecraft, GTA V, LEGO).
 *
 * Rédigés à la main, versionnés hors du code sous forme de fiches JSON de
 * design ; c'est leur texte final qui vit ici. Contrairement aux autres
 * catégories, ces trois-là ne passent pas par un builder de `place-prompt`
 * — un style d'univers a besoin de consignes trop spécifiques (blocs,
 * illustration peinte, briques) pour tenir dans un socle générique.
 *
 * Jamais exposés au client : importés uniquement par `lib/template-prompts`,
 * lui-même `server-only`. Cf. `lib/templates.ts` pour la règle générale.
 *
 * Chaque prompt verrouille explicitement le cadrage de sortie sur celui de
 * la photo source : `generateGeminiImage` passe aussi `imageConfig.aspectRatio`,
 * mais la consigne texte reste utile comme second garde-fou.
 */

/**
 * Réécrit le 09/09 à partir du rendu de référence (photo d'origine + résultat
 * usenoway, lac de Braies). La version précédente décrivait un Minecraft
 * générique ; la comparaison a montré quatre écarts qui expliquaient les
 * mauvais rendus :
 *
 * — elle imposait de l'herbe au sol, là où la référence GARDE le matériau
 *   d'origine (une rive de gravier reste du gravier) ;
 * — elle demandait des blocs d'eau, là où la référence garde une surface
 *   liquide et réfléchissante, et ne cube que le fond immergé ;
 * — elle exigeait des arêtes dures et une texture 16×16, là où la référence
 *   a une texture fine et laisse aux reliefs lointains leur silhouette
 *   réelle ;
 * — elle ne disait rien de l'ombre portée par le sujet, que la référence
 *   conserve et projette sur les blocs.
 *
 * Le principe directeur est désormais « reconstruire CE lieu », pas
 * « fabriquer un monde Minecraft » : c'est la fidélité au décor qui était
 * demandée.
 */
export const MINECRAFT_WORLD_PROMPT = `Rebuild the environment of this photograph as a Minecraft world, and composite the original person into it untouched.

THE PERSON — DO NOT EDIT. Keep them exactly as photographed: same face, skin, hair, glasses, jewellery, every garment with its exact colour, fabric, folds and creases, whatever they hold in their hands, their footwear, their precise pose, the angle of their head, and their position and scale in the frame. They remain a real photograph — never stylised, blockified, redrawn, smoothed or relit. Keep the shadow they cast: same direction, same length, same softness, now falling across the rebuilt ground.

KEEP THE SAME PLACE. Do not invent a new landscape. Read the real geometry of this location — the line of the shore, the slope of the ground, the ridgelines of the mountains, the edge of the treeline, the position of every object — and rebuild THAT in blocks. Someone who knows this place must still recognise it. Same camera angle, same framing, same crop, same aspect ratio as the input photograph: no zoom, no added borders or padding, no recomposition.

HOW TO BLOCKIFY. Build the terrain from cubic voxel blocks on a single consistent grid, with clean stepped edges where surfaces meet. Use the material that is ALREADY THERE: a gravel shore stays gravel, stone stays stone, grass stays grass, sand stays sand, a rock face stays rock. Never substitute grass for a surface that is not grass. Block faces carry a fine, dense pixel texture — like a high-resolution texture pack — not large flat areas of colour. Ground close to the camera shows full, readable cubes; distant terrain keeps its true silhouette with only its edges stepping into blocks.

WATER STAYS WATER. The surface of any lake, river or sea remains a smooth, flat, reflective plane — do not cube the surface. It mirrors the rebuilt mountains, trees and sky. Below the waterline, the submerged ground reads as translucent blocks fading into the depth. That contrast between a liquid surface and a blocky bed is essential to the look.

VEGETATION AND OBJECTS. Trees become cubic canopies of layered leaf blocks on block trunks, planted where the real trees stand and following the same treeline and density. Low vegetation becomes flat cross-shaped sprites of grass tufts and small flowers, sparse, and only where vegetation already grows. Boats, vehicles and man-made objects are rebuilt as simple block models in their exact original positions, at their original scale; if people were aboard, they may appear as small blocky figures.

LIGHT AND ATMOSPHERE. Keep the sun exactly where it is — same direction, same height, same warmth — and keep every shadow in the scene pointing the same way as in the original. The sky stays a smooth photographic gradient, never voxelised, with its original colours and time of day. Add gentle aerial haze over distant blocks so the depth of the landscape still reads.

RENDER QUALITY. A cinematic, high-fidelity 3D render: soft global illumination, ambient occlusion settling into the seams between blocks, accurate reflections on the water, crisp contact shadows under every raised block, subtle depth of field on the far terrain, and the person in sharp focus. This is a rendered world — not flat pixel art, and not a filter applied over the photograph.

The final image contains only the person and the rebuilt world: no game interface, no hotbar, no crosshair, no health or hunger bar, no text, no logo, no watermark, and no added characters or creatures beyond people already present in the original photo.`;

/**
 * ⚠️ ESSAI 04/09 — remplacé par la requête du produit de référence, 51
 * caractères contre 4 084 pour la version précédente.
 *
 * L'ancien prompt (fiche `los_santos_game` v2.0.0, fourni par le
 * propriétaire) décrivait en sept sections la personne, la scène, les
 * étiquettes de props, l'étalonnage, le HUD et la qualité de rendu. Son
 * rendu a été jugé mauvais à l'usage. Le texte complet reste récupérable
 * dans l'historique git, commit précédant celui-ci.
 *
 * Ce qui est mis à la place est le `userQuery` d'usenoway, verbatim — donc
 * en français et à la première personne. Attention : ce n'est PAS leur
 * prompt serveur, qui reste invisible ; c'est l'intention utilisateur que
 * leur front envoie à leur backend. On teste donc « la formulation la plus
 * courte possible », pas « exactement ce qu'ils envoient au modèle ».
 *
 * Le pari repose sur ce qu'on a constaté le même jour sur les swaps
 * véhicule : raccourcir de 456 à 132 caractères n'a rien dégradé, et
 * l'essentiel du défaut venait d'ailleurs. À juger sur des rendus réels.
 *
 * Le contrôle qualité de `gta-5` a été retiré en même temps : son
 * `retrySuffix` redemandait le HUD et les shaders, il aurait réinjecté à la
 * première régénération tout ce qu'on retire ici.
 */
export const GTA5_WORLD_PROMPT = `Transforme ma photo en capture d'écran du jeu GTA 5`;

export const LEGO_WORLD_PROMPT = `Rebuild this entire photograph as a scene made of real LEGO bricks, photographed like an official LEGO set render.

TURN THE PERSON INTO A LEGO MINIFIGURE while keeping them recognizable: a classic minifigure body — cylindrical head, C-shaped claw hands, short legs, blocky torso — but printed and colored to match this specific person. Keep the same skin tone as the minifigure head color, the same hairstyle and hair color rebuilt as a moulded LEGO hair piece or hat, and the same outfit reproduced as printed torso and leg decoration with matching colors. Keep the same pose as far as a minifigure's joints allow, the same head angle, and the same position, size and framing in the image. Do not change the camera angle or crop. Output the final image in the exact same aspect ratio, framing and crop as the input photograph — no cropping, no zooming, no added borders, bars or padding, no change to the composition.

REBUILD EVERYTHING ELSE IN BRICKS: reconstruct the whole environment out of visible LEGO elements — standard bricks, plates, tiles, slopes and specialty parts — with glossy injection-moulded plastic material, visible studs on exposed top surfaces, small sprue marks and fine mould seams, and the slight imperfect alignment of a hand-built model. Follow the real layout of the original scene closely so it reads as the same place rebuilt in LEGO. Ground becomes baseplates and tiles, terrain becomes stepped brick slopes, vegetation becomes LEGO plant pieces (leaf parts, flower studs, tree assemblies), water becomes trans-blue plates and tiles, vehicles become brick-built models.

ADAPT TO WHAT YOU SEE: city scenes use LEGO City parts, walls, windows and road plates; nature scenes use green baseplates, brick rockwork and LEGO trees; beaches use tan plates and trans-blue water; interiors use brick walls, tiled floors, brick-built furniture and printed decoration.

SKY AND LIGHT: keep the sky as a smooth photographic studio backdrop matching the original colors, not brick-built. Preserve the original lighting direction, warmth and shadow direction, rendered as clean product-photography light with soft shadows and gentle specular highlights on the plastic.

FINISH: crisp LEGO set box-art render — macro product photography look, shallow depth of field with the minifigure in sharp focus and the far bricks slightly soft, soft global illumination, subtle contact shadows under every brick, light bloom on glossy edges.

The final image contains only the minifigure and the brick-built world: no game interface, no LEGO logo, no set number, no text, no watermark, no real humans.`;

/**
* | output |
* | --- |
* | "{count} meshes" |
*
* @param {Player_Overlay_MeshesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const player_overlay_meshes: ((inputs: Player_Overlay_MeshesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Player_Overlay_MeshesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Player_Overlay_MeshesInputs = {
    count: NonNullable<unknown>;
};

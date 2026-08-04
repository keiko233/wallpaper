/**
* | output |
* | --- |
* | "Audio" |
*
* @param {Library_Kind_AudioInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_audio: ((inputs?: Library_Kind_AudioInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Kind_AudioInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Kind_AudioInputs = {};

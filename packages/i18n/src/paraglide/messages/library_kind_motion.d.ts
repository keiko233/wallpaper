/**
* | output |
* | --- |
* | "Motions" |
*
* @param {Library_Kind_MotionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_motion: ((inputs?: Library_Kind_MotionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Kind_MotionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Kind_MotionInputs = {};

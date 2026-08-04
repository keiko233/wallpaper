/**
* | output |
* | --- |
* | "Videos" |
*
* @param {Library_Kind_VideoInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_video: ((inputs?: Library_Kind_VideoInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Kind_VideoInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Kind_VideoInputs = {};

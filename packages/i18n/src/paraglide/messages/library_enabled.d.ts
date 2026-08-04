/**
* | output |
* | --- |
* | "Enabled" |
*
* @param {Library_EnabledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_enabled: ((inputs?: Library_EnabledInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_EnabledInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_EnabledInputs = {};

/**
* | output |
* | --- |
* | "No resources are installed on this device." |
*
* @param {Library_None_InstalledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_none_installed: ((inputs?: Library_None_InstalledInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_None_InstalledInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_None_InstalledInputs = {};

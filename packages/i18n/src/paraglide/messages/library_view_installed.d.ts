/**
* | output |
* | --- |
* | "View installed resources" |
*
* @param {Library_View_InstalledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_view_installed: ((inputs?: Library_View_InstalledInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_View_InstalledInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_View_InstalledInputs = {};

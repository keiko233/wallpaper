/**
* | output |
* | --- |
* | "Installed" |
*
* @param {Library_Tab_InstalledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_tab_installed: ((inputs?: Library_Tab_InstalledInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Tab_InstalledInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Tab_InstalledInputs = {};

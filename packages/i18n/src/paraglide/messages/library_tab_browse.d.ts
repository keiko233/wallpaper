/**
* | output |
* | --- |
* | "Browse" |
*
* @param {Library_Tab_BrowseInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_tab_browse: ((inputs?: Library_Tab_BrowseInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Tab_BrowseInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Tab_BrowseInputs = {};

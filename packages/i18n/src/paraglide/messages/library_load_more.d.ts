/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Library_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_load_more: ((inputs?: Library_Load_MoreInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Load_MoreInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Load_MoreInputs = {};

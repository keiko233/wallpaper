/**
* | output |
* | --- |
* | "Keep installed resources" |
*
* @param {Library_Keep_Installed_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_keep_installed_resources: ((inputs?: Library_Keep_Installed_ResourcesInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Keep_Installed_ResourcesInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Keep_Installed_ResourcesInputs = {};

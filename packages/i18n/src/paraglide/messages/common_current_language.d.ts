/**
* | output |
* | --- |
* | "English" |
*
* @param {Common_Current_LanguageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const common_current_language: ((inputs?: Common_Current_LanguageInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Common_Current_LanguageInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Common_Current_LanguageInputs = {};

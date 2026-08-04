/**
* | output |
* | --- |
* | "The default resource source provides resources contributed by community third parties. Please review the agreement below before using it." |
*
* @param {Web_Eula_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_description: ((inputs?: Web_Eula_DescriptionInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Eula_DescriptionInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Eula_DescriptionInputs = {};

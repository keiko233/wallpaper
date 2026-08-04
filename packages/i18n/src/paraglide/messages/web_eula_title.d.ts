/**
* | output |
* | --- |
* | "Community Resource Usage Agreement" |
*
* @param {Web_Eula_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_title: ((inputs?: Web_Eula_TitleInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Eula_TitleInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Eula_TitleInputs = {};

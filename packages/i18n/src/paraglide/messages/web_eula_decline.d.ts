/**
* | output |
* | --- |
* | "Decline" |
*
* @param {Web_Eula_DeclineInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_decline: ((inputs?: Web_Eula_DeclineInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Eula_DeclineInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Eula_DeclineInputs = {};

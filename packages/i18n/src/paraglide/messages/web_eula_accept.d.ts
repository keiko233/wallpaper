/**
* | output |
* | --- |
* | "I agree" |
*
* @param {Web_Eula_AcceptInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const web_eula_accept: ((inputs?: Web_Eula_AcceptInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Web_Eula_AcceptInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Web_Eula_AcceptInputs = {};

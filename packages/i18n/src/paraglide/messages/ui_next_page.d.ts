/**
* | output |
* | --- |
* | "Go to next page" |
*
* @param {Ui_Next_PageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_next_page: ((inputs?: Ui_Next_PageInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ui_Next_PageInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ui_Next_PageInputs = {};

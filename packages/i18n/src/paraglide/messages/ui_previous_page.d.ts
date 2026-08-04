/**
* | output |
* | --- |
* | "Go to previous page" |
*
* @param {Ui_Previous_PageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_previous_page: ((inputs?: Ui_Previous_PageInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ui_Previous_PageInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ui_Previous_PageInputs = {};

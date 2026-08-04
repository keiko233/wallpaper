/**
* | output |
* | --- |
* | "breadcrumb" |
*
* @param {Ui_BreadcrumbInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_breadcrumb: ((inputs?: Ui_BreadcrumbInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ui_BreadcrumbInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ui_BreadcrumbInputs = {};

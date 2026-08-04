/**
* | output |
* | --- |
* | "Sidebar" |
*
* @param {Ui_SidebarInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_sidebar: ((inputs?: Ui_SidebarInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ui_SidebarInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ui_SidebarInputs = {};

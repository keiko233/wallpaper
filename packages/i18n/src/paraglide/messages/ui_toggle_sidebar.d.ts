/**
* | output |
* | --- |
* | "Toggle Sidebar" |
*
* @param {Ui_Toggle_SidebarInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const ui_toggle_sidebar: ((inputs?: Ui_Toggle_SidebarInputs, options?: {
    locale?: "en" | "zh";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ui_Toggle_SidebarInputs, {
    locale?: "en" | "zh";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ui_Toggle_SidebarInputs = {};

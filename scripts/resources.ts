import { main } from "@wallpaper/resource-catalog/cli";

const [command, ...arguments_] = process.argv.slice(2);
const normalizedCommand = command === "publish" ? "publish-r2" : command;

await main([normalizedCommand, ...arguments_]);

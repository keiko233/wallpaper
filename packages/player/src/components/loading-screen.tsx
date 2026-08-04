import { Metaballs } from "@paper-design/shaders-react";
import { m } from "@wallpaper/i18n";
import { cn } from "@wallpaper/ui/utils";
import { motion } from "motion/react";

export const LOADING_SCREEN_EXIT_DURATION_MS = 500;

export function LoadingScreen({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "fixed inset-0 z-40 overflow-hidden bg-background",
        className,
      )}
      exit={{ opacity: 0, scale: 1.04 }}
      initial={false}
      transition={{
        duration: LOADING_SCREEN_EXIT_DURATION_MS / 1_000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Metaballs
        className="size-full"
        colorBack="#000000b8"
        colors={["#6e33cc", "#ff5500", "#ffc105", "#f585ff"]}
        count={10}
        scale={1.25}
        size={0.75}
        speed={0.5}
      />
      <div className="absolute inset-x-0 bottom-[14vh] flex justify-center">
        <div className="rounded-full bg-black/30 px-5 py-2 backdrop-blur-md">
          <p className="text-xs font-semibold tracking-[0.25em] text-white/80 uppercase">
            {m.player_status_loading()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

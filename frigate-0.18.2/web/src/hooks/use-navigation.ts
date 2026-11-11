import { ENV } from "@/env";
import { FrigateConfig } from "@/types/frigateConfig";
import { NavData } from "@/types/navigation";
import { useMemo } from "react";
import { isDesktop } from "react-device-detect";
import { FaCompactDisc, FaVideo } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { LuConstruction, LuCamera, LuScan, LuCar, LuSend, LuChartBar, LuHardDrive, LuSparkles } from "react-icons/lu";
import { MdCategory, MdChat, MdVideoLibrary } from "react-icons/md";
import { TbFaceId } from "react-icons/tb";
import useSWR from "swr";
import { useIsAdmin } from "./use-is-admin";

export const ID_LIVE = 1;
export const ID_REVIEW = 2;
export const ID_EXPLORE = 3;
export const ID_EXPORT = 4;
export const ID_PLAYGROUND = 5;
export const ID_FACE_LIBRARY = 6;
export const ID_CLASSIFICATION = 7;
export const ID_CHAT = 8;
export const ID_CAMERAS = 9;
export const ID_TRACKING = 10;
export const ID_VEHICLES = 11;
export const ID_TELEGRAM = 12;
export const ID_ANALYTICS = 13;
export const ID_STORAGE = 14;
export const ID_SETUP = 15;

export default function useNavigation(
  variant: "primary" | "secondary" = "primary",
) {
  const { data: config } = useSWR<FrigateConfig>("config", {
    revalidateOnFocus: false,
  });
  const isAdmin = useIsAdmin();

  const hasChatAgent = useMemo(
    () =>
      Object.values(config?.genai ?? {}).some((agent) =>
        agent?.roles?.includes("chat"),
      ),
    [config?.genai],
  );

  return useMemo(
    () =>
      [
        {
          id: ID_LIVE,
          variant,
          icon: FaVideo,
          title: "menu.live.title",
          url: "/",
        },
        {
          id: ID_REVIEW,
          variant,
          icon: MdVideoLibrary,
          title: "menu.review",
          url: "/review",
        },
        {
          id: ID_EXPLORE,
          variant,
          icon: IoSearch,
          title: "menu.explore",
          url: "/explore",
        },
        {
          id: ID_EXPORT,
          variant,
          icon: FaCompactDisc,
          title: "menu.export",
          url: "/export",
        },
        {
          id: ID_PLAYGROUND,
          variant,
          icon: LuConstruction,
          title: "menu.uiPlayground",
          url: "/playground",
          enabled: ENV !== "production",
        },
        {
          id: ID_CAMERAS,
          variant,
          icon: LuCamera,
          title: "menu.cameras",
          url: "/cameras",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_TRACKING,
          variant,
          icon: LuScan,
          title: "menu.tracking",
          url: "/tracking",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_VEHICLES,
          variant,
          icon: LuCar,
          title: "menu.vehicles",
          url: "/vehicles",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_TELEGRAM,
          variant,
          icon: LuSend,
          title: "menu.telegram",
          url: "/telegram",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_ANALYTICS,
          variant,
          icon: LuChartBar,
          title: "menu.analytics",
          url: "/analytics",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_STORAGE,
          variant,
          icon: LuHardDrive,
          title: "menu.storage",
          url: "/storage",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_SETUP,
          variant,
          icon: LuSparkles,
          title: "menu.setup",
          url: "/setup",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_FACE_LIBRARY,
          variant,
          icon: TbFaceId,
          title: "menu.faceLibrary",
          url: "/faces",
          enabled: isDesktop && config?.face_recognition.enabled && isAdmin,
        },
        {
          id: ID_CLASSIFICATION,
          variant,
          icon: MdCategory,
          title: "menu.classification",
          url: "/classification",
          enabled: isDesktop && isAdmin,
        },
        {
          id: ID_CHAT,
          variant,
          icon: MdChat,
          title: "menu.chat",
          url: "/chat",
          enabled: isDesktop && isAdmin && hasChatAgent,
        },
      ] as NavData[],
    [config?.face_recognition?.enabled, hasChatAgent, variant, isAdmin],
  );
}

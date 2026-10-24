import { mediaQuery } from "./useMediaQuery";
import { get } from "svelte/store";

export const useIsMobile = (): boolean => {
  return get(mediaQuery("(max-width: 767px)"));
};
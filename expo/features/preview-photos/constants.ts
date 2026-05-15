import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const PREVIEW_SCREEN_WIDTH = SCREEN_WIDTH;
export const PHONE_WIDTH = SCREEN_WIDTH - 80;
export const PHONE_HEIGHT = PHONE_WIDTH * 2.05;

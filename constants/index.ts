import { SidebarLink } from "@/types";

export const themes = [
  {
    value: "light",
    label: "Light",
    icon: "/assets/icons/sun.svg",
  },
  {
    value: "dark",
    label: "Dark",
    icon: "/assets/icons/moon.svg",
  },
];

export const sidebarLinks: SidebarLink[] = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/users.svg",
    route: "/community",
    label: "Community",
  },
  {
    imgURL: "/assets/icons/star.svg",
    route: "/collection",
    label: "Collection",
  },
  {
    imgURL: "/assets/icons/suitcase.svg",
    route: "/jobs",
    label: "Find Jobs",
  },
  {
    imgURL: "/assets/icons/user.svg",
    route: "/tags",
    label: "Tags",
  },
  {
    imgURL: "/assets/icons/user.svg",
    route: "/profile",
    label: "Profile",
  },
  {
    imgURL: "/assets/icons/question.svg",
    route: "/ask-question",
    label: "Ask Question",
  },
];

export const THEME_STORAGE_KEY = "theme";
export const GLOBAL_SEARCH_PARAMS_KEY = "global";
export const SEARCH_TYPE_PARAMS_KEY = "type";
export const QUERY_SEARCH_PARAMS_KEY = "q";
export const FILTER_SEARCH_PARAMS_KEY = "filter";
export const PAGE_NUMBER_SEARCH_PARAMS_KEY = "page";

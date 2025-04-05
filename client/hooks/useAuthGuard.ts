import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  exp: number;
}

export default function useUserAuth(): boolean {
  const token = Cookies.get("access-token");

  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (decoded.exp < currentTime) {
      Cookies.remove("access-token");
      return false;
    }

    return true;
  } catch {
    Cookies.remove("access-token");
    return false;
  }
}

import { permanentRedirect } from "next/navigation";
import { HOME_HUB } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";

export default function ChennaiShortcut() {
  permanentRedirect(explorePath.city(HOME_HUB.state, HOME_HUB.city));
}

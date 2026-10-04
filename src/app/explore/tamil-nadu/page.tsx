import { permanentRedirect } from "next/navigation";
import { HOME_HUB } from "@/lib/unis/geo";
import { explorePath } from "@/lib/unis/paths";

export default function TamilNaduShortcut() {
  permanentRedirect(explorePath.state(HOME_HUB.state));
}

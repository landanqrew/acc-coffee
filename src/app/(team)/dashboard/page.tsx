import { redirect } from "next/navigation";

// The Dashboard was retired in the Redesign-3 shell: its "Today's coffee" view
// folded into the top of Services, which is now the post-login home. The route
// stays reachable so old links/bookmarks resolve, but it's no longer a
// navigation destination — it just forwards to Services.
export default function DashboardPage() {
  redirect("/services");
}

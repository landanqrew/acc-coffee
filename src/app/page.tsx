import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

// Root is an entry point, not a page: signed-in members land on the
// dashboard, everyone else goes to sign-in.
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/signin");
}

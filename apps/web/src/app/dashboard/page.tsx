import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
  const session = await authClient.api.getSession();
  
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6">Dashboard</h1>
      <p>Welcome, {session.user.name || session.user.email}</p>
    </div>
  );
}

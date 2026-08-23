import GlassNav from "@/components/shared/GlassNav";
import SignOutButton from "@/components/shared/signout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <GlassNav
        links={[
          { label: "Dashboard", href: "/admin" },
          { label: "Events", href: "/admin/events" },
          { label: "Users", href: "/admin/users" },
          { label: "Reports", href: "/admin/reports" },
        ]}
        rightSlot={<SignOutButton />}
      />
      <div className="pt-24 sm:pt-28 pb-12">{children}</div>
    </div>
  );
}

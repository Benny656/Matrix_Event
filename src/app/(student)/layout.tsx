import GlassNav from "@/components/shared/GlassNav";
import SignOutButton from "@/components/shared/signout-button";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <GlassNav
        links={[
          { label: "Dashboard", href: "/student" },
          { label: "Events", href: "/student/events" },
          { label: "My Registrations", href: "/student/registrations" },
        ]}
        rightSlot={<SignOutButton />}
      />
      <div className="pt-24 sm:pt-28 pb-12">{children}</div>
    </div>
  );
}

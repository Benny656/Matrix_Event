import GlassNav from "@/components/shared/GlassNav";
import SignOutButton from "@/components/shared/signout-button";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <GlassNav
        links={[
          { label: "Dashboard", href: "/volunteer" },
          { label: "Events", href: "/volunteer/events" },
          { label: "Attendance", href: "/volunteer/attendance" },
        ]}
        rightSlot={<SignOutButton />}
      />
      <div className="pt-24 sm:pt-28 pb-12">{children}</div>
    </div>
  );
}

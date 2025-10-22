import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Toaster />
      <span className="hidden md:block">{children}</span>
      <p className="md:hidden text-center mt-10 text-destructive">
        Please open the app on a bigger screen
      </p>
    </div>
  );
}

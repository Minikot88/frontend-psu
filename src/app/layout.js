import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "TRIUP PSU",
  description: "TRIUP PSU Web Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${ibmPlexSansThai.variable} antialiased`}>{children}</body>
    </html>
  );
}

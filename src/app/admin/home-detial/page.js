"use client";
import SidebarLayout from "@/components/SidebarLayout";

export default function AdminHome() {
  return (
    <SidebarLayout>
      <main className="min-h-screen w-full px-6 py-10 bg-white text-black">
        {/* MAIN WRAPPER */}
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <h1 className="text-3xl font-extrabold text-black">
            Admin Dashboard
          </h1>
          <p className="text-black/60 mt-1 mb-10">
            Welcome back! Here’s an overview of your system.
          </p>

          {/* GRID CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CARD */}
            <div className="p-6 rounded-2xl bg-white shadow-md border border-black/10 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
              <h2 className="text-lg font-semibold text-black ">over view</h2>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-md border border-black/10 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
              <h2 className="text-lg font-semibold text-black">update</h2>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-10 text-center text-black/50 text-xs">
          © {new Date().getFullYear()} Prince of Songkla University
        </footer>
      </main>
    </SidebarLayout>
  );
}

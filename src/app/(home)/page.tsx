// src/app/page.tsx
import { LogOutButton } from "@/components/web/auth/logOutButton";
import { DataTable } from "@/components/web/dataTable/data-table";
import { columns, type Chalani } from "@/components/web/dataTable/columns";
import { requireAuth } from "@/lib/authUtils";
import { prisma } from "@/lib/prisma";

async function getData(): Promise<Chalani[]> {
  const rows = await prisma.chalani.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Dates aren't serializable across the server → client boundary.
  return rows.map((r) => ({
    id: r.id,
    chalaniNumber: r.chalaniNumber,
    personName: r.personName,
    imageUrls: r.imageUrls,
    createdAt: r.createdAt.toISOString(),
  }));
}

export default async function Home() {
  const session = await requireAuth();
  const data = await getData();

  return (
    <div className="bg-background w-full min-h-svh">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Chalani
            </span>
          </div>
          <LogOutButton />
        </div>
      </header>

      {/* Main */}
      <main className="">
        {/* Greeting */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session.user.name ?? session.user.email}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s a list of all chalani records you&apos;ve uploaded.
          </p>
        </section>

        {/* Records */}
        <section className="">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Records</h2>
              <p className="text-muted-foreground text-sm">
                {data.length === 0
                  ? "No records yet."
                  : `${data.length} record${data.length === 1 ? "" : "s"} in total.`}
              </p>
            </div>
          </div>

          <DataTable columns={columns} data={data} />
        </section>
      </main>
    </div>
  );
}

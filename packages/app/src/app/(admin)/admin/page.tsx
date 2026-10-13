import Link from "next/link";
import { connection } from "next/server";

import { checkDbConnection } from "@plant-ai/core";
import { Badge } from "@plant-ai/ui/components/badge";
import { Button } from "@plant-ai/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plant-ai/ui/components/card";

export default async function AdminDashboardPage() {
  // Database reads happen per request, never at build time.
  await connection();
  const db = await checkDbConnection();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>System status</CardTitle>
          <CardDescription>Live health of Plant.AI&apos;s backing services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span>Database</span>
            {db.ok ? (
              <Badge variant="default">Connected</Badge>
            ) : (
              <Badge variant="destructive" title={db.reason}>
                Unavailable
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Gardens</CardTitle>
          <CardDescription>Create and manage gardens stored in PostgreSQL.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/gardens">Manage gardens</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

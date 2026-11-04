import { connection } from "next/server";

import { checkDbConnection } from "@plantai/core";
import { Badge } from "@plantai/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plantai/ui/components/ui/card";

/**
 * System status only, public on purpose (spec A): it shows what `/api/health`
 * shows and holds no user data. Gardens are managed by their owners in the app.
 */
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
    </div>
  );
}

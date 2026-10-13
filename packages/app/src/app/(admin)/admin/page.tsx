import Link from "next/link";

import { Button } from "@plant-ai/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plant-ai/ui/components/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
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

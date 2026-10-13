import type { Metadata } from "next";
import { connection } from "next/server";

import { Button } from "@plant-ai/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@plant-ai/ui/components/card";
import { Input } from "@plant-ai/ui/components/input";
import { Label } from "@plant-ai/ui/components/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plant-ai/ui/components/table";

import { withRequestScope } from "@/server/request-scope";

import { createGardenAction } from "./actions";

export const metadata: Metadata = { title: "Gardens" };

export default async function GardensPage() {
  // Database reads happen per request, never at build time.
  await connection();
  const gardens = await withRequestScope(({ gardenService }) => gardenService.list());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Gardens</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>New garden</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGardenAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={120} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            <Button type="submit" className="justify-self-start">
              Create garden
            </Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gardens.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                No gardens yet.
              </TableCell>
            </TableRow>
          ) : (
            gardens.map((garden) => (
              <TableRow key={garden.id}>
                <TableCell className="font-medium">{garden.name}</TableCell>
                <TableCell>{garden.description}</TableCell>
                <TableCell>{garden.createdAt.toLocaleString("en-GB")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

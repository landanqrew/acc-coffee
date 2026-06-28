import type { Metadata } from "next";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { StatusPill } from "@/components/ui/status-pill";
import { Field } from "@/components/ui/field";

export const metadata: Metadata = {
  title: "UI kit · acc-coffee",
  description: "Core UI primitives in the church royal-blue design language.",
};

// Demo route exercising the shared primitives (issue #26). Not linked from the
// app shell — a reference surface for the component grammar.
export default function UiKitPage() {
  return (
    <main className="min-h-full bg-app p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight">UI kit</h1>
          <p className="text-sm text-muted-foreground">
            Core primitives — Button, Card, Pill, StatusPill, Field.
          </p>
        </header>

        <Card elevation="lift" className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Plus className="h-4 w-4" /> Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="link">
              Click here <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Add">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        <Card elevation="lift" className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pills &amp; status
          </h2>
          <div className="flex flex-wrap gap-2">
            <Pill tone="accent">Special</Pill>
            <Pill>Archived</Pill>
            <Pill mono>WATER</Pill>
            <StatusPill status="ok">OK</StatusPill>
            <StatusPill status="warn">Low</StatusPill>
            <StatusPill status="danger">Out</StatusPill>
          </div>
        </Card>

        <Card elevation="lift" className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fields
          </h2>
          <Field label="Supply name" placeholder="House blend" />
          <Field
            label="On hand (lb)"
            mono
            inputMode="decimal"
            defaultValue="3.5"
            help="Par level is 5 lb."
          />
          <Field
            label="Email"
            defaultValue="not-an-email"
            error="Enter a valid email address."
          />
        </Card>

        <Card className="text-sm text-muted-foreground">
          Cards are lifted white surfaces on the app background — depth, not
          borders.
        </Card>
      </div>
    </main>
  );
}

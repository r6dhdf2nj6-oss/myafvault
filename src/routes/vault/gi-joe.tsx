import { createFileRoute } from "@tanstack/react-router";
import { FranchiseCatalogue } from "@/components/figures/franchise-catalogue";

export const Route = createFileRoute("/vault/gi-joe")({
  component: GiJoeVaultPage,
});

function GiJoeVaultPage() {
  return <FranchiseCatalogue franchiseId="gi-joe" />;
}

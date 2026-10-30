import { createFileRoute } from "@tanstack/react-router";
import { FranchiseCatalogue } from "@/components/figures/franchise-catalogue";

export const Route = createFileRoute("/vault/fallout")({
  component: FalloutVaultPage,
});

function FalloutVaultPage() {
  return <FranchiseCatalogue franchiseId="fallout" />;
}

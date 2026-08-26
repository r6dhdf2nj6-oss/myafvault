import { createFileRoute } from "@tanstack/react-router";
import { FranchiseCatalogue } from "@/components/figures/franchise-catalogue";

export const Route = createFileRoute("/vault/dc-mcfarlane")({
  component: DcVaultPage,
});

function DcVaultPage() {
  return <FranchiseCatalogue franchiseId="dc" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { FranchiseCatalogue } from "@/components/figures/franchise-catalogue";

export const Route = createFileRoute("/vault/lego")({
  component: LegoVaultPage,
});

function LegoVaultPage() {
  return <FranchiseCatalogue franchiseId="lego" />;
}

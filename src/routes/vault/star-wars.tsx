import { createFileRoute } from "@tanstack/react-router";
import { FranchiseCatalogue } from "@/components/figures/franchise-catalogue";

export const Route = createFileRoute("/vault/star-wars")({
  component: StarWarsVaultPage,
});

function StarWarsVaultPage() {
  return <FranchiseCatalogue franchiseId="star-wars" />;
}

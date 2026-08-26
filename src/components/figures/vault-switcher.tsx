import { Link, useNavigate } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import {
  VAULT_PICKER_PATH,
  getLiveFranchises,
  rememberSessionVault,
  type FranchiseVaultPath,
} from "@/lib/franchises";

const PICKER_VALUE = "all-vaults";

export function VaultSwitcher({
  currentPath,
}: {
  currentPath: FranchiseVaultPath | string;
}) {
  const navigate = useNavigate();
  const live = getLiveFranchises();

  function onChange(value: string) {
    if (value === PICKER_VALUE) {
      void navigate({ to: VAULT_PICKER_PATH });
      return;
    }
    rememberSessionVault(value);
    void navigate({ to: value as FranchiseVaultPath });
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <label
        htmlFor="vault-switcher"
        className="hidden items-center gap-1.5 text-xs font-medium text-muted sm:inline-flex"
      >
        <Layers className="h-4 w-4 shrink-0 text-primary" />
        Switch vault
      </label>
      <select
        id="vault-switcher"
        aria-label="Switch vault"
        value={currentPath}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 max-w-[13.5rem] rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-sm font-medium text-fg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {live.map((f) =>
          f.path ? (
            <option key={f.id} value={f.path}>
              {f.shortLabel}
            </option>
          ) : null,
        )}
        <option value={PICKER_VALUE}>All vaults</option>
      </select>
      <Link
        to={VAULT_PICKER_PATH}
        className="text-xs font-medium text-muted hover:text-fg"
      >
        All vaults
      </Link>
    </div>
  );
}

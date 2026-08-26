import { Link, useNavigate } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import {
  FRANCHISES,
  VAULT_PICKER_PATH,
  getLiveFranchises,
  rememberSessionVault,
  type FranchiseVaultPath,
} from "@/lib/franchises";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PICKER_VALUE = "all-vaults";

export function VaultSwitcher({
  currentPath,
}: {
  currentPath: FranchiseVaultPath | string;
}) {
  const navigate = useNavigate();
  const live = getLiveFranchises();
  const current =
    live.find((f) => f.path === currentPath) ??
    FRANCHISES.find((f) => f.path === currentPath);

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
      <Layers className="hidden h-4 w-4 shrink-0 text-primary sm:block" />
      <Select value={currentPath} onValueChange={onChange}>
        <SelectTrigger
          className="h-9 w-[10.5rem] sm:w-[13.5rem]"
          aria-label="Switch vault"
        >
          <SelectValue placeholder={current?.shortLabel ?? "Switch vault"} />
        </SelectTrigger>
        <SelectContent align="start">
          {live.map((f) =>
            f.path ? (
              <SelectItem key={f.id} value={f.path}>
                {f.shortLabel}
              </SelectItem>
            ) : null,
          )}
          <SelectItem value={PICKER_VALUE}>All vaults</SelectItem>
        </SelectContent>
      </Select>
      <Link
        to={VAULT_PICKER_PATH}
        className="hidden text-xs font-medium text-muted hover:text-fg sm:inline"
      >
        All vaults
      </Link>
    </div>
  );
}

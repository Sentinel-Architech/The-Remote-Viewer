import { DUST_UNSET, IN_APP_TOKEN_NAME } from "@/lib/trv/viewer-locks";

export function TrvTokenNotice({ moreThanFree = false }: { moreThanFree?: boolean }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      <span className="font-medium text-fg">{IN_APP_TOKEN_NAME}</span>
      {". "}
      {DUST_UNSET}
      {moreThanFree ? " This account is a monthly subscriber, so it is marked for a bit more. The amount is not set." : ""}
    </p>
  );
}

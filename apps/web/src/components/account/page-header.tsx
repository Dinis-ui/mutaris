import * as React from "react";

interface AccountPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AccountPageHeader({ title, description, action }: AccountPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-balance text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-balance text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

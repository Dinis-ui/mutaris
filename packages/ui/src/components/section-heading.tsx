import * as React from "react";
import { cn } from "../lib/cn";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  align?: "left" | "center";
}

function SectionHeading({
  title,
  description,
  align = "left",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
      {...props}
    >
      <h2 className="text-balance text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-balance text-lg text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { SectionHeading };

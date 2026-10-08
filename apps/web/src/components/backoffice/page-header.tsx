export function BackofficePageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-balance text-2xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="text-balance text-base text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { EmptyState } from "@/components/account/empty-state";

export default function OrderNotFound() {
  return (
    <EmptyState
      icon={PackageSearch}
      title="Não encontrámos esta encomenda"
      description="A ligação pode estar incorreta ou a encomenda já não estar disponível na tua conta."
      actions={
        <Button asChild>
          <Link href="/conta/pedidos">Ver todas as encomendas</Link>
        </Button>
      }
    />
  );
}

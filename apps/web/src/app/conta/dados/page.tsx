import type { Metadata } from "next";
import { AccountPageHeader } from "@/components/account/page-header";
import { AddressesForm, BillingForm, PersonalDataForm } from "@/components/account/profile-forms";
import { getProfile } from "@/lib/customer-account";
import { requireUser } from "@/lib/customer-session-server";
import type { CustomerProfile } from "@workspace/types";

export const metadata: Metadata = { title: "Dados pessoais" };

export default async function ProfileDataPage() {
  const user = await requireUser();
  const saved = await getProfile(user.id);
  // Nome, email e telefone são reais; moradas e faturação ainda não existem na base de dados.
  const profile: CustomerProfile = {
    firstName: user.name.split(" ")[0] ?? user.name,
    fullName: saved?.name ?? user.name,
    email: saved?.email ?? user.email,
    phone: saved?.phone ?? "",
    addresses: [],
    billing: { name: "", taxId: "", street: "", postalCode: "", city: "" },
  };
  return (
    <>
      <AccountPageHeader
        title="Dados pessoais"
        description="Mantém os teus dados, moradas e informação de faturação sempre atualizados."
      />
      <PersonalDataForm profile={profile} />
      <AddressesForm profile={profile} />
      <BillingForm profile={profile} />
    </>
  );
}

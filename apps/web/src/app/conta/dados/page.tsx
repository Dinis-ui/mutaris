import type { Metadata } from "next";
import { AccountPageHeader } from "@/components/account/page-header";
import { AddressesForm, BillingForm, PersonalDataForm } from "@/components/account/profile-forms";
import { customerProfile } from "@/data/account";

export const metadata: Metadata = { title: "Dados pessoais" };

export default function ProfileDataPage() {
  return (
    <>
      <AccountPageHeader
        title="Dados pessoais"
        description="Mantém os teus dados, moradas e informação de faturação sempre atualizados."
      />
      <PersonalDataForm profile={customerProfile} />
      <AddressesForm profile={customerProfile} />
      <BillingForm profile={customerProfile} />
    </>
  );
}

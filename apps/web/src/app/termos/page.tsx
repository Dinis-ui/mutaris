import type { Metadata } from "next";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { LegalSection } from "@/components/legal/legal-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description: `Termos e Condições de utilização do website da ${siteConfig.name}.`,
};

const LAST_UPDATED = "[DATA DA ÚLTIMA ATUALIZAÇÃO]";

export default function TermsPage() {
  return (
    <Section>
      <Container className="flex flex-col gap-12">
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-4xl">
            Termos e Condições
          </h1>
          <p className="text-sm text-muted-foreground">Última atualização: {LAST_UPDATED}</p>
        </header>

        <div className="flex max-w-3xl flex-col gap-10">
          <LegalSection title="1. Introdução">
            <p>
              Estes Termos e Condições regulam o acesso e a utilização do website da{" "}
              {siteConfig.name} (“nós”, “a nossa empresa”), bem como, no futuro, a compra de
              produtos e soluções através deste site.
            </p>
            <p>
              Algumas funcionalidades aqui descritas — como criação de conta, encomendas,
              pagamentos, entregas ou devoluções — ainda estão em desenvolvimento e podem não
              estar disponíveis no site neste momento. Estes Termos descrevem também o
              funcionamento previsto quando essas funcionalidades forem lançadas, e serão
              atualizados sempre que necessário.
            </p>
            <p>
              Ao aceder ou utilizar este website, aceitas estes Termos e Condições. Se não
              concordares com algum deles, não deves utilizar o site.
            </p>
          </LegalSection>

          <LegalSection title="2. Utilização do website">
            <p>Ao utilizar este website, comprometes-te a:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Fornecer informação verdadeira e atualizada, sempre que te for pedida;</li>
              <li>
                Não utilizar o site para fins ilegais, fraudulentos ou que possam prejudicar o seu
                funcionamento ou o de terceiros;
              </li>
              <li>
                Não tentar aceder sem autorização a áreas, sistemas ou dados que não te sejam
                destinados.
              </li>
            </ul>
            <p>
              Reservamo-nos o direito de suspender ou limitar o acesso ao site, no todo ou em
              parte, em caso de utilização indevida.
            </p>
          </LegalSection>

          <LegalSection title="3. Produtos e informações apresentadas">
            <p>
              Procuramos que a informação sobre produtos e soluções apresentada no site —
              incluindo descrições, características e imagens — seja o mais rigorosa possível.
              Ainda assim, pode conter imprecisões ou estar incompleta, nomeadamente enquanto o
              catálogo estiver a ser construído.
            </p>
            <p>
              Alguns conteúdos apresentados no site podem ser meramente ilustrativos ou de
              demonstração, destinados a mostrar o funcionamento previsto de determinada área,
              sem corresponderem a produtos, preços ou soluções reais atualmente disponíveis.
              Sempre que isso acontecer, procuramos identificá-lo de forma clara.
            </p>
          </LegalSection>

          <LegalSection title="4. Preços e disponibilidade">
            <p>
              Quando a venda de produtos estiver disponível, os preços serão apresentados em
              euros (€) e incluirão os impostos aplicáveis, salvo indicação em contrário.
            </p>
            <p>
              Os preços e a disponibilidade dos produtos podem ser alterados a qualquer momento,
              sem aviso prévio, não constituindo uma oferta vinculativa até à confirmação de uma
              encomenda. [POLÍTICA DE PREÇOS A DEFINIR]
            </p>
          </LegalSection>

          <LegalSection title="5. Encomendas e pagamentos">
            <p>
              A funcionalidade de encomendas e pagamentos online ainda não está disponível neste
              site. Quando estiver, esta secção descreverá o processo de encomenda, os métodos de
              pagamento aceites e as condições de confirmação de cada encomenda.
            </p>
            <p>
              [DESCRIÇÃO DO PROCESSO DE ENCOMENDA E DOS MÉTODOS DE PAGAMENTO, A DEFINIR QUANDO A
              FUNCIONALIDADE ESTIVER DISPONÍVEL]
            </p>
          </LegalSection>

          <LegalSection title="6. Entregas e devoluções">
            <p>
              A funcionalidade de entregas ainda não está disponível neste site. Quando estiver,
              esta secção descreverá os prazos de entrega previstos, as transportadoras
              utilizadas e os custos de envio aplicáveis.
            </p>
            <p>
              O direito de livre resolução (devolução) em compras à distância, previsto na lei
              portuguesa para consumidores, será respeitado nos termos aplicáveis assim que a
              venda de produtos estiver disponível. [POLÍTICA DE DEVOLUÇÕES A DEFINIR]
            </p>
          </LegalSection>

          <LegalSection title="7. Garantias">
            <p>
              Quando a venda de produtos estiver disponível, os produtos vendidos através deste
              site beneficiarão das garantias legais aplicáveis em Portugal, nomeadamente as
              previstas no regime da garantia de bens de consumo.
            </p>
            <p>
              Informações específicas sobre prazos e condições de garantia de cada produto ou
              solução serão disponibilizadas junto do respetivo produto. [CONDIÇÕES DE GARANTIA A
              DEFINIR]
            </p>
          </LegalSection>

          <LegalSection title="8. Propriedade intelectual">
            <p>
              O conteúdo deste website — incluindo textos, imagens, logótipos, ícones e o
              design — é propriedade da {siteConfig.name} ou dos seus licenciadores, e está
              protegido pelas leis de propriedade intelectual aplicáveis.
            </p>
            <p>
              Não é permitida a reprodução, distribuição ou utilização deste conteúdo sem
              autorização prévia, exceto para uso pessoal e não comercial, nos termos permitidos
              por lei.
            </p>
          </LegalSection>

          <LegalSection title="9. Responsabilidades">
            <p>
              Procuramos manter o website disponível, atualizado e livre de erros, mas não
              garantimos que o seu funcionamento seja ininterrupto ou isento de falhas.
            </p>
            <p>
              Na medida permitida por lei, não nos responsabilizamos por danos resultantes da
              impossibilidade de acesso ou utilização do website, nem pelo conteúdo de sites de
              terceiros a que este site possa remeter.
            </p>
            <p>
              Nada nestes Termos exclui ou limita responsabilidades que não possam ser excluídas
              ou limitadas ao abrigo da lei portuguesa, nomeadamente em matéria de direitos dos
              consumidores.
            </p>
          </LegalSection>

          <LegalSection title="10. Contacto">
            <p>
              Para questões relacionadas com estes Termos e Condições, podes contactar-nos
              através de:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Email: [EMAIL DE CONTACTO]</li>
              <li>Morada: [MORADA DA EMPRESA]</li>
              <li>Entidade responsável: [NOME DA EMPRESA] [NIF]</li>
            </ul>
          </LegalSection>

          <LegalSection title="11. Alterações aos termos">
            <p>
              Podemos atualizar estes Termos e Condições sempre que necessário, nomeadamente para
              refletir novas funcionalidades do site ou alterações legais. A data da última
              atualização está indicada no topo desta página. Recomendamos que a consultes
              periodicamente.
            </p>
          </LegalSection>
        </div>
      </Container>
    </Section>
  );
}

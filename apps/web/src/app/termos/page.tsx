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
          <LegalSection title="1. Identificação e âmbito">
            <p>
              O presente website é propriedade e operado por [NOME DA EMPRESA / EMPRESÁRIO EM
              NOME INDIVIDUAL], NIF [NIF], com sede em [MORADA DA EMPRESA], contactável através de
              [EMAIL DE CONTACTO] ({siteConfig.name}, “nós”). [REGISTO COMERCIAL / OUTROS DADOS DE
              IDENTIFICAÇÃO, SE APLICÁVEL]
            </p>
            <p>
              Estes Termos e Condições regulam o acesso e a utilização do website, incluindo a
              criação e utilização de uma conta de cliente e, quando disponível, a compra de
              produtos e soluções (“Termos”). Ao aceder ao website ou ao criar uma conta, o
              utilizador (“Utilizador”) declara ter lido e aceitado estes Termos. Se não
              concordar, não deve utilizar o website.
            </p>
            <p>
              A criação de conta, a área de cliente e os pedidos de suporte encontram-se
              disponíveis. A compra de produtos com pagamento e entrega online ainda não está
              disponível; as secções sobre encomendas, pagamentos, entregas, devoluções e
              garantias descrevem o enquadramento previsto e serão completadas aquando do
              lançamento dessa funcionalidade.
            </p>
          </LegalSection>

          <LegalSection title="2. Utilização do website">
            <p>O Utilizador compromete-se a:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Fornecer informação verdadeira, completa e atualizada;</li>
              <li>
                Não utilizar o website para fins ilícitos, fraudulentos ou que prejudiquem o seu
                funcionamento ou o de terceiros;
              </li>
              <li>
                Não tentar aceder sem autorização a áreas, sistemas ou dados que não lhe sejam
                destinados, nem contornar as medidas de segurança do website.
              </li>
            </ul>
            <p>
              Reservamo-nos o direito de suspender ou limitar o acesso ao website, no todo ou em
              parte, em caso de utilização indevida.
            </p>
          </LegalSection>

          <LegalSection title="3. Conta de cliente">
            <p>
              Para aceder à área de cliente, o Utilizador deve criar uma conta com um endereço de
              email válido e uma palavra-passe que cumpra os requisitos de segurança indicados no
              formulário. É necessário aceitar estes Termos e a Política de Privacidade no
              momento do registo.
            </p>
            <p>
              O Utilizador é responsável por manter a confidencialidade das suas credenciais e por
              toda a atividade realizada na sua conta, devendo informar-nos de imediato em caso de
              suspeita de utilização não autorizada. Recomenda-se a utilização de uma
              palavra-passe única e a sua alteração periódica.
            </p>
            <p>
              Podemos suspender ou encerrar uma conta em caso de violação destes Termos, de
              utilização fraudulenta ou por razões de segurança. A suspensão impede o acesso à
              área de cliente enquanto durar. O Utilizador pode solicitar o encerramento da sua
              conta através dos contactos indicados abaixo.
            </p>
          </LegalSection>

          <LegalSection title="4. Produtos e informações apresentadas">
            <p>
              Procuramos que as informações sobre produtos e soluções — descrições,
              características e imagens — sejam rigorosas. Podem, ainda assim, conter imprecisões
              ou estar incompletas, nomeadamente enquanto o catálogo estiver em construção.
            </p>
            <p>
              Alguns conteúdos podem ser meramente ilustrativos ou de demonstração, destinados a
              mostrar o funcionamento previsto de determinada área, sem corresponderem a produtos,
              preços ou soluções efetivamente disponíveis. Sempre que isso aconteça, é
              identificado de forma clara.
            </p>
          </LegalSection>

          <LegalSection title="5. Preços e disponibilidade">
            <p>
              Os preços são apresentados em euros (€). [INDICAR SE OS PREÇOS INCLUEM IVA À TAXA
              LEGAL EM VIGOR E OUTROS ENCARGOS] Os preços e a disponibilidade podem ser
              alterados a qualquer momento, não constituindo uma oferta vinculativa até à
              confirmação de uma encomenda. Os preços aplicáveis a uma encomenda são os
              apresentados no momento em que esta é confirmada. [POLÍTICA DE PREÇOS A DEFINIR]
            </p>
          </LegalSection>

          <LegalSection title="6. Encomendas e pagamentos">
            <p>
              A funcionalidade de encomendas e pagamentos online ainda não está disponível. Quando
              for lançada, esta secção descreverá o processo de encomenda, a confirmação, os
              métodos de pagamento aceites e as condições aplicáveis.
            </p>
            <p>
              [DESCRIÇÃO DO PROCESSO DE ENCOMENDA E DOS MÉTODOS DE PAGAMENTO, A DEFINIR QUANDO A
              FUNCIONALIDADE ESTIVER DISPONÍVEL]
            </p>
          </LegalSection>

          <LegalSection title="7. Entregas e devoluções">
            <p>
              A funcionalidade de entregas ainda não está disponível. Quando for lançada, esta
              secção indicará os prazos, as transportadoras e os custos de envio aplicáveis.
            </p>
            <p>
              Nas compras à distância, o consumidor goza do direito de livre resolução, nos termos
              da lei portuguesa, que será respeitado e descrito nesta secção quando a venda de
              produtos estiver disponível. [POLÍTICA DE DEVOLUÇÕES E PRAZO DE LIVRE RESOLUÇÃO, A
              DEFINIR]
            </p>
          </LegalSection>

          <LegalSection title="8. Garantias">
            <p>
              Os bens vendidos através deste website beneficiarão das garantias legais aplicáveis
              em Portugal, nomeadamente o regime da compra e venda de bens de consumo. As
              condições específicas de garantia de cada produto serão disponibilizadas junto do
              respetivo produto. [CONDIÇÕES DE GARANTIA A DEFINIR]
            </p>
          </LegalSection>

          <LegalSection title="9. Propriedade intelectual">
            <p>
              Os conteúdos deste website — incluindo textos, imagens, logótipos, ícones e design —
              pertencem à {siteConfig.name} ou aos seus licenciantes e estão protegidos pela
              legislação de propriedade intelectual. É proibida a reprodução, distribuição ou
              utilização sem autorização prévia, salvo para uso pessoal e não comercial nos
              termos permitidos por lei.
            </p>
          </LegalSection>

          <LegalSection title="10. Responsabilidade">
            <p>
              Procuramos manter o website disponível, atualizado e livre de erros, mas não
              garantimos o seu funcionamento ininterrupto. Na medida permitida por lei, não
              respondemos por danos resultantes da impossibilidade de acesso ou utilização do
              website, nem pelo conteúdo de sites de terceiros para os quais este remeta.
            </p>
            <p>
              Nada nestes Termos exclui ou limita responsabilidades que não possam ser excluídas
              ou limitadas ao abrigo da lei portuguesa, nomeadamente os direitos dos consumidores.
            </p>
          </LegalSection>

          <LegalSection title="11. Proteção de dados">
            <p>
              O tratamento de dados pessoais é descrito na nossa{" "}
              <a
                href="/privacidade"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Política de Privacidade
              </a>
              , que faz parte integrante destes Termos.
            </p>
          </LegalSection>

          <LegalSection title="12. Reclamações e resolução de litígios">
            <p>
              O Utilizador pode apresentar reclamações através do Livro de Reclamações Eletrónico
              (www.livroreclamacoes.pt) [CONFIRMAR OBRIGAÇÃO E REGISTO DA ENTIDADE] ou através dos
              contactos abaixo.
            </p>
            <p>
              Em caso de litígio de consumo, o consumidor pode recorrer a uma entidade de
              resolução alternativa de litígios (RAL). [ENTIDADE RAL A INDICAR, OU DECLARAÇÃO DE
              ADESÃO A UM CENTRO DE ARBITRAGEM] Informação sobre as entidades disponíveis está em
              www.consumidor.gov.pt.
            </p>
          </LegalSection>

          <LegalSection title="13. Lei aplicável e foro">
            <p>
              Estes Termos regem-se pela lei portuguesa. [FORO COMPETENTE A DEFINIR] Em relação a
              consumidores, mantêm-se as regras imperativas de competência e proteção previstas na
              lei.
            </p>
          </LegalSection>

          <LegalSection title="14. Contacto">
            <p>Para questões relacionadas com estes Termos:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Email: [EMAIL DE CONTACTO]</li>
              <li>Morada: [MORADA DA EMPRESA]</li>
              <li>Entidade responsável: [NOME DA EMPRESA] [NIF]</li>
            </ul>
          </LegalSection>

          <LegalSection title="15. Alterações aos Termos">
            <p>
              Podemos atualizar estes Termos sempre que necessário, nomeadamente para refletir
              novas funcionalidades ou alterações legais. A data da última atualização consta no
              topo desta página. A utilização continuada do website após a atualização implica a
              aceitação dos Termos revistos.
            </p>
          </LegalSection>
        </div>
      </Container>
    </Section>
  );
}

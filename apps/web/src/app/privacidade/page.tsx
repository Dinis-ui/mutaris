import type { Metadata } from "next";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { LegalSection } from "@/components/legal/legal-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: `Como a ${siteConfig.name} recolhe, utiliza e protege os dados pessoais.`,
};

const LAST_UPDATED = "[DATA DA ÚLTIMA ATUALIZAÇÃO]";

export default function PrivacyPage() {
  return (
    <Section>
      <Container className="flex flex-col gap-12">
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-4xl">
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground">Última atualização: {LAST_UPDATED}</p>
        </header>

        <div className="flex max-w-3xl flex-col gap-10">
          <LegalSection title="1. Introdução">
            <p>
              Esta Política de Privacidade explica como a {siteConfig.name} (“nós”, “a nossa
              empresa”) recolhe, utiliza, partilha e protege os dados pessoais das pessoas que
              visitam este site ou utilizam os nossos serviços.
            </p>
            <p>
              Alguns conteúdos e funcionalidades descritos nesta política — como criação de conta,
              encomendas, pagamentos ou histórico de pedidos de suporte — ainda estão em
              desenvolvimento e podem não estar totalmente disponíveis no site neste momento. Esta
              política descreve também o que acontecerá quando essas funcionalidades forem
              lançadas, e será atualizada sempre que necessário.
            </p>
            <p>
              Ao utilizares este site, aceitas as práticas aqui descritas. Se tiveres dúvidas,
              podes contactar-nos através dos meios indicados na secção “Contacto”.
            </p>
          </LegalSection>

          <LegalSection title="2. Que dados podemos recolher">
            <p>Dependendo de como utilizas o site, podemos recolher, entre outros, os seguintes tipos de dados:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                Dados de identificação e contacto, como nome, email e número de telefone, quando
                os forneces através de um formulário (por exemplo, um pedido de suporte);
              </li>
              <li>
                Dados de morada e faturação, quando necessários para processar uma encomenda ou
                emitir uma fatura;
              </li>
              <li>
                Dados de conta, caso venhas a criar uma conta no site;
              </li>
              <li>
                Dados de navegação, como páginas visitadas ou tipo de dispositivo, recolhidos de
                forma automática através de cookies e tecnologias semelhantes (ver secção
                “Cookies”);
              </li>
              <li>
                Outros dados que decidas partilhar connosco de forma voluntária, por exemplo ao
                descreveres um problema ou uma necessidade.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="3. Como utilizamos os dados">
            <p>Utilizamos os dados recolhidos para, consoante o caso:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Responder a pedidos de contacto, suporte ou informação;</li>
              <li>Processar e acompanhar encomendas, quando esta funcionalidade estiver disponível;</li>
              <li>Gerir a tua conta, caso cries uma;</li>
              <li>Melhorar o funcionamento, a segurança e a experiência de utilização do site;</li>
              <li>Cumprir obrigações legais a que estejamos sujeitos.</li>
            </ul>
            <p>
              Não utilizamos os teus dados para fins diferentes dos indicados nesta política sem
              te informar previamente.
            </p>
          </LegalSection>

          <LegalSection title="4. Cookies">
            <p>
              Cookies são pequenos ficheiros guardados no teu dispositivo que ajudam um site a
              funcionar corretamente e a lembrar-se de certas preferências.
            </p>
            <p>
              Atualmente, este site utiliza apenas cookies técnicos, necessários ao seu
              funcionamento básico. Não utilizamos, neste momento, cookies de análise ou de
              marketing. Caso isso venha a mudar, esta política será atualizada e, sempre que a lei
              o exigir, pedimos o teu consentimento antes de os ativar.
            </p>
            <p>
              Podes gerir ou desativar cookies nas definições do teu navegador, embora isso possa
              afetar o funcionamento de algumas partes do site.
            </p>
          </LegalSection>

          <LegalSection title="5. Partilha e armazenamento de dados">
            <p>
              Não vendemos nem alugamos os teus dados pessoais a terceiros.
            </p>
            <p>
              Podemos recorrer a prestadores de serviços externos que nos ajudam a operar o site e
              a prestar os nossos serviços — por exemplo, alojamento do site, processamento de
              encomendas, processamento de pagamentos ou envio de comunicações. Esses prestadores
              só têm acesso aos dados necessários para prestar o serviço contratado e apenas
              seguindo as nossas instruções. [LISTA DE PRESTADORES/FORNECEDORES, QUANDO APLICÁVEL]
            </p>
            <p>
              Os teus dados são guardados apenas durante o tempo necessário para cumprir as
              finalidades descritas nesta política ou para cumprir obrigações legais.
            </p>
          </LegalSection>

          <LegalSection title="6. Direitos do utilizador">
            <p>
              Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD), tens, entre outros,
              os seguintes direitos sobre os teus dados pessoais:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Direito de acesso aos dados que temos sobre ti;</li>
              <li>Direito de retificação de dados incorretos ou incompletos;</li>
              <li>Direito ao apagamento dos teus dados, nos casos previstos na lei;</li>
              <li>Direito à limitação do tratamento;</li>
              <li>Direito à portabilidade dos dados;</li>
              <li>Direito de oposição ao tratamento, em determinadas circunstâncias;</li>
              <li>Direito a retirar o consentimento a qualquer momento, quando o tratamento se basear em consentimento.</li>
            </ul>
            <p>
              Para exercer qualquer um destes direitos, contacta-nos através dos meios indicados na
              secção “Contacto”. Tens também o direito de apresentar uma reclamação junto da
              Comissão Nacional de Proteção de Dados (CNPD), a autoridade de controlo em Portugal.
            </p>
          </LegalSection>

          <LegalSection title="7. Segurança dos dados">
            <p>
              Procuramos adotar medidas técnicas e organizativas adequadas para proteger os teus
              dados pessoais contra acesso não autorizado, perda, alteração ou divulgação indevida.
            </p>
            <p>
              Nenhum sistema é totalmente seguro. Caso venhamos a ter conhecimento de um incidente
              que afete os teus dados pessoais, atuaremos em conformidade com as obrigações legais
              aplicáveis.
            </p>
          </LegalSection>

          <LegalSection title="8. Contacto">
            <p>
              Para questões relacionadas com esta Política de Privacidade ou com os teus dados
              pessoais, podes contactar-nos através de:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Email: [EMAIL DE CONTACTO/PRIVACIDADE]</li>
              <li>Morada: [MORADA DA EMPRESA]</li>
              <li>Entidade responsável: [NOME DA ENTIDADE/EMPRESA RESPONSÁVEL] [NIF]</li>
              <li>Encarregado de Proteção de Dados (quando aplicável): [CONTACTO DO DPO]</li>
            </ul>
          </LegalSection>

          <LegalSection title="9. Alterações a esta política">
            <p>
              Podemos atualizar esta Política de Privacidade sempre que necessário, nomeadamente
              para refletir novas funcionalidades do site ou alterações legais. A data da última
              atualização está indicada no topo desta página. Recomendamos que a consultes
              periodicamente.
            </p>
          </LegalSection>
        </div>
      </Container>
    </Section>
  );
}

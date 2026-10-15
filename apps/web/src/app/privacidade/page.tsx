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
          <LegalSection title="1. Âmbito e responsável pelo tratamento">
            <p>
              A presente Política de Privacidade descreve a forma como a {siteConfig.name}
              (“Responsável pelo Tratamento”, “nós”) recolhe, utiliza, conserva e protege os dados
              pessoais das pessoas que visitam este website ou utilizam a respetiva área de
              cliente (“Utilizador”), em conformidade com o Regulamento Geral sobre a Proteção de
              Dados (RGPD – Regulamento (UE) 2016/679) e a legislação nacional aplicável.
            </p>
            <p>
              Responsável pelo tratamento: [NOME DA EMPRESA / EMPRESÁRIO EM NOME INDIVIDUAL],
              NIF [NIF], com sede em [MORADA DA EMPRESA].
            </p>
            <p>
              As funcionalidades de criação de conta, área de cliente e pedidos de suporte estão
              disponíveis. A compra de produtos com pagamento e entrega online ainda não se
              encontra disponível; esta política será atualizada quando esta funcionalidade for
              lançada, nomeadamente quanto aos dados de faturação, pagamento e entrega.
            </p>
          </LegalSection>

          <LegalSection title="2. Dados pessoais tratados">
            <p>Consoante a utilização do website, tratamos as seguintes categorias de dados:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <strong className="font-medium text-foreground">Dados de conta:</strong> nome,
                endereço de email e palavra-passe. A palavra-passe nunca é guardada em texto:
                conservamos apenas um código criptográfico irreversível (hash);
              </li>
              <li>
                <strong className="font-medium text-foreground">Dados de perfil:</strong> número
                de telefone, se o Utilizador optar por o indicar;
              </li>
              <li>
                <strong className="font-medium text-foreground">Pedidos de suporte:</strong>{" "}
                categoria, assunto, mensagem e estado do pedido, bem como as respostas a esses
                pedidos;
              </li>
              <li>
                <strong className="font-medium text-foreground">Encomendas:</strong> o registo e o
                estado das encomendas associadas à conta;
              </li>
              <li>
                <strong className="font-medium text-foreground">Dados técnicos e de segurança:</strong>{" "}
                dados de sessão (data de início de cada sessão ativa) e o endereço IP, utilizado
                exclusivamente para limitar tentativas de início de sessão (ver secção 5).
              </li>
            </ul>
            <p>
              Não recolhemos categorias especiais de dados. Pedimos ao Utilizador que não inclua
              dados sensíveis, nem dados de terceiros, nas mensagens que nos envia.
            </p>
          </LegalSection>

          <LegalSection title="3. Finalidades e fundamentos de licitude">
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <strong className="font-medium text-foreground">
                  Criar e gerir a conta do Utilizador e disponibilizar a área de cliente:
                </strong>{" "}
                execução do contrato ou de diligências pré-contratuais a pedido do Utilizador
                (artigo 6.º, n.º 1, alínea b), do RGPD);
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Responder a pedidos de suporte e de contacto:
                </strong>{" "}
                execução de diligências a pedido do Utilizador e interesse legítimo em prestar um
                serviço adequado (alíneas b) e f));
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Processar e acompanhar encomendas, quando disponível:
                </strong>{" "}
                execução do contrato (alínea b));
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Garantir a segurança do website e das contas:
                </strong>{" "}
                interesse legítimo em prevenir abusos e acessos não autorizados (alínea f));
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Cumprir obrigações legais, nomeadamente fiscais e de faturação:
                </strong>{" "}
                cumprimento de obrigação jurídica (alínea c)).
              </li>
            </ul>
            <p>
              Não utilizamos os dados pessoais para decisões exclusivamente automatizadas com
              efeitos jurídicos para o Utilizador, nem para fins de marketing sem o seu
              consentimento prévio.
            </p>
          </LegalSection>

          <LegalSection title="4. Cookies e armazenamento no dispositivo">
            <p>
              Este website utiliza apenas cookies estritamente necessários ao seu funcionamento,
              que não requerem consentimento:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                um cookie de sessão da área de cliente, criado quando o Utilizador inicia sessão,
                com a duração máxima de 7 dias ou até o Utilizador terminar a sessão;
              </li>
              <li>
                cookies de sessão de uso interno, exclusivos da área de administração do website.
              </li>
            </ul>
            <p>
              Estes cookies são do tipo “HttpOnly” e “Secure”, não são acessíveis por scripts do
              website e não são utilizados para publicidade ou monitorização. O carrinho de
              compras é mantido apenas na memória do navegador, não sendo guardado no dispositivo
              após fechar o separador.
            </p>
            <p>
              Atualmente não utilizamos cookies de análise, de personalização ou de marketing. Se
              tal vier a ocorrer, esta política será atualizada e o consentimento do Utilizador
              será solicitado antes da respetiva ativação.
            </p>
          </LegalSection>

          <LegalSection title="5. Endereço IP e segurança do acesso">
            <p>
              Para proteger as contas contra tentativas de adivinhação de palavras-passe,
              registamos as tentativas de início de sessão falhadas associadas ao endereço IP e ao
              email indicado. Estes registos são guardados apenas sob a forma de código
              criptográfico (hash), sem o endereço IP ou o email em texto, deixam de ser
              considerados após 15 minutos e são eliminados automaticamente pelo sistema.
            </p>
            <p>
              As ações realizadas pelos administradores do website na área de administração ficam
              registadas num registo de atividade, para efeitos de segurança e de rastreabilidade.
            </p>
          </LegalSection>

          <LegalSection title="6. Destinatários e subcontratantes">
            <p>
              Não vendemos nem cedemos os dados pessoais a terceiros para fins comerciais. Para
              operar o website recorremos a prestadores de serviços que atuam como
              subcontratantes, mediante contratos que impõem o cumprimento do RGPD:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <strong className="font-medium text-foreground">Vercel Inc.:</strong> alojamento
                do website e armazenamento das imagens dos produtos;
              </li>
              <li>
                <strong className="font-medium text-foreground">Neon, Inc.:</strong> serviço de
                base de dados onde são guardados os dados da conta, pedidos de suporte e
                encomendas (região de armazenamento: [REGIÃO DA BASE DE DADOS]);
              </li>
              <li>[OUTROS PRESTADORES, QUANDO APLICÁVEL: PAGAMENTOS, ENVIO DE EMAIL, TRANSPORTE]</li>
            </ul>
            <p>
              Podemos ainda comunicar dados a autoridades públicas quando tal seja exigido por lei.
            </p>
          </LegalSection>

          <LegalSection title="7. Transferências internacionais">
            <p>
              Os prestadores acima identificados são entidades com sede nos Estados Unidos da
              América, pelo que podem ocorrer transferências de dados pessoais para fora do
              Espaço Económico Europeu. Essas transferências assentam em mecanismos previstos no
              RGPD, como decisões de adequação da Comissão Europeia (incluindo o Quadro de
              Privacidade de Dados UE–EUA) ou cláusulas contratuais-tipo, e em medidas de
              segurança complementares. [CONFIRMAR O MECANISMO APLICÁVEL A CADA PRESTADOR]
            </p>
          </LegalSection>

          <LegalSection title="8. Prazos de conservação">
            <p>Conservamos os dados apenas pelo período necessário às finalidades indicadas:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Dados de conta e perfil: enquanto a conta se mantiver ativa;</li>
              <li>Pedidos de suporte: [PRAZO DE CONSERVAÇÃO DOS PEDIDOS DE SUPORTE];</li>
              <li>
                Dados de encomendas e de faturação: pelo período exigido pela legislação fiscal e
                comercial aplicável;
              </li>
              <li>Registo de atividade da administração: [PRAZO DE CONSERVAÇÃO DO REGISTO].</li>
            </ul>
            <p>
              Terminado o prazo aplicável, os dados são eliminados ou anonimizados, salvo
              obrigação legal de conservação.
            </p>
          </LegalSection>

          <LegalSection title="9. Direitos do titular dos dados">
            <p>Nos termos do RGPD, o Utilizador tem o direito de:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>aceder aos dados pessoais que lhe digam respeito;</li>
              <li>solicitar a retificação de dados inexatos ou incompletos;</li>
              <li>solicitar o apagamento dos dados, nos casos previstos na lei;</li>
              <li>solicitar a limitação do tratamento;</li>
              <li>receber os seus dados num formato estruturado (portabilidade);</li>
              <li>opor-se ao tratamento baseado em interesse legítimo;</li>
              <li>
                retirar o consentimento a qualquer momento, sem comprometer a licitude do
                tratamento anterior, quando o tratamento se baseie no consentimento.
              </li>
            </ul>
            <p>
              O Utilizador pode corrigir o nome e o telefone diretamente na área de cliente. Para
              exercer os restantes direitos, incluindo o pedido de apagamento da conta, deve
              contactar-nos através dos meios indicados na secção “Contacto”. Responderemos no
              prazo legal de um mês, que pode ser prorrogado nos termos do RGPD.
            </p>
            <p>
              O Utilizador tem ainda o direito de apresentar reclamação junto da Comissão Nacional
              de Proteção de Dados (CNPD), autoridade de controlo em Portugal (www.cnpd.pt).
            </p>
          </LegalSection>

          <LegalSection title="10. Segurança">
            <p>
              Adotamos medidas técnicas e organizativas adequadas à proteção dos dados pessoais,
              incluindo a comunicação cifrada (HTTPS), o armazenamento das palavras-passe apenas
              sob a forma de hash, sessões com cookies protegidos e limitação de tentativas de
              início de sessão. Nenhum sistema é totalmente seguro; em caso de violação de dados
              pessoais, atuaremos de acordo com as obrigações legais aplicáveis, incluindo a
              notificação à CNPD e aos titulares afetados quando exigido.
            </p>
          </LegalSection>

          <LegalSection title="11. Contacto">
            <p>
              Para questões relacionadas com esta política ou com os dados pessoais do Utilizador:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>Email: [EMAIL DE CONTACTO/PRIVACIDADE]</li>
              <li>Morada: [MORADA DA EMPRESA]</li>
              <li>Entidade responsável: [NOME DA EMPRESA] [NIF]</li>
              <li>Encarregado de Proteção de Dados (quando aplicável): [CONTACTO DO DPO]</li>
            </ul>
          </LegalSection>

          <LegalSection title="12. Alterações a esta política">
            <p>
              Esta política pode ser atualizada para refletir novas funcionalidades do website ou
              alterações legais. A data da última atualização consta no topo desta página e, em
              caso de alterações relevantes, os Utilizadores com conta serão informados por meios
              adequados.
            </p>
          </LegalSection>
        </div>
      </Container>
    </Section>
  );
}

"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { TabelaDados } from "@/componentes/ui/TabelaDados";
import { formatarData } from "@/lib/utilitarios/datas";
import { useBarbeariasAdmin } from "@/hooks/useAdmin";

export default function AdminBarbeariasPage() {
  const { dados, carregando, erro, recarregar } = useBarbeariasAdmin();

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Listagem administrativa das barbearias cadastradas com seus respectivos responsaveis."
        subtitulo="Barbearias"
        titulo="Barbearias do sistema"
      />

      {carregando ? <EstadoCarregando texto="Carregando barbearias..." /> : null}
      {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
      {!carregando && !erro && !dados?.length ? (
        <EstadoVazio descricao="Nenhuma barbearia encontrada." titulo="Lista vazia" />
      ) : null}
      {dados?.length ? (
        <TabelaDados
          colunas={[
            { chave: "nome", titulo: "Nome", renderizar: (linha) => linha.nome },
            { chave: "responsavel", titulo: "Responsavel", renderizar: (linha) => linha.responsavelNome },
            { chave: "telefone", titulo: "Telefone", renderizar: (linha) => linha.telefone },
            { chave: "endereco", titulo: "Endereco", renderizar: (linha) => linha.endereco },
            { chave: "criadoEm", titulo: "Criado em", renderizar: (linha) => formatarData(linha.criadoEm) }
          ]}
          linhas={dados}
        />
      ) : null}
    </div>
  );
}


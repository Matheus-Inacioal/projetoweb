"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { TabelaDados } from "@/componentes/ui/TabelaDados";
import { formatarData } from "@/lib/utilitarios/datas";
import { useUsuariosAdmin } from "@/hooks/useAdmin";

export default function AdminUsuariosPage() {
  const { dados, carregando, erro, recarregar } = useUsuariosAdmin();

  return (
    <div className="space-y-6">
      <CabecalhoPagina descricao="Listagem basica de usuarios cadastrados na plataforma." subtitulo="Usuarios" titulo="Usuarios do sistema" />

      {carregando ? <EstadoCarregando texto="Carregando usuarios..." /> : null}
      {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
      {!carregando && !erro && !dados?.length ? (
        <EstadoVazio descricao="Nenhum usuario encontrado." titulo="Lista vazia" />
      ) : null}
      {dados?.length ? (
        <TabelaDados
          colunas={[
            { chave: "nome", titulo: "Nome", renderizar: (linha) => linha.nome },
            { chave: "email", titulo: "E-mail", renderizar: (linha) => linha.email },
            { chave: "perfil", titulo: "Perfil", renderizar: (linha) => linha.perfil },
            { chave: "criadoEm", titulo: "Criado em", renderizar: (linha) => formatarData(linha.criadoEm) }
          ]}
          linhas={dados}
        />
      ) : null}
    </div>
  );
}


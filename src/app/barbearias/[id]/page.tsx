import { redirect } from "next/navigation";

export default function BarbeariaDetalhesPage({ params }: { params: { id: string } }) {
  redirect(`/lojas/${params.id}`);
}

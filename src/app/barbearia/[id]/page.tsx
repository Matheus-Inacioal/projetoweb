import { redirect } from "next/navigation";

export default function BarbeariaSingularDetalhesPage({ params }: { params: { id: string } }) {
  redirect(`/lojas/${params.id}`);
}

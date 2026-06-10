import PropertyDetailPage from "@/components/pages/PropertyDetailPage";

export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetailPage params={params} />;
}

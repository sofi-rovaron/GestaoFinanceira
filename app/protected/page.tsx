import DashboardFinanceiro from "./graficos/page";

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <DashboardFinanceiro />
    </div>
  );
}

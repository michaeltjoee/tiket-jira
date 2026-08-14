import QueryProvider from "@/components/QueryProvider";
import WorkbenchNav from "@/components/WorkbenchNav";

export default function WorkbenchLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="workbench">
      <WorkbenchNav />
      <div className="workbench_main">
        <QueryProvider>{children}</QueryProvider>
      </div>
    </div>
  );
}

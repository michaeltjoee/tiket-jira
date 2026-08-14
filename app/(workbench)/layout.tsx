import WorkbenchNav from "@/components/WorkbenchNav";

export default function WorkbenchLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="workbench">
      <WorkbenchNav />
      <div className="workbench_main">{children}</div>
    </div>
  );
}

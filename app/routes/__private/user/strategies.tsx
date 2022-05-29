import { Outlet } from "@remix-run/react";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const Strategies = () => {
  return (
    <div className="flex flex-col h-full">
      <Outlet />
    </div>
  );
};

export default Strategies;

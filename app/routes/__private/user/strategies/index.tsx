import Button from "@dvargas92495/app/components/Button";
import { Link } from "@remix-run/react";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const StrategiesPage = () => {
  return (
    <>
      <div className="flex-grow">History</div>
      <Link to={"new"}>
        <Button type="button">+ New</Button>
      </Link>
    </>
  );
};

export default StrategiesPage;

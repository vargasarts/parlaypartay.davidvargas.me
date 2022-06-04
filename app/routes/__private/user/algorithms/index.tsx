import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import Button from "@dvargas92495/app/components/Button";
import Table from "@dvargas92495/app/components/Table";
import { Link, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import listAlgorithmsByUser from "~/data/listAlgorithmsByUser.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const AlgorithmsPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex-grow">
        <Table onRowClick={(row) => navigate(row.id)} />
      </div>
      <Link to={"new"}>
        <Button type="button">+ New</Button>
      </Link>
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, listAlgorithmsByUser);
};

export default AlgorithmsPage;

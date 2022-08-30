import { Form, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import Button from "@dvargas92495/app/components/Button";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
// import CodeInput from "@dvargas92495/app/components/CodeInput";
import Textarea from "@dvargas92495/app/components/Textarea";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import getAlgorithmByUuid from "~/data/getAlgorithmByUuid.server";
import updateAlgorithm from "~/data/updateAlgorithm.server";
import deleteAlgorithm from "~/data/deleteAlgorithm.server";
import SuccessfulActionToast from "@dvargas92495/app/components/SuccessfulActionToast";

type AlgorithmData = Awaited<ReturnType<typeof getAlgorithmByUuid>>;

const SingleAlgorithmPage = () => {
  const data = useLoaderData<AlgorithmData>();
  return (
    <div className="flex-grow flex flex-col gap-3">
      <Form className="flex-grow flex flex-col" method="put">
        <div className="flex-grow overflow-y-auto">
          {/* <CodeInput
          language="js"
          name={"logic"}
          label={"Logic"}
          defaultValue={`return Math.random() < 0.5`}
        /> */}
          <Textarea
            name={"logic"}
            label={"Logic"}
            defaultValue={data.logic}
            className={"font-mono"}
          />
        </div>
        <div className="flex justify-end">
          <Button>Update</Button>
        </div>
        <SuccessfulActionToast message="Successfully Saved Algorithm!" />
      </Form>
      <Form method={"delete"} className="flex justify-end">
        <Button className="bg-red-400">Delete</Button>
      </Form>
    </div>
  );
};

const Title = (data: AlgorithmData) => {
  return <>{data?.label}</>;
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, ({ params, context: { requestId } }) =>
    getAlgorithmByUuid(params["uuid"] || "", requestId)
  );
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, {
    PUT: updateAlgorithm,
    DELETE: (args) =>
      deleteAlgorithm(args).then(() => redirect(`/user/algorithms`)),
  });
};

export const handle = {
  Title,
};

export default SingleAlgorithmPage;

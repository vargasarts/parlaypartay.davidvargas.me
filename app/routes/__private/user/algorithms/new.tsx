import { Form } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import createAlgorithm from "~/data/createAlgorithm.server";
import Button from "@dvargas92495/app/components/Button";
import TextInput from "@dvargas92495/app/components/TextInput";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import CodeInput from "@dvargas92495/app/components/CodeInput";

const NewAlgorithmPage = () => {
  return (
    <Form className="flex-grow flex flex-col" method="post">
      <div className="flex-grow overflow-y-auto">
        <TextInput label="Label" name="label" />
        <CodeInput language="js" name={"logic"} label={"Logic"} />
      </div>
      <Button>Generate</Button>
    </Form>
  );
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, createAlgorithm);
};

export default NewAlgorithmPage;
